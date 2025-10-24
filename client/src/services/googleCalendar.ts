/**
 * Google Calendar API統合サービス
 */

import {auth} from "./firebase";

/**
 * Google Calendar APIのスコープ
 */
const CALENDAR_SCOPES = "https://www.googleapis.com/auth/calendar.events";

/**
 * Google Calendar APIクライアントの初期化状態
 */
let gapiInitialized = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

/**
 * Google Calendar APIの初期化
 *
 * @return {Promise<void>}
 */
export async function initializeGoogleCalendar(): Promise<void> {
  if (gapiInitialized) {
    return;
  }

  return new Promise((resolve, reject) => {
    // Google API クライアントライブラリの読み込み
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      gapi.load("client", async () => {
        try {
          await gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/" +
                "calendar/v3/rest",
            ],
          });

          // OAuth2トークンクライアントの初期化
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: CALENDAR_SCOPES,
            callback: () => {},
          });

          gapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Googleアカウントで認証
 *
 * @return {Promise<void>}
 */
export async function authenticateGoogleCalendar(): Promise<void> {
  if (!gapiInitialized) {
    await initializeGoogleCalendar();
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Token client not initialized"));
      return;
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(response.error);
        return;
      }
      resolve();
    };

    tokenClient.requestAccessToken();
  });
}

/**
 * カレンダーイベントを作成
 *
 * @param {Object} event - イベント情報
 * @return {Promise<string>} 作成されたカレンダーイベントのID
 */
export async function createCalendarEvent(event: {
  companyName: string;
  eventType: string;
  startTime: string;
  endTime: string;
  location?: string;
  memo?: string;
}): Promise<string> {
  if (!gapiInitialized) {
    await initializeGoogleCalendar();
  }

  // アクセストークンの確認
  const token = gapi.client.getToken();
  if (!token) {
    await authenticateGoogleCalendar();
  }

  const calendarEvent = {
    summary: `${event.eventType} - ${event.companyName}`,
    location: event.location || "",
    description: event.memo || "",
    start: {
      dateTime: event.startTime,
      timeZone: "Asia/Tokyo",
    },
    end: {
      dateTime: event.endTime,
      timeZone: "Asia/Tokyo",
    },
    reminders: {
      useDefault: false,
      overrides: [
        {method: "popup", minutes: 60}, // 1時間前
        {method: "popup", minutes: 1440}, // 1日前
      ],
    },
  };

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: calendarEvent,
    });

    return response.result.id || "";
  } catch (error) {
    console.error("[GoogleCalendar] イベント作成エラー:", error);
    throw new Error("カレンダーイベントの作成に失敗しました");
  }
}

/**
 * カレンダーイベントを更新
 *
 * @param {string} eventId - カレンダーイベントID
 * @param {Object} event - 更新するイベント情報
 * @return {Promise<void>}
 */
export async function updateCalendarEvent(
  eventId: string,
  event: {
    companyName: string;
    eventType: string;
    startTime: string;
    endTime: string;
    location?: string;
    memo?: string;
  }
): Promise<void> {
  if (!gapiInitialized) {
    await initializeGoogleCalendar();
  }

  const calendarEvent = {
    summary: `${event.eventType} - ${event.companyName}`,
    location: event.location || "",
    description: event.memo || "",
    start: {
      dateTime: event.startTime,
      timeZone: "Asia/Tokyo",
    },
    end: {
      dateTime: event.endTime,
      timeZone: "Asia/Tokyo",
    },
    reminders: {
      useDefault: false,
      overrides: [
        {method: "popup", minutes: 60},
        {method: "popup", minutes: 1440},
      ],
    },
  };

  try {
    await gapi.client.calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      resource: calendarEvent,
    });
  } catch (error) {
    console.error("[GoogleCalendar] イベント更新エラー:", error);
    throw new Error("カレンダーイベントの更新に失敗しました");
  }
}

/**
 * カレンダーイベントを削除
 *
 * @param {string} eventId - カレンダーイベントID
 * @return {Promise<void>}
 */
export async function deleteCalendarEvent(
  eventId: string
): Promise<void> {
  if (!gapiInitialized) {
    await initializeGoogleCalendar();
  }

  try {
    await gapi.client.calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
  } catch (error) {
    console.error("[GoogleCalendar] イベント削除エラー:", error);
    throw new Error("カレンダーイベントの削除に失敗しました");
  }
}

/**
 * アクセストークンの有効性を確認
 *
 * @return {boolean} トークンが有効かどうか
 */
export function hasValidToken(): boolean {
  if (!gapiInitialized) {
    return false;
  }

  const token = gapi.client.getToken();
  return token !== null;
}
