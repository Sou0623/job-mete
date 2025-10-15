/**
 * ダッシュボードページ
 * ログイン後のメインページ（プレースホルダー）
 */

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

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
