/**
 * 予定データの型定義
 */

/**
 * イベント種別（Union Type）
 */
export type EventType =
  | '一次面接'
  | '二次面接'
  | '最終面接'
  | '説明会'
  | 'インターン'
  | 'カジュアル面談'
  | 'その他';

/**
 * 予定ステータス
 */
export type Status = 'scheduled' | 'completed' | 'cancelled';

/**
 * 面接結果
 */
export type Result = 'passed' | 'failed' | 'waiting' | null;

/**
 * 予定データ
 */
export interface Event {
  id: string;
  companyId: string;
  companyName: string;
  eventType: EventType;
  date: string; // ISO 8601
  endDate: string; // ISO 8601
  location?: string;
  memo?: string;
  googleCalendar?: GoogleCalendar;
  status: Status;
  result?: Result;
  resultMemo?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Googleカレンダー連携情報
 */
export interface GoogleCalendar {
  eventId: string | null;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAttempt: string | null; // ISO 8601
}
