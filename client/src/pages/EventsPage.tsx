/**
 * 予定一覧ページ
 * 登録された予定一覧を表示し、ステータスフィルタ機能を提供
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import Header from '@/components/layout/Header';
import type { EventStatus } from '@/types/event';

export default function EventsPage() {
  const { events, loading, error } = useEvents();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  /**
   * ステータスでフィルタリング
   */
  const filteredEvents =
    statusFilter === 'all'
      ? events
      : events.filter((event) => event.status === statusFilter);

  /**
   * 予定登録ページに遷移
   */
  const handleAddEvent = () => {
    navigate('/events/new');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル・アクション */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">予定一覧</h2>
            <p className="text-sm text-gray-600 mt-1">
              登録予定数: {events.length}件
            </p>
          </div>

          <button
            onClick={handleAddEvent}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + 予定を追加
          </button>
        </div>

        {/* ステータスフィルタ */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              すべて ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'scheduled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              予定 ({events.filter((e) => e.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              完了 ({events.filter((e) => e.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              キャンセル ({events.filter((e) => e.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* 予定一覧 */}
        {!loading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                {statusFilter !== 'all' ? (
                  <>
                    <p className="text-gray-600 text-lg mb-2">
                      該当する予定がありません
                    </p>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      フィルタをクリア
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg mb-4">
                      まだ予定が登録されていません
                    </p>
                    <button
                      onClick={handleAddEvent}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      最初の予定を追加
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
