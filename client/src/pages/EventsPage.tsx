/**
 * 予定一覧ページ
 * 登録された予定一覧を表示し、ステータスフィルタ機能とカレンダー表示を提供
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import UserModal from '@/components/common/UserModal';
import type { Status } from '@/types/event';

export default function EventsPage() {
  const { events, loading, error } = useEvents();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUserModal, setShowUserModal] = useState(false);

  /**
   * ステータスと月でフィルタリング
   */
  const filteredEvents = (() => {
    // まずステータスでフィルタ
    const statusFiltered =
      statusFilter === 'all'
        ? events
        : events.filter((event) => event.status === statusFilter);

    // 次に選択された月でフィルタ
    return statusFiltered.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === currentMonth.getFullYear() &&
        eventDate.getMonth() === currentMonth.getMonth()
      );
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  /**
   * 予定登録ページに遷移
   */
  const handleAddEvent = () => {
    navigate('/events/new');
  };

  /**
   * イベント種別のバッジカラーを取得
   */
  const getEventTypeBadgeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      '説明会': 'bg-blue-100 text-blue-800 border-blue-200',
      '一次面接': 'bg-green-100 text-green-800 border-green-200',
      '二次面接': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '最終面接': 'bg-red-100 text-red-800 border-red-200',
      'インターン': 'bg-purple-100 text-purple-800 border-purple-200',
      'カジュアル面談': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  /**
   * 月を変更
   */
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  /**
   * 日付フォーマット
   */
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * カレンダー用の日付配列を生成
   */
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // 前月の日付
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, -startDayOfWeek + i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // 当月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // 次月の日付（6週間分埋める）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  /**
   * 特定の日に予定があるか確認
   */
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  /**
   * 今日の日付か確認
   */
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル・アクション */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              予定管理
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-600">
                登録予定数: <span className="font-bold text-blue-600">{events.length}</span>件
              </p>
              <div className="h-4 w-px bg-gray-300"></div>
              <p className="text-sm text-gray-600">
                今後の予定: <span className="font-bold text-green-600">{events.filter(e => new Date(e.date) >= new Date()).length}</span>件
              </p>
            </div>
          </div>

          <button
            onClick={handleAddEvent}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            予定を追加
          </button>
        </div>

        {/* 月ナビゲーション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 px-4 py-2 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all font-medium shadow-sm"
            >
              今日
            </button>
          </div>
        </div>

        {/* ビュー切り替えとフィルタ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* ビュー切り替え */}
          <div className="flex items-center bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                カレンダー
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                リスト
              </div>
            </button>
          </div>

          {/* ステータスフィルタ */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              すべて ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                statusFilter === 'scheduled'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              予定 ({events.filter((e) => e.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              完了 ({events.filter((e) => e.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                statusFilter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              キャンセル ({events.filter((e) => e.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="py-12">
            <Loading />
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* 予定表示 */}
        {!loading && !error && (
          <>
            {viewMode === 'list' ? (
              // リスト表示
              filteredEvents.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-2 font-medium">
                    {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月の予定はありません
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {statusFilter !== 'all' && '別のステータスを選択するか、'}面接や説明会の予定を登録しましょう
                  </p>
                  <div className="flex justify-center gap-3">
                    {statusFilter !== 'all' && (
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                      >
                        フィルタをクリア
                      </button>
                    )}
                    <button
                      onClick={handleAddEvent}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                      予定を追加
                    </button>
                  </div>
                </div>
              ) : (
              // リスト表示（時系列リスト形式）
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getEventTypeBadgeColor(event.eventType)}`}>
                            {event.eventType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                            event.status === 'scheduled'
                              ? 'bg-green-50 text-green-700'
                              : event.status === 'completed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {event.status === 'scheduled' ? '予定' : event.status === 'completed' ? '完了' : 'キャンセル'}
                          </span>
                        </div>
                        <p className="text-base font-bold text-gray-900 mb-1">
                          {event.companyName}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </p>
                        )}
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
              )
            ) : (
              // カレンダー表示
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-3 mb-3">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                    <div
                      key={day}
                      className={`text-center text-sm font-bold py-3 rounded-lg ${
                        index === 0
                          ? 'bg-red-50 text-red-600'
                          : index === 6
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダーグリッド */}
                <div className="grid grid-cols-7 gap-3">
                  {generateCalendarDays().map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isTodayDate = isToday(day.date);

                    return (
                      <div
                        key={index}
                        className={`min-h-[120px] p-3 rounded-xl border-2 transition-all ${
                          day.isCurrentMonth
                            ? isTodayDate
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                            : 'bg-gray-50 border-gray-100'
                        } ${dayEvents.length > 0 ? 'cursor-pointer hover:scale-105' : ''}`}
                        onClick={() => {
                          if (dayEvents.length > 0) {
                            navigate(`/events/${dayEvents[0].id}`);
                          }
                        }}
                      >
                        <div
                          className={`text-sm font-bold mb-2 ${
                            day.isCurrentMonth
                              ? isTodayDate
                                ? 'text-blue-600 text-lg'
                                : 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {day.date.getDate()}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded-lg truncate font-medium border ${getEventTypeBadgeColor(
                                  event.eventType
                                )}`}
                                title={`${event.companyName} - ${event.eventType}`}
                              >
                                {event.companyName}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-600 px-2 font-medium">
                                +{dayEvents.length - 3}件
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* カレンダー凡例 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">イベント種別</h4>
                  <div className="flex flex-wrap gap-3">
                    {['説明会', '一次面接', '二次面接', '最終面接', 'インターン', 'カジュアル面談'].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getEventTypeBadgeColor(type)}`}></div>
                        <span className="text-xs text-gray-600">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ユーザー設定モーダル */}
      <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
