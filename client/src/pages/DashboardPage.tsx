import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import Loading from '@/components/common/Loading';
import { useMemo, useState, useCallback } from 'react';

// アイコンを一箇所にまとめて管理しやすくします
const Icons = {
  Building: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
  ),
  Chart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
  ),
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { companies, loading: companiesLoading } = useCompanies();
  const { events, loading: eventsLoading } = useEvents();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 選択された月の予定のみを表示
  const { monthEvents, upcomingEvents, pastEventsCount, incompleteEvents, reviewedEventsCount } = useMemo(() => {
    const now = new Date();

    // 全体の今後の予定と過去の予定
    const upcoming = events
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastCount = events.length - upcoming.length;

    // 過去の未完了予定（status === 'scheduled' かつ review が未記入）
    const incomplete = events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate < now && event.status === 'scheduled' && !event.review;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3); // 最大3件

    // レビューが記入された予定の数（傾向分析に必要）
    const reviewedCount = events.filter((event) => event.review).length;

    // 選択された月の予定のみ
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === currentMonth.getFullYear() &&
        eventDate.getMonth() === currentMonth.getMonth()
      );
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      monthEvents: filtered,
      upcomingEvents: upcoming,
      pastEventsCount: pastCount,
      incompleteEvents: incomplete,
      reviewedEventsCount: reviewedCount
    };
  }, [events, currentMonth]);

  // 日付フォーマット関数（useCallbackでメモ化）
  const formatDate = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // イベント種別のバッジ色を取得（useCallbackでメモ化）
  const getEventTypeBadgeColor = useCallback((eventType: string) => {
    const colors: { [key: string]: string } = {
      '説明会': 'bg-blue-100 text-[#1A4472] border-blue-300',
      '一次面接': 'bg-green-100 text-[#2E7D4D] border-green-300',
      '二次面接': 'bg-yellow-100 text-[#9B8E00] border-yellow-300',
      '最終面接': 'bg-red-100 text-red-800 border-red-300',
      'インターン': 'bg-purple-100 text-purple-800 border-purple-300',
      'カジュアル面談': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-700 border-gray-300';
  }, []);

  const loading = companiesLoading || eventsLoading;

  // ログアウト処理（useCallbackでメモ化）
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }, [logout, navigate]);

  // 月を変更（useCallbackでメモ化）
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  // カレンダー用の日付配列を生成（useCallbackでメモ化）
  const generateCalendarDays = useCallback(() => {
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
  }, [currentMonth]);

  // 特定の日に予定があるか確認（useCallbackでメモ化）
  const getEventsForDate = useCallback((date: Date) => {
    return monthEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }, [monthEvents]);

  // 今日の日付か確認（useCallbackでメモ化）
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }, []);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />
     <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          {/* メインカラム (中央) */}
          <div className="lg:col-span-3 space-y-8">
            {/* ウェルカムメッセージ */}
            <section>
              <h2 className="text-4xl font-bold text-[#1A4472]">
                ようこそ、{user?.displayName} さん！
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">
                  まずは、今日やることを確認しましょう。
                </p>
                <div className="h-4 w-px bg-gray-300"></div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#1A4472]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  登録企業: {companies.length}社 | 予定: {events.length}件
                </p>
              </div>
            </section>

            {/* クイックアクションボタン（横並び） */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/companies/new')}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center group h-[200px] flex flex-col items-center justify-center border border-gray-200"
              >
                <div className="bg-[#1A4472] text-white rounded-lg p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icons.Building className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">企業を分析</h3>
                <p className="text-sm text-gray-600">気になる企業を登録</p>
              </button>
              <button
                onClick={() => navigate('/events/new')}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center group h-[200px] flex flex-col items-center justify-center border border-gray-200"
              >
                <div className="bg-[#47845E] text-white rounded-lg p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icons.Plus className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">予定を登録</h3>
                <p className="text-sm text-gray-600">面接や説明会の予定</p>
              </button>
              <button
                onClick={() => navigate('/trends')}
                disabled={reviewedEventsCount < 3}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center group h-[200px] flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:translate-y-0 border border-gray-200"
              >
                <div className={`rounded-lg p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4 transition-transform text-white ${
                  reviewedEventsCount < 3
                    ? 'bg-gray-400'
                    : 'bg-[#1A4472] group-hover:scale-110'
                }`}>
                  <Icons.Chart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">傾向分析</h3>
                <p className="text-sm text-gray-600">
                  {reviewedEventsCount < 3 ? `レビュー済み ${reviewedEventsCount}/3 件` : 'AIが分析'}
                </p>
              </button>
            </section>

            {/* 過去の未完了予定セクション */}
            {incompleteEvents.length > 0 && (
              <section className="bg-amber-50 p-6 rounded-2xl shadow-lg border-2 border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#E57373] text-white rounded-lg p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">レビュー未記入の予定</h3>
                  </div>
                  <span className="bg-[#E57373] text-white px-3 py-1 rounded-full text-sm font-bold">
                    {incompleteEvents.length}件
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  完了した予定のレビュー（感想・マッチ度）を記入して、傾向分析の精度を上げましょう！
                </p>
                <div className="space-y-3">
                  {incompleteEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center p-4 bg-white rounded-xl hover:shadow-md cursor-pointer transition-all border-2 border-amber-100 hover:border-amber-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getEventTypeBadgeColor(event.eventType)}`}>
                            {event.eventType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-base font-bold text-gray-900 mb-1">
                          {event.companyName}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white bg-[#E57373] px-3 py-1 rounded-lg">
                          レビューを記入
                        </span>
                        <Icons.ChevronRight className="w-5 h-5 text-[#E57373]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 予定カレンダー */}
            <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              {/* 月ナビゲーションとビュー切り替え */}
              <div className="flex items-center justify-between mb-6 relative">
                {/* 左側：ビュー切り替えボタン */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#1A4472] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    リスト
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'calendar'
                        ? 'bg-[#1A4472] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    カレンダー
                  </button>
                </div>

                {/* 中央：月ナビゲーション */}
                <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-2xl font-bold text-[#1A4472] whitespace-nowrap">
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
                </div>

                {/* 右側：すべて見るボタン */}
                <button
                  onClick={() => navigate('/events')}
                  className="text-sm bg-[#1A4472] text-white px-4 py-2 rounded-lg hover:bg-[#47845E] transition-all font-semibold shadow-sm"
                >
                  すべて見る →
                </button>
              </div>

              {viewMode === 'list' ? (
                // リスト表示（選択された月の予定）
                monthEvents.length === 0 ? (
                  <div className="text-center py-10">
                    <Icons.Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-800">
                      {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月の予定はありません
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">
                      面接や説明会の予定を登録しましょう
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {event.companyName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEventTypeBadgeColor(event.eventType)}`}>
                              {event.eventType}
                            </span>
                            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                          </div>
                        </div>
                        <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // カレンダー表示
                <div className="space-y-4">
                  {/* 曜日ヘッダー */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <div
                        key={day}
                        className={`text-center text-sm font-bold py-2 ${
                          index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* カレンダーグリッド */}
                  <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((day, index) => {
                      const dayEvents = getEventsForDate(day.date);
                      const isTodayDate = isToday(day.date);

                      return (
                        <div
                          key={index}
                          className={`min-h-[80px] p-2 border rounded-lg transition-all ${
                            day.isCurrentMonth
                              ? isTodayDate
                                ? 'bg-blue-50 border-[#1A4472] border-2'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                              : 'bg-gray-50 border-gray-100'
                          } ${dayEvents.length > 0 ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (dayEvents.length > 0) {
                              navigate(`/events/${dayEvents[0].id}`);
                            }
                          }}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            day.isCurrentMonth
                              ? isTodayDate
                                ? 'text-[#1A4472] font-bold'
                                : 'text-gray-900'
                              : 'text-gray-400'
                          }`}>
                            {day.date.getDate()}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeBadgeColor(event.eventType)}`}
                                >
                                  {event.companyName}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-600 px-1">
                                  +{dayEvents.length - 2}件
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* サイドカラム (右側) */}
          <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
            {/* ユーザーカード */}
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-white p-6 rounded-2xl shadow-lg h-[200px] flex items-center justify-center hover:shadow-xl transition-all hover:-translate-y-1 w-full border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'ユーザー'}
                    className="w-16 h-16 rounded-full mb-3 border-4 border-[#1A4472]/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full mb-3 bg-blue-50 flex items-center justify-center border-4 border-[#1A4472]/20">
                    <span className="text-2xl font-bold text-[#1A4472]">
                      {user?.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{user?.displayName}</h3>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>
            </button>

            {/* サマリー */}
            <button
              onClick={() => setShowSummaryModal(true)}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full text-left border border-gray-200"
            >
              <h3 className="text-xl font-bold text-[#1A4472] mb-4">サマリー</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-[#1A4472] text-white rounded-lg p-2 mr-4">
                    <Icons.Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">登録企業数</p>
                    <p className="font-bold text-xl text-[#1A4472]">{companies.length} 社</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#47845E] text-white rounded-lg p-2 mr-4">
                    <Icons.Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">総予定数</p>
                    <p className="font-bold text-xl text-[#47845E]">{events.length} 件</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#CAC75C] text-white rounded-lg p-2 mr-4">
                    <Icons.Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">完了した予定</p>
                    <p className="font-bold text-xl text-[#CAC75C]">{pastEventsCount} 件</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* サマリー詳細モーダル */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">サマリー詳細</h2>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {/* 基本統計 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-6 text-center border-2 border-blue-100">
                  <Icons.Building className="w-12 h-12 text-[#1A4472] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-[#1A4472] mb-1">{companies.length}</p>
                  <p className="text-sm text-gray-600">登録企業数</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center border-2 border-green-100">
                  <Icons.Calendar className="w-12 h-12 text-[#47845E] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-[#47845E] mb-1">{events.length}</p>
                  <p className="text-sm text-gray-600">総予定数</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6 text-center border-2 border-yellow-100">
                  <Icons.Clock className="w-12 h-12 text-[#CAC75C] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-[#CAC75C] mb-1">{pastEventsCount}</p>
                  <p className="text-sm text-gray-600">完了した予定</p>
                </div>
              </div>

              {/* 企業リスト */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">登録企業一覧</h3>
                {companies.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">企業が登録されていません</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => {
                          setShowSummaryModal(false);
                          navigate(`/companies/${company.id}`);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 text-[#1A4472] rounded-lg p-2">
                            <Icons.Building className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900">{company.companyName}</span>
                        </div>
                        <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 予定の内訳 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">予定の状況</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">今後の予定</p>
                    <p className="text-2xl font-bold text-[#47845E]">{upcomingEvents.length} 件</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">完了済み</p>
                    <p className="text-2xl font-bold text-gray-600">{pastEventsCount} 件</p>
                  </div>
                </div>
              </div>

              {/* イベント種別の内訳 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">イベント種別の内訳</h3>
                <div className="space-y-2">
                  {['説明会', '一次面接', '二次面接', '最終面接', 'インターン', 'カジュアル面談'].map((type) => {
                    const count = events.filter(e => e.eventType === type).length;
                    return count > 0 ? (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                        <span className="text-lg font-bold text-gray-900">{count} 件</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ユーザー設定モーダル */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">アカウント設定</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {/* ユーザー情報 */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'ユーザー'}
                    className="w-24 h-24 rounded-full mb-4 border-4 border-[#1A4472]/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mb-4 bg-blue-50 flex items-center justify-center border-4 border-[#1A4472]/20">
                    <span className="text-4xl font-bold text-[#1A4472]">
                      {user?.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{user?.displayName}</h3>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>

              {/* アカウント情報 */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">アカウント情報</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">表示名</p>
                    <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">メールアドレス</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">ユーザーID</p>
                    <p className="text-sm font-mono text-gray-700 break-all">{user?.uid}</p>
                  </div>
                </div>
              </div>

              {/* Googleカレンダー連携 */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">連携サービス</h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Calendar className="w-5 h-5 text-[#1A4472]" />
                    <span className="font-medium text-[#1A4472]">Googleカレンダー</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    予定を自動的にGoogleカレンダーに同期します
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#47845E] rounded-full"></div>
                    <span className="text-sm font-medium text-[#47845E]">連携済み</span>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">利用状況</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#1A4472]">{companies.length}</p>
                    <p className="text-xs text-gray-600 mt-1">企業</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#47845E]">{events.length}</p>
                    <p className="text-xs text-gray-600 mt-1">予定</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#CAC75C]">{pastEventsCount}</p>
                    <p className="text-xs text-gray-600 mt-1">完了</p>
                  </div>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                ログアウト
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}