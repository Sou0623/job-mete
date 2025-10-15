/**
 * createEvent Function
 * 予定登録API（企業ID取得/作成、Firestore保存、企業統計更新）
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {normalizeCompanyName} from "../../utils/normalizer";
import {analyzeCompanyWithGemini} from "../../services/geminiService";

/**
 * イベント種別
 */
type EventType =
  | "一次面接"
  | "二次面接"
  | "最終面接"
  | "説明会"
  | "インターン"
  | "カジュアル面談"
  | "その他";

/**
 * Googleカレンダー連携情報
 */
interface GoogleCalendar {
  eventId: string | null;
  syncStatus: "synced" | "pending" | "failed";
  lastSyncAttempt: string | null;
}

/**
 * createEvent リクエスト
 */
interface CreateEventRequest {
  companyName: string;
  eventType: EventType;
  date: string; // ISO 8601
  endDate: string; // ISO 8601
  location?: string;
  memo?: string;
  syncToCalendar?: boolean;
}

/**
 * createEvent レスポンス
 */
interface CreateEventResponse {
  success: boolean;
  eventId: string;
  companyId: string;
  calendarEventId?: string;
  calendarSyncStatus: "synced" | "pending" | "failed";
}

/**
 * 予定登録Function
 *
 * 処理フロー:
 * 1. 認証チェック
 * 2. 企業名から企業ID取得（なければ自動的にcreateCompanyを呼び出して作成）
 * 3. 予定をFirestoreに保存
 * 4. 企業統計を更新（eventCount++, lastEventDate更新）
 * 5. eventIdを返す
 *
 * NOTE: Google Calendar同期は後で実装（Issue #13, #14）
 */
export const createEvent = onCall<
  CreateEventRequest,
  Promise<CreateEventResponse>
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
    const {companyName, eventType, date, endDate, location, memo, syncToCalendar} = request.data;

    // バリデーション
    if (!companyName || !companyName.trim()) {
      throw new HttpsError("invalid-argument", "企業名は必須です");
    }

    if (!eventType) {
      throw new HttpsError("invalid-argument", "イベント種別は必須です");
    }

    if (!date || !endDate) {
      throw new HttpsError("invalid-argument", "日時は必須です");
    }

    // 2. 企業名から企業ID取得（なければ自動作成）
    const normalizedName = normalizeCompanyName(companyName.trim());
    const companiesRef = db.collection("users").doc(userId).collection("companies");
    const companyQuery = await companiesRef
      .where("normalizedName", "==", normalizedName)
      .limit(1)
      .get();

    let companyId: string;
    let companyDoc;

    if (companyQuery.empty) {
      // 企業が存在しない場合、自動的に作成
      console.log(`[createEvent] 企業「${companyName}」が見つからないため、自動作成します`);

      try {
        // Gemini APIで企業分析
        const {analysis, metadata} = await analyzeCompanyWithGemini(
          companyName.trim()
        );

        console.log(`[createEvent] 企業分析が完了: ${companyName.trim()}`);

        // Firestoreに保存
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

        const newCompanyDoc = await companiesRef.add(companyData);
        companyId = newCompanyDoc.id;
        companyDoc = await newCompanyDoc.get();

        console.log(`[createEvent] 企業を自動作成完了: ${companyId}`);
      } catch (error) {
        console.error(`[createEvent] 企業自動作成エラー: ${(error as Error).message}`);
        throw new HttpsError(
          "internal",
          `企業分析に失敗しました: ${(error as Error).message}`
        );
      }
    } else {
      companyDoc = companyQuery.docs[0];
      companyId = companyDoc.id;
      console.log(`[createEvent] 既存企業を使用: ${companyId}`);
    }

    try {
      console.log(`[createEvent] 予定を作成: ${companyName} - ${eventType}`);

      // 3. Googleカレンダー同期情報を初期化
      const googleCalendar: GoogleCalendar = {
        eventId: null,
        syncStatus: syncToCalendar ? "pending" : "failed",
        lastSyncAttempt: null,
      };

      // TODO: Issue #13, #14 で Google Calendar API 統合を実装
      // 現時点では同期は未実装
      if (syncToCalendar) {
        console.log("[createEvent] カレンダー同期は後で実装されます");
      }

      // 4. 予定をFirestoreに保存
      const eventsRef = db.collection("users").doc(userId).collection("events");
      const eventData = {
        companyId,
        companyName: companyName.trim(),
        eventType,
        date,
        endDate,
        location: location || "",
        memo: memo || "",
        googleCalendar,
        status: "scheduled" as const,
        result: null,
        resultMemo: "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const eventDocRef = await eventsRef.add(eventData);

      console.log(`[createEvent] 予定を保存完了: ${eventDocRef.id}`);

      // 5. 企業統計を更新（eventCount++, lastEventDate更新）
      await companyDoc.ref.update({
        "stats.eventCount": FieldValue.increment(1),
        "stats.lastEventDate": date,
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[createEvent] 企業統計を更新完了: ${companyId}`);

      // 6. eventIdを返す
      return {
        success: true,
        eventId: eventDocRef.id,
        companyId,
        calendarEventId: googleCalendar.eventId || undefined,
        calendarSyncStatus: googleCalendar.syncStatus,
      };
    } catch (error) {
      console.error(`[createEvent] エラー発生: ${(error as Error).message}`);
      console.error(error);

      throw new HttpsError(
        "internal",
        `予定の登録に失敗しました: ${(error as Error).message}`
      );
    }
  }
);
