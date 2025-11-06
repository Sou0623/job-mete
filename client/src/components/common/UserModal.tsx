/**
 * ユーザー設定モーダルコンポーネント
 * 全ページで共通で使用するユーザー情報表示モーダル
 */

import { useState, useRef, useEffect } from 'react';
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { companies } = useCompanies();
  const { events } = useEvents();

  // 編集モード管理
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 過去の予定数を計算
  const pastEventsCount = events.filter(
    (event) => new Date(event.date) < new Date()
  ).length;

  /**
   * モーダルが開いたときに状態をリセット
   */
  useEffect(() => {
    if (isOpen) {
      setDisplayName(user?.displayName || '');
      setIsEditing(false);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, user?.displayName]);

  /**
   * 編集モードを開始
   */
  const handleStartEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * 編集をキャンセル
   */
  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * プロフィールを保存
   */
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateUserProfile(displayName.trim());

      setSuccessMessage('プロフィールを更新しました');
      setIsEditing(false);

      // 成功メッセージを2秒後に非表示
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 画像ファイル選択
   */
  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 画像アップロード（Data URLとして保存）
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（2MB以下）
    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // FileをData URLに変換
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoURL = reader.result as string;

        try {
          await updateUserProfile(displayName || user?.displayName || '', photoURL);
          setSuccessMessage('プロフィール画像を更新しました');

          // 成功メッセージを2秒後に非表示
          setTimeout(() => {
            setSuccessMessage(null);
          }, 2000);
        } catch (err) {
          console.error('画像更新エラー:', err);
          setError('画像の更新に失敗しました');
        } finally {
          setIsSaving(false);
        }
      };

      reader.onerror = () => {
        setError('画像の読み込みに失敗しました');
        setIsSaving(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('画像処理エラー:', err);
      setError('画像の処理に失敗しました');
      setIsSaving(false);
    }
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
          {/* エラー・成功メッセージ */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-2.5 sm:p-3 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-xs sm:text-sm text-red-900">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-2.5 sm:p-3 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xs sm:text-sm text-green-900">{successMessage}</p>
            </div>
          )}

          {/* ユーザー情報 */}
          <div className="flex flex-col items-center text-center pb-4 sm:pb-6 border-b border-gray-200">
            {/* プロフィール画像 */}
            <div className="relative mb-3 sm:mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="プロフィール画像を選択"
                className="hidden"
              />
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-100 ${
                    isEditing ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
                  }`}
                  onClick={handleImageClick}
                />
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200 ${
                    isEditing ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''
                  }`}
                  onClick={handleImageClick}
                >
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors" onClick={handleImageClick}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
              {isEditing && (
                <p className="text-xs text-gray-500 mt-2">画像をクリックして変更</p>
              )}
            </div>

            {/* 表示名 */}
            {isEditing ? (
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="表示名を入力"
                  aria-label="表示名"
                  className="w-full text-lg sm:text-xl font-bold text-gray-900 text-center border-2 border-blue-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{user?.displayName}</h3>
            )}
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{user?.email}</p>

            {/* 編集ボタン */}
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                プロフィールを編集
              </button>
            ) : (
              <div className="flex gap-2 mt-3 sm:mt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      保存
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  キャンセル
                </button>
              </div>
            )}
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
    </div>
  );
}
