/**
 * 企業詳細ページ
 * 企業の分析結果、ユーザーメモ、関連予定を表示
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, deleteDoc, collection, query, where, getDocs, orderBy, FirestoreError } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import { db, functions } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import Header from '@/components/layout/Header';
import UserModal from '@/components/common/UserModal';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import type { ReanalyzeCompanyRequest, ReanalyzeCompanyResponse, Event } from '@/types';

/**
 * 旧データ構造の型定義（後方互換性のため）
 */
type LegacyCompanyAnalysis = {
  businessOverview?: string;
  strengths?: string[];
  recentNews?: string;
  recruitmentInsights?: string;
  industryPosition?: string;
};

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const { company, loading, error } = useCompany(companyId);
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  /**
   * 企業に関連するイベントを取得
   */
  useEffect(() => {
    if (!user || !companyId) return;

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const eventsRef = collection(db, 'users', user.uid, 'events');
        const q = query(
          eventsRef,
          where('companyId', '==', companyId),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);

        const fetchedEvents: Event[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Event));

        setEvents(fetchedEvents);
      } catch (error: unknown) {
        console.error('イベント取得エラー:', error);

        // FirestoreErrorの場合、詳細なエラー情報をログに記録
        if (error instanceof FirestoreError) {
          console.error('Firestore エラーコード:', error.code);
          console.error('Firestore エラーメッセージ:', error.message);
        } else if (error instanceof Error) {
          console.error('エラーメッセージ:', error.message);
        }
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user, companyId]);

  /**
   * 一覧ページに戻る
   */
  const handleBack = () => {
    navigate('/companies');
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
    } catch (err: unknown) {
      console.error('再分析エラー:', err);

      if (err instanceof FirebaseError) {
        console.error('Firebase エラーコード:', err.code);
        console.error('Firebase エラーメッセージ:', err.message);

        if (err.code === 'unauthenticated') {
          alert('認証が必要です。ログインし直してください。');
        } else if (err.code === 'not-found') {
          alert('企業が見つかりません');
        } else if (err.code === 'functions/resource-exhausted') {
          alert('API制限に達しました。しばらく待ってから再度お試しください。');
        } else if (err.code === 'functions/deadline-exceeded') {
          alert('処理がタイムアウトしました。もう一度お試しください。');
        } else {
          alert(`再分析に失敗しました: ${err.message}`);
        }
      } else if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        alert(`再分析に失敗しました: ${err.message}`);
      } else {
        alert('予期しないエラーが発生しました。もう一度お試しください。');
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
    } catch (error: unknown) {
      console.error('企業削除エラー:', error);

      let errorMessage = '企業の削除に失敗しました';

      if (error instanceof FirestoreError) {
        console.error('Firestore エラーコード:', error.code);
        console.error('Firestore エラーメッセージ:', error.message);

        if (error.code === 'permission-denied') {
          errorMessage = '削除する権限がありません。';
        } else if (error.code === 'not-found') {
          errorMessage = '削除対象の企業が見つかりません。';
        } else {
          errorMessage = `削除に失敗しました: ${error.message}`;
        }
      } else if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message);
        errorMessage = `削除に失敗しました: ${error.message}`;
      }

      alert(errorMessage);
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

  /**
   * 日時をフォーマット（イベント用）
   */
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * マッチ度に応じた色クラスを取得
   */
  const getMatchRateColor = (rate: number): string => {
    if (rate >= 4) return 'bg-green-50 text-[#47845E] border-green-200';
    if (rate >= 3) return 'bg-yellow-50 text-[#CAC75C] border-yellow-200';
    return 'bg-red-50 text-[#E57373] border-red-200';
  };

  /**
   * ステータスのラベルと色を取得
   */
  const getStatusStyle = (status: string): { label: string; className: string } => {
    const statusMap: Record<string, { label: string; className: string }> = {
      scheduled: { label: '予定', className: 'bg-blue-50 text-[#1A4472] border-blue-200' },
      completed: { label: '完了', className: 'bg-green-50 text-[#47845E] border-green-200' },
      cancelled: { label: 'キャンセル', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  /**
   * 結果のラベルと色を取得
   */
  const getResultStyle = (result: string | null | undefined): { label: string; className: string } => {
    if (!result) return { label: '未定', className: 'bg-gray-100 text-gray-600 border-gray-300' };
    const resultMap: Record<string, { label: string; className: string }> = {
      passed: { label: '合格', className: 'bg-green-50 text-[#47845E] border-green-200' },
      failed: { label: '不合格', className: 'bg-red-50 text-[#E57373] border-red-200' },
      waiting: { label: '結果待ち', className: 'bg-yellow-50 text-[#FFB74D] border-yellow-200' },
    };
    return resultMap[result] || { label: result, className: 'bg-gray-100 text-gray-600' };
  };

  /**
   * 古いデータ構造かどうかを判定
   */
  const isLegacyAnalysis = (analysis: unknown): analysis is LegacyCompanyAnalysis => {
    return (
      typeof analysis === 'object' &&
      analysis !== null &&
      ('businessOverview' in analysis || 'strengths' in analysis || 'recentNews' in analysis)
    );
  };

  // ローディング状態
  if (loading) {
    return <Loading fullScreen />;
  }

  // エラー状態
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onUserIconClick={() => setShowUserModal(true)} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <ErrorMessage
            message={error || '企業が見つかりません'}
            action={{
              label: '企業一覧に戻る',
              onClick: handleBack,
            }}
          />
        </main>

        <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="text-[#1A4472] hover:text-[#47845E] mb-6 flex items-center gap-2 font-medium"
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
              {/* 業界バッジ */}
              {company.analysis.marketAnalysis?.industry && (
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-[#1A4472] px-4 py-1 rounded-full text-sm font-medium border border-blue-300">
                    {company.analysis.marketAnalysis.industry}業界
                  </span>
                </div>
              )}
              {(company.analysis.marketAnalysis?.industryPosition || (company.analysis as LegacyCompanyAnalysis).industryPosition) && (
                <p className="text-lg text-gray-600">
                  {company.analysis.marketAnalysis?.industryPosition || (company.analysis as LegacyCompanyAnalysis).industryPosition}
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
                className="bg-[#FFB74D] text-white px-4 py-2 rounded-lg hover:bg-[#FFA726] disabled:bg-gray-400 transition-colors font-medium text-sm shadow-sm"
              >
                {isReanalyzing ? '再分析中...' : '🔄 再分析'}
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              disabled={isReanalyzing}
              className="bg-[#E57373] text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors font-medium text-sm shadow-sm"
            >
              🗑️ 企業を削除
            </button>
          </div>
        </div>

        {/* 分析結果 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">企業分析</h3>

          {isLegacyAnalysis(company.analysis) ? (
            /* 旧データ構造の表示 */
            <>
              {/* 事業内容 */}
              {company.analysis.businessOverview && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    事業内容
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {company.analysis.businessOverview}
                  </p>
                </div>
              )}

              {/* 強み */}
              {company.analysis.strengths && company.analysis.strengths.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">強み</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.analysis.strengths.map((strength: string, index: number) => (
                      <span
                        key={index}
                        className="bg-green-100 text-[#2E7D4D] px-4 py-2 rounded-md font-medium border border-green-300"
                      >
                        ✓ {strength}
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
            </>
          ) : (
            /* 新データ構造の表示 */
            <>
              {/* I. 企業概要 */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-[#1A4472] mb-4 pb-2 border-b-2 border-[#1A4472]">
                  I. 企業概要
                </h4>

                {/* ミッション */}
                {company.analysis.corporateProfile?.mission && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">ミッション・ビジョン</h5>
                    <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
                      {company.analysis.corporateProfile.mission}
                    </p>
                  </div>
                )}

                {/* 事業概要 */}
                {company.analysis.corporateProfile?.businessSummary && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">事業概要</h5>
                    <p className="text-gray-700 leading-relaxed">
                      {company.analysis.corporateProfile.businessSummary}
                    </p>
                  </div>
                )}
              </div>

          {/* II. 企業の強みと市場環境 */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-[#1A4472] mb-4 pb-2 border-b-2 border-[#1A4472]">
              II. 企業の強みと市場環境
            </h4>

            {/* 強み */}
            {company.analysis.marketAnalysis?.strengths && company.analysis.marketAnalysis.strengths.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">強み</h5>
                <div className="flex flex-wrap gap-2">
                  {company.analysis.marketAnalysis.strengths.map((strength, index) => (
                    <span
                      key={index}
                      className="bg-green-50 text-[#47845E] px-4 py-2 rounded-md font-medium border border-green-200"
                    >
                      ✓ {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 弱み・課題 */}
            {company.analysis.marketAnalysis?.weaknesses && company.analysis.marketAnalysis.weaknesses.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">弱み・課題</h5>
                <div className="flex flex-wrap gap-2">
                  {company.analysis.marketAnalysis.weaknesses.map((weakness, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-4 py-2 rounded-md font-medium border border-orange-300"
                    >
                      ▲ {weakness}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 業界ポジション */}
            {company.analysis.marketAnalysis?.industryPosition && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">業界ポジション</h5>
                <p className="text-gray-700 leading-relaxed">
                  {company.analysis.marketAnalysis.industryPosition}
                </p>
              </div>
            )}

            {/* 競合他社 */}
            {company.analysis.marketAnalysis?.competitors && company.analysis.marketAnalysis.competitors.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-2">主な競合他社</h5>
                <div className="flex flex-wrap gap-2">
                  {company.analysis.marketAnalysis.competitors.map((competitor, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
                    >
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* III. 将来の方向性 */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-[#1A4472] mb-4 pb-2 border-b-2 border-[#1A4472]">
              III. 将来の方向性
            </h4>

            {/* 最近の動向 */}
            {company.analysis.futureDirection?.recentTrends && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">最近の動向</h5>
                <p className="text-gray-700 leading-relaxed">
                  {company.analysis.futureDirection.recentTrends}
                </p>
              </div>
            )}

            {/* 成長性・将来性 */}
            {company.analysis.futureDirection?.growthPotential && (
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-2">成長性・将来性</h5>
                <p className="text-gray-700 leading-relaxed bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {company.analysis.futureDirection.growthPotential}
                </p>
              </div>
            )}
          </div>

          {/* IV. 働く環境と文化 */}
          <div>
            <h4 className="text-xl font-bold text-[#1A4472] mb-4 pb-2 border-b-2 border-[#1A4472]">
              IV. 働く環境と文化
            </h4>

            {/* 社風・組織文化 */}
            {company.analysis.workEnvironment?.corporateCulture && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">社風・組織文化</h5>
                <p className="text-gray-700 leading-relaxed">
                  {company.analysis.workEnvironment.corporateCulture}
                </p>
              </div>
            )}

            {/* キャリアパス */}
            {company.analysis.workEnvironment?.careerPath && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">キャリアパス</h5>
                <p className="text-gray-700 leading-relaxed">
                  {company.analysis.workEnvironment.careerPath}
                </p>
              </div>
            )}

            {/* 採用情報 */}
            {company.analysis.workEnvironment?.hiringInfo && (
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-2">採用情報・求める人物像</h5>
                <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg border border-purple-200">
                  {company.analysis.workEnvironment.hiringInfo}
                </p>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* イベント履歴 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">イベント履歴</h3>
            <span className="text-sm text-gray-600">{events.length}件</span>
          </div>

          {loadingEvents ? (
            <div className="text-center py-8 text-gray-600">
              イベント履歴を読み込み中...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              この企業に関連するイベントはまだありません
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const statusStyle = getStatusStyle(event.status);
                const resultStyle = getResultStyle(event.result);

                return (
                  <div
                    key={event.id}
                    className="border-2 border-gray-200 rounded-lg p-5 hover:border-[#1A4472] transition-colors cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {/* イベントヘッダー */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            {event.eventType}
                          </span>
                          {event.jobPosition && (
                            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-300">
                              {event.jobPosition}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(event.date)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                        {event.result && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${resultStyle.className}`}>
                            {resultStyle.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* レビュー情報 */}
                    {event.review && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">レビュー</h5>

                        {/* マッチ度 */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">企業マッチ度</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-bold px-3 py-1 rounded-md border ${getMatchRateColor(event.review.companyMatchRate)}`}>
                                {event.review.companyMatchRate}/5
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    event.review.companyMatchRate >= 4
                                      ? 'bg-green-500'
                                      : event.review.companyMatchRate >= 3
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(event.review.companyMatchRate / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 mb-1">職種マッチ度</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-bold px-3 py-1 rounded-md border ${getMatchRateColor(event.review.jobMatchRate)}`}>
                                {event.review.jobMatchRate}/5
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    event.review.jobMatchRate >= 4
                                      ? 'bg-green-500'
                                      : event.review.jobMatchRate >= 3
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(event.review.jobMatchRate / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* フィードバック */}
                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {event.review.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 結果メモ */}
                    {event.resultMemo && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">結果メモ</h5>
                        <div className="bg-blue-50 rounded-md p-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {event.resultMemo}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 詳細リンク */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-[#1A4472] hover:text-[#47845E] font-medium">
                        クリックして詳細を見る →
                      </p>
                    </div>
                  </div>
                );
              })}
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

      {/* ユーザー設定モーダル */}
      <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
