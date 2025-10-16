/**
 * ユーザー設定モーダルコンポーネント
 * 全ページで共通で使用するユーザー情報表示モーダル
 */

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Icons = {
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { companies } = useCompanies();
  const { events } = useEvents();

  // 過去の予定数を計算
  const pastEventsCount = events.filter(
    (event) => new Date(event.date) < new Date()
  ).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">アカウント設定</h2>
            <button
              onClick={onClose}
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
                className="w-24 h-24 rounded-full mb-4 border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mb-4 bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                <span className="text-4xl font-bold text-blue-600">
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
                <Icons.Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Googleカレンダー</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                予定を自動的にGoogleカレンダーに同期します
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">連携済み</span>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">利用状況</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{companies.length}</p>
                <p className="text-xs text-gray-600 mt-1">企業</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{events.length}</p>
                <p className="text-xs text-gray-600 mt-1">予定</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pastEventsCount}</p>
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
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
