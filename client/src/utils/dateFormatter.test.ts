/**
 * 日付フォーマット関数のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, getRelativeDate } from './dateFormatter';

describe('formatDate', () => {
  it('ISO 8601形式を日本語表記に変換できる', () => {
    const result = formatDate('2025-10-24T10:00:00+09:00');
    expect(result).toBe('2025年10月24日');
  });

  it('月・日が1桁の場合も正しくフォーマットできる', () => {
    const result = formatDate('2025-01-05T10:00:00+09:00');
    expect(result).toBe('2025年1月5日');
  });

  it('年末の日付を正しくフォーマットできる', () => {
    const result = formatDate('2025-12-31T23:59:59+09:00');
    expect(result).toBe('2025年12月31日');
  });
});

describe('formatDateTime', () => {
  it('日付と時刻をフォーマットできる', () => {
    const result = formatDateTime('2025-10-24T10:30:00+09:00');
    expect(result).toBe('2025年10月24日 10:30');
  });

  it('0時台の時刻を正しくフォーマットできる', () => {
    const result = formatDateTime('2025-10-24T00:05:00+09:00');
    expect(result).toBe('2025年10月24日 00:05');
  });

  it('午後の時刻を24時間表記でフォーマットできる', () => {
    const result = formatDateTime('2025-10-24T15:45:00+09:00');
    expect(result).toBe('2025年10月24日 15:45');
  });
});

describe('getRelativeDate', () => {
  it('今日の日付を "今日" と表示できる', () => {
    const now = new Date();
    // 時刻を正午に設定してタイミング問題を回避
    now.setHours(12, 0, 0, 0);
    const result = getRelativeDate(now.toISOString());
    expect(result).toBe('今日');
  });

  it('明日の日付を "明日" と表示できる', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = getRelativeDate(tomorrow.toISOString());
    expect(result).toBe('明日');
  });

  it('昨日の日付を "昨日" と表示できる', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = getRelativeDate(yesterday.toISOString());
    expect(result).toBe('昨日');
  });

  it('未来の日付を "n日後" と表示できる', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const result = getRelativeDate(future.toISOString());
    expect(result).toBe('5日後');
  });

  it('過去の日付を "n日前" と表示できる', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    const result = getRelativeDate(past.toISOString());
    expect(result).toBe('10日前');
  });
});
