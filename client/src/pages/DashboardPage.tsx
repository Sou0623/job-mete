import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import Loading from '@/components/common/Loading';
import { useMemo } from 'react';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companies, loading: companiesLoading } = useCompanies();
  const { events, loading: eventsLoading } = useEvents();

  const { upcomingEvents, pastEventsCount } = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastCount = events.length - upcoming.length;
    return { upcomingEvents: upcoming, pastEventsCount: pastCount };
  }, [events]);

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

  const getEventTypeBadgeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      '説明会': 'bg-blue-100 text-blue-800',
      '一次面接': 'bg-green-100 text-green-800',
      '二次面接': 'bg-yellow-100 text-yellow-800',
      '最終面接': 'bg-red-100 text-red-800',
      'インターン': 'bg-purple-100 text-purple-800',
      'カジュアル面談': 'bg-indigo-100 text-indigo-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const loading = companiesLoading || eventsLoading;

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* メインカラム (左側) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ウェルカム & クイックアクション */}
            <section className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                ようこそ、{user?.displayName} さん！
              </h2>
              <p className="text-gray-600 mt-1">
                まずは、今日やることを確認しましょう。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => navigate('/companies/new')}
                  className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center text-left"
                >
                  <div className="bg-blue-600 text-white rounded-lg p-3 mr-4">
                    <Icons.Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold">企業を分析</span>
                    <p className="text-sm">気になる企業を登録・分析します</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/events/new')}
                  className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center text-left"
                >
                  <div className="bg-green-600 text-white rounded-lg p-3 mr-4">
                    <Icons.Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold">予定を登録</span>
                    <p className="text-sm">面接や説明会の予定を追加します</p>
                  </div>
                </button>
              </div>
            </section>

            {/* 今後の予定 */}
            <section className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">今後の予定</h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  すべて見る
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Icons.Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-800">予定はまだありません</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    面接や説明会の予定を登録しましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 5).map((event) => (
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
              )}
            </section>
          </div>

          {/* サイドカラム (右側) */}
          <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
            {/* サマリー */}
            <section className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">サマリー</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-4">
                    <Icons.Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">登録企業数</p>
                    <p className="font-bold text-lg text-gray-900">{companies.length} 社</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-600 rounded-lg p-2 mr-4">
                    <Icons.Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">総予定数</p>
                    <p className="font-bold text-lg text-gray-900">{events.length} 件</p>
                  </div>
                </div>
                 <div className="flex items-center">
                  <div className="bg-yellow-100 text-yellow-600 rounded-lg p-2 mr-4">
                    <Icons.Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">完了した予定</p>
                    <p className="font-bold text-lg text-gray-900">{pastEventsCount} 件</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 傾向分析 */}
            <section className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">傾向分析</h3>
              {companies.length < 3 ? (
                <div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div><span className="text-xs font-semibold inline-block text-purple-600">あと {3 - companies.length} 社</span></div>
                      <div className="text-right"><span className="text-xs font-semibold inline-block text-purple-600">{companies.length} / 3</span></div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                      <div style={{ width: `${(companies.length / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    企業を3社以上登録すると、あなたの志望傾向をAIが分析します。
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    登録企業からあなたの興味関心をAIが分析します。自己分析に役立てましょう。
                  </p>
                  <button
                    onClick={() => navigate('/trends')}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold flex items-center justify-center"
                  >
                    <Icons.Chart className="w-5 h-5 mr-2" />
                    <span>分析結果を見る</span>
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}