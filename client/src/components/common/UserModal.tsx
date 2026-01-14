/**
 * ユーザー設定モーダルコンポーネント
 * 全ページで共通で使用するユーザー情報表示モーダル
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';
import AccountEditModal from './AccountEditModal';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Icons = {
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { companies } = useCompanies();
  const { events } = useEvents();

  // モーダル管理
  const [showEditModal, setShowEditModal] = useState(false);

  // 過去の予定数を計算
  const pastEventsCount = events.filter(
    (event) => new Date(event.date) < new Date()
  ).length;

  /**
   * 編集モーダルを開く
   */
  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 id="user-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">アカウント設定</h2>
            <button
              onClick={onClose}
              aria-label="モーダルを閉じる"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* ユーザー情報 */}
          <div className="flex flex-col items-center text-center pb-4 sm:pb-6 border-b border-gray-200">
            {/* プロフィール画像 */}
            <div className="relative mb-3 sm:mb-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-100 object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* 表示名とメールアドレス */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{user?.displayName}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{user?.email}</p>
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
            <button
              onClick={handleOpenEditModal}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              アカウント情報を編集
            </button>
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">連携済み</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Googleカレンダーとの連携を解除しますか？\n\n※ 既存の予定は削除されませんが、今後の自動同期が停止します。')) {
                    // TODO: 連携解除処理を実装
                    alert('連携解除機能は開発中です');
                  }
                }}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                連携を解除
              </button>
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
        <div className="p-4 sm:p-6 border-t border-gray-200 space-y-2 sm:space-y-3">
          <button
            onClick={handleLogout}
            aria-label="ログアウト"
            className="w-full bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
          >
            ログアウト
          </button>
          <button
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="w-full bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
          >
            閉じる
          </button>
        </div>
      </div>

      {/* アカウント編集モーダル */}
      <AccountEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}
