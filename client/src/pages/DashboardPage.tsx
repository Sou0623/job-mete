/**
 * ダッシュボードページ
 * ログイン後のメインページ（プレースホルダー）
 */

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-blue-600">Job Mete</h1>

          <div className="flex items-center gap-4">
            {user && (
              <>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'ユーザー'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ダッシュボード
          </h2>
          <p className="text-gray-600 mb-4">
            ようこそ、{user?.displayName} さん！
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              🎉 ログインに成功しました！
            </p>
            <p className="text-blue-600 text-sm mt-2">
              このページはプレースホルダーです。今後、企業一覧や予定管理などの機能が追加されます。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
