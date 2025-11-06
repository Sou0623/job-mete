/**
 * EventCard コンポーネント
 * 予定情報カードを表示
 */

import { useNavigate } from 'react-router-dom';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
}

/**
 * イベント種別の表示用ラベル
 */
const EVENT_TYPE_LABELS: Record<string, string> = {
  '一次面接': '一次面接',
  '二次面接': '二次面接',
  '最終面接': '最終面接',
  '説明会': '説明会',
  'インターン': 'インターン',
  'カジュアル面談': 'カジュアル面談',
  'その他': 'その他',
};

/**
 * ステータスの表示用ラベルと色
 */
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  scheduled: { label: '予定', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'キャンセル', className: 'bg-gray-100 text-gray-700' },
};

/**
 * 日時をフォーマット
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * EventCard コンポーネント
 */
export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  /**
   * カードクリックで詳細ページに遷移
   */
  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.scheduled;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* ヘッダー: ステータスバッジ */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>

        {/* カレンダー同期ステータス */}
        {event.googleCalendar && event.googleCalendar.syncStatus === 'synced' && (
          <span className="text-xs text-gray-500 flex-shrink-0">
            <span className="hidden sm:inline">📅 同期済み</span>
            <span className="sm:hidden">📅</span>
          </span>
        )}
        {event.googleCalendar && event.googleCalendar.syncStatus === 'pending' && (
          <span className="text-xs text-yellow-600 flex-shrink-0">
            <span className="hidden sm:inline">📅 同期中</span>
            <span className="sm:hidden">📅</span>
          </span>
        )}
        {event.googleCalendar && event.googleCalendar.syncStatus === 'failed' && (
          <span className="text-xs text-red-600 flex-shrink-0">
            <span className="hidden sm:inline">📅 同期失敗</span>
            <span className="sm:hidden">📅❌</span>
          </span>
        )}
      </div>

      {/* 企業名 */}
      <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 truncate">{event.companyName}</h3>

      {/* イベント種別 */}
      <p className="text-sm sm:text-lg text-gray-700 mb-3">
        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
      </p>

      {/* 日時 */}
      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-2">
        <span className="flex-shrink-0">📅</span>
        <span className="break-words">{formatDateTime(event.date)}</span>
      </div>

      {/* 場所 */}
      {event.location && (
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-2">
          <span className="flex-shrink-0">📍</span>
          <span className="break-words">{event.location}</span>
        </div>
      )}

      {/* 結果 */}
      {event.result && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <span className="text-xs sm:text-sm font-semibold text-gray-700">結果: </span>
          {event.result === 'passed' && (
            <span className="text-xs sm:text-sm text-green-600 font-semibold">✅ 通過</span>
          )}
          {event.result === 'failed' && (
            <span className="text-xs sm:text-sm text-red-600 font-semibold">❌ 不合格</span>
          )}
          {event.result === 'waiting' && (
            <span className="text-xs sm:text-sm text-yellow-600 font-semibold">⏳ 結果待ち</span>
          )}
        </div>
      )}
    </div>
  );
}
