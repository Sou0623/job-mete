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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white rounded-lg p-2 group-hover:bg-blue-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Job Mete</h1>
          </Link>

          {/* ナビゲーションメニュー */}
          <nav className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              ダッシュボード
            </Link>
            <Link
              to="/companies"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/companies')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              企業一覧
            </Link>
            <Link
              to="/events"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/events')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              予定管理
            </Link>
            <Link
              to="/trends"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/trends')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              傾向分析
            </Link>
          </nav>

          {/* ユーザーアイコン */}
          {user && (
            <button
              onClick={onUserIconClick}
              className="relative group"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-10 h-10 rounded-full border-2 border-blue-100 group-hover:border-blue-300 transition-all cursor-pointer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 group-hover:border-blue-300 group-hover:bg-blue-200 transition-all cursor-pointer">
                  <span className="text-lg font-bold text-blue-600">
                    {user.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
