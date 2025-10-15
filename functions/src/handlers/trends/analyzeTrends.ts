/**
 * analyzeTrends Function
 * 傾向分析API（企業データ集計、Geminiサマリー生成）
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {generateTrendAnalysisPrompt} from "../../prompts/trendAnalysisPrompt";
import {retryWithBackoff} from "../../utils/retry";

/**
 * 傾向分析結果の型
 */
interface TrendSummary {
  overallTrend: string;
  topIndustries: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  commonKeywords: Array<{
    word: string;
    count: number;
  }>;
  recommendedSkills: string[];
}

/**
 * analyzeTrends リクエスト
 */
interface AnalyzeTrendsRequest {
  // パラメータなし
}

/**
 * analyzeTrends レスポンス
 */
interface AnalyzeTrendsResponse {
  success: boolean;
  summary: TrendSummary;
  analyzedAt: string;
  companyCount: number;
}

/**
 * Gemini APIクライアントの初期化
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * 傾向分析Function
 *
 * 処理フロー:
 * 1. 認証チェック
 * 2. 企業数チェック（< 3社の場合エラー）
 * 3. 全企業データ取得
 * 4. Gemini APIでサマリー生成
 * 5. Firestoreに保存（trends/latest に上書き）
 * 6. 分析結果を返す
 */
export const analyzeTrends = onCall<
  AnalyzeTrendsRequest,
  Promise<AnalyzeTrendsResponse>
>(
  {
    region: "asia-northeast1",
    cors: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      /https:\/\/.*\.web\.app$/,
      /https:\/\/.*\.firebaseapp\.com$/,
    ],
  },
  async (request) => {
    // 1. 認証チェック
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です");
    }

    const userId = request.auth.uid;

    try {
      console.log(`[analyzeTrends] 傾向分析を開始: userId=${userId}`);

      // 2. 全企業データ取得
      const companiesRef = db.collection("users").doc(userId).collection("companies");
      const companiesSnapshot = await companiesRef.get();

      const companies = companiesSnapshot.docs.map((doc) => ({
        companyId: doc.id,
        companyName: doc.data().companyName as string,
        analysis: {
          businessOverview: doc.data().analysis.businessOverview as string,
          industryPosition: doc.data().analysis.industryPosition as string,
          strengths: doc.data().analysis.strengths as string[],
        },
      }));

      // 3. 企業数チェック
      if (companies.length < 3) {
        throw new HttpsError(
          "failed-precondition",
          `傾向分析には最低3社の企業登録が必要です（現在: ${companies.length}社）`
        );
      }

      console.log(`[analyzeTrends] 企業データ取得完了: ${companies.length}社`);

      // 4. Gemini APIでサマリー生成
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const prompt = generateTrendAnalysisPrompt(companies);

      console.log("==================== Gemini API Request (Trend Analysis) ====================");
      console.log(`企業数: ${companies.length}`);
      console.log("--- プロンプト ---");
      console.log(prompt);
      console.log("=============================================================================");

      // Gemini APIを呼び出し（リトライ付き）
      const result = await retryWithBackoff(async () => {
        return await model.generateContent(prompt);
      }, 3, 1000);

      const response = result.response;
      const text = response.text();

      console.log("==================== Gemini API Response (Trend Analysis) ====================");
      console.log("--- レスポンス（JSON） ---");
      console.log(text);
      console.log("=============================================================================");

      // JSONをパース
      let summary: TrendSummary;
      try {
        summary = JSON.parse(text) as TrendSummary;
      } catch (error) {
        throw new Error(`Failed to parse Gemini API response: ${text}`);
      }

      const now = new Date().toISOString();

      // 5. Firestoreに保存（trends/latest に上書き）
      const trendsRef = db.collection("users").doc(userId).collection("trends");
      await trendsRef.doc("latest").set({
        summary,
        sourceCompanies: companies.map((c) => ({
          companyId: c.companyId,
          companyName: c.companyName,
        })),
        analyzedAt: now,
        companyCount: companies.length,
        modelUsed: "gemini-2.0-flash-exp",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[analyzeTrends] 傾向分析完了: ${companies.length}社`);

      // 6. 分析結果を返す
      return {
        success: true,
        summary,
        analyzedAt: now,
        companyCount: companies.length,
      };
    } catch (error) {
      console.error(`[analyzeTrends] エラー発生: ${(error as Error).message}`);
      console.error(error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        `傾向分析に失敗しました: ${(error as Error).message}`
      );
    }
  }
);
