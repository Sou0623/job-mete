/**
 * 企業登録ページ
 * 企業名を入力して新しい企業を登録
 * TODO: 現在はFirestoreに直接保存。後でcreateCompany Functionに置き換える
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function CompanyFormPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateCompany, setDuplicateCompany] = useState<any>(null);

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

  /**
   * 企業名を正規化
   */
  const normalizeCompanyName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/株式会社|かぶしきがいしゃ|㈱/g, '')
      .replace(/\s+/g, '')
      .replace(/[\.、。・]/g, '');
  };

  /**
   * 重複チェック（企業名変更時）
   */
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!user || !companyName.trim()) {
        setDuplicateCompany(null);
        return;
      }

      try {
        setIsChecking(true);
        const normalized = normalizeCompanyName(companyName);
        const companiesRef = collection(db, 'users', user.uid, 'companies');
        const q = query(companiesRef, where('normalizedName', '==', normalized));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const existing = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          };
          setDuplicateCompany(existing);
        } else {
          setDuplicateCompany(null);
        }
      } catch (err) {
        console.error('重複チェックエラー:', err);
      } finally {
        setIsChecking(false);
      }
    };

    // デバウンス: 500ms後にチェック
    const timeoutId = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeoutId);
  }, [companyName, user]);

  /**
   * 企業登録処理（createCompany Functionを呼び出し）
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !companyName.trim()) {
      setError('企業名を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // createCompany Function を呼び出し
      const createCompanyFn = httpsCallable<
        { companyName: string },
        { success: boolean; companyId?: string; isDuplicate?: boolean; error?: string }
      >(functions, 'createCompany');

      const result = await createCompanyFn({
        companyName: companyName.trim(),
      });

      if (result.data.success && result.data.companyId) {
        // 詳細ページにリダイレクト
        navigate(`/companies/${result.data.companyId}`);
      } else {
        setError(result.data.error || '企業の登録に失敗しました');
      }
    } catch (err: any) {
      console.error('企業登録エラー:', err);

      // Firebase Functions のエラーメッセージを表示
      if (err.code === 'unauthenticated') {
        setError('認証が必要です。ログインし直してください。');
      } else if (err.code === 'invalid-argument') {
        setError(err.message || '企業名が不正です');
      } else {
        setError('企業分析中にエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 既存企業を見る
   */
  const handleViewExisting = () => {
    if (duplicateCompany) {
      navigate(`/companies/${duplicateCompany.id}`);
    }
  };

  /**
   * キャンセル
   */
  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
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
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">企業を追加</h2>

          <form onSubmit={handleSubmit}>
            {/* 企業名入力 */}
            <div className="mb-6">
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                企業名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例: 株式会社コドモン"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {isChecking && (
                <p className="text-sm text-gray-500 mt-2">
                  重複チェック中...
                </p>
              )}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* 重複警告 */}
            {duplicateCompany && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ この企業は既に登録されています
                </h4>
                <p className="text-yellow-700 text-sm mb-3">
                  {duplicateCompany.companyName}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleViewExisting}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium"
                  >
                    既存企業を見る
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium disabled:bg-gray-400"
                  >
                    それでも新規登録
                  </button>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            {!duplicateCompany && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !companyName.trim()}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {isSubmitting ? 'AI分析中...' : '企業を登録'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  キャンセル
                </button>
              </div>
            )}
          </form>

          {/* 注意事項 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>💡 Gemini AI分析:</strong> 企業登録時に、Gemini AIが自動的に企業情報を分析します。
              分析には数秒かかる場合があります。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
