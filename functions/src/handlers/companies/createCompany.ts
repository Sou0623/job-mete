/**
 * createCompany Function
 * 企業登録API（重複チェック、Gemini分析、Firestore保存）
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {normalizeCompanyName} from "../../utils/normalizer";
import {validateCompanyName} from "../../utils/validators";
import {analyzeCompanyWithGemini} from "../../services/geminiService";
import type {
  CreateCompanyRequest,
  CreateCompanyResponse,
} from "../../types";

/**
 * 企業登録Function
 *
 * 処理フロー:
 * 1. 認証チェック
 * 2. 企業名バリデーション
 * 3. 企業名正規化
 * 4. 重複チェック
 * 5. 重複時は既存企業情報を返す
 * 6. 新規の場合、Gemini APIで企業分析
 * 7. Firestoreに保存
 * 8. companyIdを返す
 */
export const createCompany = onCall<
  CreateCompanyRequest,
  Promise<CreateCompanyResponse>
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
      throw new HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const userId = request.auth.uid;
    const {companyName} = request.data;

    // 2. バリデーション
    const validation = validateCompanyName(companyName);
    if (!validation.valid) {
      throw new HttpsError(
        "invalid-argument",
        validation.error || "企業名が不正です"
      );
    }

    // 3. 企業名正規化
    const normalizedName = normalizeCompanyName(companyName);

    // 4. 重複チェック
    const companiesRef = db
      .collection("users")
      .doc(userId)
      .collection("companies");
    const duplicateQuery = await companiesRef
      .where("normalizedName", "==", normalizedName)
      .limit(1)
      .get();

    // 5. 重複時は既存企業情報を返す
    if (!duplicateQuery.empty) {
      const existingCompany = duplicateQuery.docs[0];
      return {
        success: true,
        companyId: existingCompany.id,
        isDuplicate: true,
      };
    }

    try {
      console.log(`[createCompany] 企業分析を開始: ${companyName.trim()}`);

      // 6. Gemini APIで企業分析
      const {analysis, metadata} = await analyzeCompanyWithGemini(
        companyName.trim()
      );

      console.log(`[createCompany] 企業分析が完了: ${companyName.trim()}`);

      // 7. Firestoreに保存
      const now = new Date().toISOString();
      const companyData = {
        companyName: companyName.trim(),
        normalizedName,
        companyNameVariations: [],
        analysis,
        analysisMetadata: {
          status: "completed" as const,
          modelUsed: metadata.modelUsed,
          tokensUsed: metadata.tokensUsed,
          searchSources: metadata.searchSources,
          analyzedAt: now,
          version: "1.0",
          needsUpdate: false,
          lastUpdateCheck: now,
          // デバッグ用：プロンプトとレスポンスも保存
          prompt: metadata.prompt,
          rawResponse: metadata.rawResponse,
        },
        userNotes: "",
        stats: {
          eventCount: 0,
          firstRegistered: now,
          lastEventDate: null,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await companiesRef.add(companyData);

      console.log(`[createCompany] Firestoreに保存完了: ${docRef.id}`);

      // 8. companyIdを返す
      return {
        success: true,
        companyId: docRef.id,
        isDuplicate: false,
      };
    } catch (error) {
      console.error(`[createCompany] エラー発生: ${(error as Error).message}`);
      console.error(error);

      throw new HttpsError(
        "internal",
        `企業分析に失敗しました: ${(error as Error).message}`
      );
    }
  }
);
