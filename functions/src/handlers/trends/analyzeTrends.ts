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
  matchInsights?: {
    highMatchCompanies: Array<{
      companyName: string;
      avgMatchRate: number;
      reason: string;
    }>;
    lowMatchCompanies: Array<{
      companyName: string;
      avgMatchRate: number;
      reason: string;
    }>;
    recommendedJobPositions: Array<{
      position: string;
      avgMatchRate: number;
      reason: string;
    }>;
    careerAdvice: string;
  } | null;
}

/**
 * analyzeTrends リクエスト
 * パラメータなし
 */
type AnalyzeTrendsRequest = Record<string, never>;

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
 * @return {GoogleGenerativeAI} Gemini APIクライアント
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * GeminiのレスポンスJSONをサニタイズ
 * よくある構文エラーを修正する
 * @param {string} text - サニタイズするJSON文字列
 * @return {string} サニタイズされたJSON文字列
 */
function sanitizeJSON(text: string): string {
  let sanitized = text;

  // 1. 配列内の不正な閉じカッコ（例: }] を },）に修正
  sanitized = sanitized.replace(/\]\s*,/g, "},");

  // 2. オブジェクトの最後の要素の後の余分なカンマを削除（例: {"key": "value",} -> {"key": "value"}）
  sanitized = sanitized.replace(/,\s*}/g, "}");
  sanitized = sanitized.replace(/,\s*\]/g, "]");

  // 3. 複数の連続したカンマを1つに統一
  sanitized = sanitized.replace(/,\s*,+/g, ",");

  return sanitized;
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
      const companiesRef = db
        .collection("users")
        .doc(userId)
        .collection("companies");
      const companiesSnapshot = await companiesRef.get();

      const companies = companiesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const analysis = data.analysis;

        // 新データ構造と旧データ構造の両方をサポート
        const businessOverview =
          analysis?.corporateProfile?.businessSummary ||
          analysis?.businessOverview ||
          "";
        const industryPosition =
          analysis?.marketAnalysis?.industry ||
          analysis?.marketAnalysis?.industryPosition ||
          analysis?.industryPosition ||
          "";
        const strengths =
          analysis?.marketAnalysis?.strengths ||
          analysis?.strengths ||
          [];

        return {
          companyId: doc.id,
          companyName: data.companyName as string,
          analysis: {
            businessOverview,
            industryPosition,
            strengths,
          },
        };
      });

      // 2.5. イベント・レビューデータ取得（マッチ度分析用）
      const eventsRef = db
        .collection("users")
        .doc(userId)
        .collection("events");
      const eventsSnapshot = await eventsRef.get();

      const reviewedEvents = eventsSnapshot.docs
        .filter((doc) => doc.data().review !== undefined) // レビュー済みイベントのみ
        .map((doc) => {
          const data = doc.data();
          return {
            companyName: data.companyName as string,
            eventType: data.eventType as string,
            jobPosition: data.jobPosition as string | undefined,
            review: data.review as {
              feedback: string;
              companyMatchRate: number;
              jobMatchRate: number;
              reviewedAt: string;
            },
          };
        });

      console.log(
        `[analyzeTrends] レビューデータ取得完了: ${reviewedEvents.length}件`
      );

      // 2.6. レビューデータの統計計算
      let reviewStats = null;
      if (reviewedEvents.length > 0) {
        // 職種別の統計（企業リストも含める）
        type JobPositionCompany = {
          companyName: string;
          eventType: string;
          matchRate: number;
        };
        const jobPositionMap = new Map<
          string,
          {
            count: number;
            totalCompanyMatch: number;
            totalJobMatch: number;
            companies: Array<JobPositionCompany>;
          }
        >();
        reviewedEvents.forEach((event) => {
          if (event.jobPosition) {
            const existing = jobPositionMap.get(event.jobPosition) || {
              count: 0,
              totalCompanyMatch: 0,
              totalJobMatch: 0,
              companies: [],
            };
            existing.count++;
            existing.totalCompanyMatch += event.review.companyMatchRate;
            existing.totalJobMatch += event.review.jobMatchRate;
            const avgMatchRate =
              (event.review.companyMatchRate +
                event.review.jobMatchRate) /
              2;
            existing.companies.push({
              companyName: event.companyName,
              eventType: event.eventType,
              matchRate: avgMatchRate,
            });
            jobPositionMap.set(event.jobPosition, existing);
          }
        });

        const jobPositionStats = Array.from(
          jobPositionMap.entries()
        ).map(([position, stats]) => ({
          position,
          count: stats.count,
          avgCompanyMatch: stats.totalCompanyMatch / stats.count,
          avgJobMatch: stats.totalJobMatch / stats.count,
          companies: stats.companies, // 企業リストを追加
        }));

        // 企業別の統計
        type CompanyStats = {
          count: number;
          totalCompanyMatch: number;
          totalJobMatch: number;
        };
        const companyMap = new Map<string, CompanyStats>();
        reviewedEvents.forEach((event) => {
          const existing = companyMap.get(event.companyName) || {
            count: 0,
            totalCompanyMatch: 0,
            totalJobMatch: 0,
          };
          existing.count++;
          existing.totalCompanyMatch += event.review.companyMatchRate;
          existing.totalJobMatch += event.review.jobMatchRate;
          companyMap.set(event.companyName, existing);
        });

        const companyStats = Array.from(companyMap.entries()).map(
          ([companyName, stats]) => ({
            companyName,
            reviewCount: stats.count,
            avgCompanyMatch: stats.totalCompanyMatch / stats.count,
            avgJobMatch: stats.totalJobMatch / stats.count,
          })
        );

        // マッチ度の分布計算（1-5の各レベルの件数）
        // [1の件数, 2の件数, ..., 5の件数]
        const companyMatchDistribution = [0, 0, 0, 0, 0];
        const jobMatchDistribution = [0, 0, 0, 0, 0];
        reviewedEvents.forEach((event) => {
          companyMatchDistribution[event.review.companyMatchRate - 1]++;
          jobMatchDistribution[event.review.jobMatchRate - 1]++;
        });

        const totalCompanyMatch = reviewedEvents.reduce(
          (sum, e) => sum + e.review.companyMatchRate,
          0
        );
        const totalJobMatch = reviewedEvents.reduce(
          (sum, e) => sum + e.review.jobMatchRate,
          0
        );

        reviewStats = {
          totalReviews: reviewedEvents.length,
          jobPositionStats,
          companyStats,
          companyMatchDistribution,
          jobMatchDistribution,
          avgCompanyMatch: totalCompanyMatch / reviewedEvents.length,
          avgJobMatch: totalJobMatch / reviewedEvents.length,
        };
      }

      // 3. 企業数チェック
      if (companies.length < 3) {
        throw new HttpsError(
          "failed-precondition",
          "傾向分析には最低3社の企業登録が必要です" +
            `（現在: ${companies.length}社）`
        );
      }

      console.log(
        `[analyzeTrends] 企業データ取得完了: ${companies.length}社`
      );

      // 4. Gemini APIでサマリー生成
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const prompt = generateTrendAnalysisPrompt(companies, reviewedEvents);

      console.log(
        "==================== Gemini API Request " +
          "(Trend Analysis) ===================="
      );
      console.log(`企業数: ${companies.length}`);
      console.log("--- プロンプト ---");
      console.log(prompt);
      console.log(
        "======================================" +
          "======================================="
      );

      // Gemini APIを呼び出し（リトライ付き）
      const result = await retryWithBackoff(async () => {
        return await model.generateContent(prompt);
      }, 3, 1000);

      const response = result.response;
      const text = response.text();

      console.log(
        "==================== Gemini API Response " +
          "(Trend Analysis) ===================="
      );
      console.log("--- レスポンス（JSON） ---");
      console.log(text);
      console.log(
        "======================================" +
          "======================================="
      );

      // JSONをパース（サニタイゼーション付き）
      let summary: TrendSummary;
      try {
        summary = JSON.parse(text) as TrendSummary;
      } catch (error) {
        console.warn(
          "[analyzeTrends] 初回JSONパース失敗、" +
            "サニタイゼーション後に再試行"
        );
        console.log("--- サニタイゼーション前のJSON ---");
        console.log(text);

        // JSONをサニタイズして再パース
        const sanitizedText = sanitizeJSON(text);
        console.log("--- サニタイゼーション後のJSON ---");
        console.log(sanitizedText);

        try {
          summary = JSON.parse(sanitizedText) as TrendSummary;
          console.log(
            "[analyzeTrends] サニタイゼーション後のパース成功"
          );
        } catch (retryError) {
          console.error(
            "[analyzeTrends] サニタイゼーション後もパース失敗"
          );
          throw new Error(
            "Failed to parse Gemini API response " +
              `even after sanitization. Original: ${text}, ` +
              `Sanitized: ${sanitizedText}`
          );
        }
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
        reviewStats, // レビュー統計データ
        analyzedAt: now,
        companyCount: companies.length,
        modelUsed: "gemini-2.0-flash-exp",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(
        `[analyzeTrends] 傾向分析完了: ${companies.length}社`
      );

      // 6. 分析結果を返す
      // ※reviewStatsはFirestoreから取得されるため、レスポンスには含めない
      return {
        success: true,
        summary,
        analyzedAt: now,
        companyCount: companies.length,
      };
    } catch (error) {
      console.error(
        `[analyzeTrends] エラー発生: ${(error as Error).message}`
      );
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
