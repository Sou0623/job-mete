/**
 * ヘッダーコンポーネント
 * アプリ全体で使用する統一ヘッダー
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onUserIconClick?: () => void;
}

export default function Header({ onUserIconClick }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * 現在のパスかどうかを判定
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link to="/dashboard" className="flex items-center gap-3 group" aria-label="ホームに移動">
            <div className="bg-[#1A4472] text-white rounded-lg p-2 group-hover:bg-[#47845E] transition-all shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1A4472]">Job Mete</h1>
          </Link>

          {/* ナビゲーションメニュー */}
          <nav className="flex items-center gap-1" aria-label="メインナビゲーション">
            <Link
              to="/dashboard"
              aria-label="ダッシュボード"
              aria-current={isActive('/dashboard') ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-[#1A4472] text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4472]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">ダッシュボード</span>
            </Link>
            <Link
              to="/companies"
              aria-label="企業一覧"
              aria-current={isActive('/companies') ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/companies')
                  ? 'bg-[#1A4472] text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4472]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="hidden sm:inline">企業一覧</span>
            </Link>
            <Link
              to="/events"
              aria-label="予定管理"
              aria-current={isActive('/events') ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/events')
                  ? 'bg-[#1A4472] text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4472]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">予定管理</span>
            </Link>
            <Link
              to="/trends"
              aria-label="傾向分析"
              aria-current={isActive('/trends') ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/trends')
                  ? 'bg-[#1A4472] text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A4472]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">傾向分析</span>
            </Link>
          </nav>

          {/* ユーザーアイコン */}
          {user && (
            <button
              onClick={onUserIconClick}
              aria-label="ユーザー設定を開く"
              className="relative group ml-2"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-10 h-10 rounded-full border-2 border-[#1A4472]/20 group-hover:border-[#1A4472] transition-all cursor-pointer shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-[#1A4472]/20 group-hover:border-[#1A4472] group-hover:bg-blue-100 transition-all cursor-pointer shadow-sm">
                  <span className="text-lg font-bold text-[#1A4472]">
                    {user.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {/* オンラインインジケーター */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#47845E] rounded-full border-2 border-white" aria-hidden="true"></div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
