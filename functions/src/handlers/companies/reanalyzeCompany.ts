/**
 * reanalyzeCompany Function
 * 企業情報を最新データで再分析
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {analyzeCompanyWithGemini} from "../../services/geminiService";

/**
 * reanalyzeCompany リクエスト
 */
interface ReanalyzeCompanyRequest {
  companyId: string;
}

/**
 * reanalyzeCompany レスポンス
 */
interface ReanalyzeCompanyResponse {
  success: boolean;
  companyId: string;
  message: string;
}

/**
 * 企業再分析Function
 *
 * 処理フロー:
 * 1. 認証チェック
 * 2. 企業の存在確認
 * 3. Gemini APIで最新情報を取得
 * 4. Firestoreを更新（analysisとanalysisMetadataを上書き）
 * 5. 成功メッセージを返す
 */
export const reanalyzeCompany = onCall<
  ReanalyzeCompanyRequest,
  Promise<ReanalyzeCompanyResponse>
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
    const {companyId} = request.data;

    // バリデーション
    if (!companyId || !companyId.trim()) {
      throw new HttpsError("invalid-argument", "企業IDは必須です");
    }

    try {
      console.log(`[reanalyzeCompany] 再分析を開始: companyId=${companyId}`);

      // 2. 企業の存在確認
      const companyRef = db
        .collection("users")
        .doc(userId)
        .collection("companies")
        .doc(companyId);

      const companyDoc = await companyRef.get();

      if (!companyDoc.exists) {
        throw new HttpsError("not-found", "企業が見つかりません");
      }

      const companyData = companyDoc.data();
      const companyName = companyData?.companyName;

      if (!companyName) {
        throw new HttpsError("internal", "企業名が取得できません");
      }

      console.log(`[reanalyzeCompany] 企業名: ${companyName}`);

      // 3. Gemini APIで最新情報を取得
      const {analysis, metadata} = await analyzeCompanyWithGemini(
        companyName.trim()
      );

      console.log(`[reanalyzeCompany] 再分析完了: ${companyName}`);

      // 4. Firestoreを更新
      const now = new Date().toISOString();
      await companyRef.update({
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
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[reanalyzeCompany] Firestore更新完了: ${companyId}`);

      // 5. 成功メッセージを返す
      return {
        success: true,
        companyId,
        message: "企業情報を最新データで更新しました",
      };
    } catch (error) {
      console.error(
        `[reanalyzeCompany] エラー発生: ${(error as Error).message}`
      );
      console.error(error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        `企業の再分析に失敗しました: ${(error as Error).message}`
      );
    }
  }
);
