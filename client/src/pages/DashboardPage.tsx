/**
 * ダッシュボードページ
 * 統計情報・直近予定を表示
 */

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companies, loading: companiesLoading } = useCompanies();
  const { events, loading: eventsLoading } = useEvents();

  /**
   * 直近3件の予定を取得
   */
  const recentEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  /**
   * 日時フォーマット
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * イベント種別のバッジカラー
   */
  const getEventTypeBadgeColor = (eventType: string): string => {
    switch (eventType) {
      case '説明会':
        return 'bg-blue-100 text-blue-800';
      case '一次面接':
        return 'bg-green-100 text-green-800';
      case '二次面接':
        return 'bg-yellow-100 text-yellow-800';
      case '最終面接':
        return 'bg-red-100 text-red-800';
      case 'インターン':
        return 'bg-purple-100 text-purple-800';
      case 'カジュアル面談':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const loading = companiesLoading || eventsLoading;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="text-sm text-gray-600 mt-1">
            ようこそ、{user?.displayName} さん！
          </p>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* 統計情報 */}
        {!loading && (
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* 登録企業数 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">登録企業数</p>
                    <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 登録予定数 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">登録予定数</p>
                    <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 直近の予定 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">直近の予定</p>
                    <p className="text-3xl font-bold text-gray-900">{recentEvents.length}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 直近の予定 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">直近の予定</h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  すべて見る →
                </button>
              </div>

              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">直近の予定がありません</p>
                  <button
                    onClick={() => navigate('/events/new')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    予定を登録
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getEventTypeBadgeColor(
                              event.eventType
                            )}`}
                          >
                            {event.eventType}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {event.companyName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/events/new')}
                  className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="bg-blue-600 rounded-full p-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">予定を登録</span>
                </button>

                <button
                  onClick={() => navigate('/companies')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-gray-600 rounded-full p-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">企業一覧</span>
                </button>

                <button
                  onClick={() => navigate('/trends')}
                  className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-md hover:bg-purple-50 transition-colors"
                  disabled={companies.length < 3}
                >
                  <div
                    className={`rounded-full p-2 ${
                      companies.length < 3 ? 'bg-gray-400' : 'bg-purple-600'
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">傾向分析</span>
                </button>
              </div>
              {companies.length < 3 && (
                <p className="text-xs text-gray-500 mt-3">
                  💡 傾向分析には最低3社の企業登録が必要です（現在: {companies.length}社）
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
