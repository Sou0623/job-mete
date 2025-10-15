/**
 * ヘッダーコンポーネント
 * アプリ全体で使用する統一ヘッダー
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  /**
   * 現在のパスかどうかを判定
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">Job Mete</h1>
          </Link>

          {/* ナビゲーションメニュー */}
          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ダッシュボード
            </Link>
            <Link
              to="/companies"
              className={`text-sm font-medium transition-colors ${
                isActive('/companies')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              企業一覧
            </Link>
            <Link
              to="/events"
              className={`text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              予定管理
            </Link>
            <Link
              to="/trends"
              className={`text-sm font-medium transition-colors ${
                isActive('/trends')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              傾向分析
            </Link>
          </nav>

          {/* ユーザー情報 */}
          {user && (
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {user.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
