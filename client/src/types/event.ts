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
 * 予定ステータス（エイリアス）
 */
export type EventStatus = Status;

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
  jobPosition?: string; // 選考を受けている職種（例: "バックエンドエンジニア", "営業職"）
  review?: EventReview; // レビュー情報
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

/**
 * イベントレビュー情報
 */
export interface EventReview {
  feedback: string; // 感想（テキストベース）
  companyMatchRate: number; // 企業とのマッチ度（1〜5、1メモリあたり20%）
  jobMatchRate: number; // 職種とのマッチ度（1〜5、1メモリあたり20%）
  reviewedAt: string; // レビュー記入日時（ISO 8601）
}
