/**
 * プロフィール初期設定ページ
 * 初回ログイン時にユーザー情報を設定する画面
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSetupPage() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 画像ファイル選択
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 画像変更処理
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setError(null);
    setPhotoFile(file);

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * プロフィール設定を完了
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 画像がある場合はData URLに変換
      let photoURL = user?.photoURL;
      if (photoFile) {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = () => {
            photoURL = reader.result as string;
            resolve();
          };
          reader.onerror = () => {
            reject(new Error('画像の読み込みに失敗しました'));
          };
          reader.readAsDataURL(photoFile);
        });
      }

      // プロフィールを更新
      await updateUserProfile(displayName.trim(), photoURL);

      // ダッシュボードへ遷移
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('プロフィール設定エラー:', err);
      setError('プロフィールの設定に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * スキップしてダッシュボードへ
   */
  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="bg-[#1A4472] text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール設定</h1>
          <p className="text-gray-600">あなたの情報を設定してください</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プロフィール画像 */}
          <div className="flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="relative mb-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="プロフィール画像プレビュー"
                  className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={handleImageClick}
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={handleImageClick}
                >
                  <span className="text-5xl font-bold text-blue-600">
                    {displayName.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={handleImageClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600">画像をクリックして変更（任意）</p>
          </div>

          {/* 表示名入力 */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              表示名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">アプリ内で表示される名前です</p>
          </div>

          {/* メールアドレス（読み取り専用） */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* ボタン */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  設定中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  設定を完了
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              後で設定する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
