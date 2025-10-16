/**
 * 企業詳細ページ
 * 企業の分析結果、ユーザーメモ、関連予定を表示
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc, collection, query, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import type { ReanalyzeCompanyRequest, ReanalyzeCompanyResponse } from '@/types';

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user, logout } = useAuth();
  const { company, loading, error } = useCompany(companyId);
  const navigate = useNavigate();

  const [userNotes, setUserNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

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
   * 一覧ページに戻る
   */
  const handleBack = () => {
    navigate('/companies');
  };

  /**
   * ユーザーメモを保存
   */
  const handleSaveNotes = async () => {
    if (!user || !companyId) return;

    try {
      setIsSavingNotes(true);
      const companyRef = doc(db, 'users', user.uid, 'companies', companyId);
      await updateDoc(companyRef, {
        userNotes,
        updatedAt: new Date().toISOString(),
      });
      setIsEditingNotes(false);
    } catch (error) {
      console.error('メモ保存エラー:', error);
      alert('メモの保存に失敗しました');
    } finally {
      setIsSavingNotes(false);
    }
  };

  /**
   * メモ編集を開始
   */
  const handleEditNotes = () => {
    setUserNotes(company?.userNotes || '');
    setIsEditingNotes(true);
  };

  /**
   * メモ編集をキャンセル
   */
  const handleCancelEdit = () => {
    setUserNotes('');
    setIsEditingNotes(false);
  };

  /**
   * 再分析を実行
   */
  const handleReanalyze = async () => {
    if (!user || !companyId) return;

    const confirmed = window.confirm(
      '企業情報を再分析しますか？\n最新の情報に更新されます。'
    );

    if (!confirmed) return;

    try {
      setIsReanalyzing(true);

      const reanalyzeCompanyFn = httpsCallable<
        ReanalyzeCompanyRequest,
        ReanalyzeCompanyResponse
      >(functions, 'reanalyzeCompany');

      const result = await reanalyzeCompanyFn({ companyId });

      if (result.data.success) {
        alert('✅ ' + result.data.message);
        // ページをリロードして最新データを表示
        window.location.reload();
      } else {
        alert('再分析に失敗しました');
      }
    } catch (err: any) {
      console.error('再分析エラー:', err);

      if (err.code === 'unauthenticated') {
        alert('認証が必要です。ログインし直してください。');
      } else if (err.code === 'not-found') {
        alert('企業が見つかりません');
      } else {
        alert('再分析に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsReanalyzing(false);
    }
  };

  /**
   * 企業削除を確認
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * 企業削除をキャンセル
   */
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * 企業削除を実行
   */
  const handleDeleteConfirm = async () => {
    if (!user || !companyId || !company) return;

    try {
      setIsDeleting(true);

      // 関連する予定を取得して削除
      const eventsRef = collection(db, 'users', user.uid, 'events');
      const eventsQuery = query(eventsRef);
      const eventsSnapshot = await getDocs(eventsQuery);

      const relatedEvents = eventsSnapshot.docs.filter(
        (doc) => doc.data().companyId === companyId
      );

      // 予定を削除
      for (const eventDoc of relatedEvents) {
        await deleteDoc(eventDoc.ref);
      }

      // 企業を削除
      const companyRef = doc(db, 'users', user.uid, 'companies', companyId);
      await deleteDoc(companyRef);

      // 企業一覧に戻る
      navigate('/companies');
    } catch {
      alert('企業の削除に失敗しました');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * 再分析が必要かどうか（30日経過）
   */
  const needsReanalysis = (): boolean => {
    if (!company) return false;
    const analyzedAt = new Date(company.analysisMetadata.analyzedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - analyzedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 30;
  };

  /**
   * 日付をフォーマット
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ローディング状態
  if (loading) {
    return <Loading fullScreen />;
  }

  // エラー状態
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <ErrorMessage
            message={error || '企業が見つかりません'}
            action={{
              label: '企業一覧に戻る',
              onClick: handleBack,
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
        >
          ← 企業一覧に戻る
        </button>

        {/* 企業名 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {company.companyName}
              </h2>
              {company.analysis.industryPosition && (
                <p className="text-lg text-gray-600">
                  {company.analysis.industryPosition}
                </p>
              )}
            </div>

            {/* 統計情報 */}
            <div className="text-right text-sm text-gray-600">
              <p>予定: {company.stats.eventCount}件</p>
              <p className="mt-1">
                分析日: {formatDate(company.analysisMetadata.analyzedAt)}
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {needsReanalysis() && (
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                {isReanalyzing ? '再分析中...' : '🔄 再分析'}
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              disabled={isReanalyzing}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
            >
              🗑️ 企業を削除
            </button>
          </div>
        </div>

        {/* 分析結果 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">企業分析</h3>

          {/* 事業内容 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              事業内容
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {company.analysis.businessOverview}
            </p>
          </div>

          {/* 強み */}
          {company.analysis.strengths && company.analysis.strengths.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">強み</h4>
              <div className="flex flex-wrap gap-2">
                {company.analysis.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 最近の動向 */}
          {company.analysis.recentNews && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                最近の動向
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {company.analysis.recentNews}
              </p>
            </div>
          )}

          {/* 採用情報 */}
          {company.analysis.recruitmentInsights && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                採用情報
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {company.analysis.recruitmentInsights}
              </p>
            </div>
          )}
        </div>

        {/* ユーザーメモ */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">メモ</h3>
            {!isEditingNotes && (
              <button
                onClick={handleEditNotes}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                編集
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="企業に関するメモを入力..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {isSavingNotes ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingNotes}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              {company.userNotes ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {company.userNotes}
                </p>
              ) : (
                <p className="text-gray-500 italic">メモはまだありません</p>
              )}
            </div>
          )}
        </div>

        {/* デバッグ情報（開発用） */}
        {company.analysisMetadata.prompt && company.analysisMetadata.rawResponse && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <h3 className="text-2xl font-bold text-gray-900">
                デバッグ情報（AIプロンプト・レスポンス）
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              ※ このセクションは、AIがどのようなプロンプトで分析し、どのようなレスポンスを返したかを可視化するためのデバッグ用です。
              <br />
              データの透明性を確保し、不正な活用をしていないことを証明するために表示しています。
            </p>

            {/* 送信したプロンプト */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📤</span>
                送信したプロンプト
              </h4>
              <div className="bg-white border border-yellow-300 rounded-md p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
                  {company.analysisMetadata.prompt}
                </pre>
              </div>
            </div>

            {/* Geminiからのレスポンス */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📥</span>
                Gemini APIからのレスポンス（JSON）
              </h4>
              <div className="bg-white border border-yellow-300 rounded-md p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
                  {JSON.stringify(JSON.parse(company.analysisMetadata.rawResponse), null, 2)}
                </pre>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="mt-6 pt-6 border-t border-yellow-300">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                分析メタ情報
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white border border-yellow-300 rounded-md p-3">
                  <span className="font-semibold text-gray-700">使用モデル:</span>{' '}
                  <span className="text-gray-900">{company.analysisMetadata.modelUsed}</span>
                </div>
                <div className="bg-white border border-yellow-300 rounded-md p-3">
                  <span className="font-semibold text-gray-700">分析日時:</span>{' '}
                  <span className="text-gray-900">{formatDate(company.analysisMetadata.analyzedAt)}</span>
                </div>
                <div className="bg-white border border-yellow-300 rounded-md p-3">
                  <span className="font-semibold text-gray-700">バージョン:</span>{' '}
                  <span className="text-gray-900">{company.analysisMetadata.version}</span>
                </div>
                <div className="bg-white border border-yellow-300 rounded-md p-3">
                  <span className="font-semibold text-gray-700">ステータス:</span>{' '}
                  <span className="text-gray-900">{company.analysisMetadata.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              企業を削除しますか？
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>{company?.companyName}</strong> を削除します。
            </p>
            <p className="text-red-600 text-sm mb-6">
              ⚠️ この操作は取り消せません。関連する予定もすべて削除されます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
