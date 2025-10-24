/**
 * 日付フォーマット用ユーティリティ関数群
 */

/**
 * ISO 8601形式の日付文字列を日本語表記にフォーマット
 *
 * @param isoString - ISO 8601形式の日付文字列（例: "2025-10-24T10:00:00+09:00"）
 * @returns フォーマットされた日付文字列（例: "2025年10月24日"）
 *
 * @example
 * formatDate("2025-10-24T10:00:00+09:00") // => "2025年10月24日"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * ISO 8601形式の日付文字列を時刻込みでフォーマット
 *
 * @param isoString - ISO 8601形式の日付文字列（例: "2025-10-24T10:30:00+09:00"）
 * @returns フォーマットされた日時文字列（例: "2025年10月24日 10:30"）
 *
 * @example
 * formatDateTime("2025-10-24T10:30:00+09:00") // => "2025年10月24日 10:30"
 * formatDateTime("2025-10-24T00:05:00+09:00") // => "2025年10月24日 00:05"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 相対的な日付表示（n日前、n日後）
 *
 * @param isoString - ISO 8601形式の日付文字列
 * @returns 相対的な日付表示（例: "今日", "明日", "3日後", "5日前"）
 *
 * @example
 * // 今日の日付を渡した場合
 * getRelativeDate(new Date().toISOString()) // => "今日"
 *
 * // 明日の日付を渡した場合
 * const tomorrow = new Date();
 * tomorrow.setDate(tomorrow.getDate() + 1);
 * getRelativeDate(tomorrow.toISOString()) // => "明日"
 */
export function getRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // 時刻の影響を排除するため、両方の日付を同じ時刻（00:00:00）にリセット
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '明日';
  } else if (diffDays === -1) {
    return '昨日';
  } else if (diffDays > 0) {
    return `${diffDays}日後`;
  } else {
    return `${Math.abs(diffDays)}日前`;
  }
}
