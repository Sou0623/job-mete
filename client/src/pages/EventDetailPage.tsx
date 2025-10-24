/**
 * 予定詳細ページ
 * 予定の詳細情報を表示し、結果記録が可能
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, FirestoreError } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import type { Event, EventStatus, Result } from '@/types/event';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingResult, setIsEditingResult] = useState(false);
  const [status, setStatus] = useState<EventStatus>('scheduled');
  const [result, setResult] = useState<Result>(null);
  const [resultMemo, setResultMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // レビュー関連のstate
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [companyMatchRate, setCompanyMatchRate] = useState(3);
  const [jobMatchRate, setJobMatchRate] = useState(3);
  const [isSavingReview, setIsSavingReview] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * 予定データを取得
   */
  useEffect(() => {
    if (!user || !eventId) return;

    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, 'users', user.uid, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
          setError('予定が見つかりません');
          setLoading(false);
          return;
        }

        const eventData = {
          id: eventSnap.id,
          ...eventSnap.data(),
        } as Event;

        setEvent(eventData);
        setStatus(eventData.status);
        setResult(eventData.result || null);
        setResultMemo(eventData.resultMemo || '');

        // レビュー情報の読み込み
        if (eventData.review) {
          setReviewFeedback(eventData.review.feedback || '');
          setCompanyMatchRate(eventData.review.companyMatchRate || 3);
          setJobMatchRate(eventData.review.jobMatchRate || 3);
        }

        setLoading(false);
      } catch (err: unknown) {
        console.error('予定取得エラー:', err);

        let errorMessage = '予定データの取得に失敗しました';

        if (err instanceof FirestoreError) {
          console.error('Firestore エラーコード:', err.code);
          console.error('Firestore エラーメッセージ:', err.message);

          if (err.code === 'permission-denied') {
            errorMessage = 'この予定にアクセスする権限がありません。';
          } else if (err.code === 'not-found') {
            errorMessage = '予定が見つかりません。';
          } else {
            errorMessage = `予定の取得に失敗しました: ${err.message}`;
          }
        } else if (err instanceof Error) {
          console.error('エラーメッセージ:', err.message);
          errorMessage = `予定の取得に失敗しました: ${err.message}`;
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [user, eventId]);

  /**
   * 一覧ページに戻る
   */
  const handleBack = () => {
    navigate('/events');
  };

  /**
   * 企業詳細ページに遷移
   */
  const handleViewCompany = () => {
    if (event) {
      navigate(`/companies/${event.companyId}`);
    }
  };

  /**
   * 結果編集を開始
   */
  const handleEditResult = () => {
    setIsEditingResult(true);
  };

  /**
   * 結果編集をキャンセル
   */
  const handleCancelEdit = () => {
    if (event) {
      setStatus(event.status);
      setResult(event.result || null);
      setResultMemo(event.resultMemo || '');
    }
    setIsEditingResult(false);
  };

  /**
   * レビュー編集を開始
   */
  const handleEditReview = () => {
    setIsEditingReview(true);
  };

  /**
   * レビュー編集をキャンセル
   */
  const handleCancelReviewEdit = () => {
    if (event?.review) {
      setReviewFeedback(event.review.feedback || '');
      setCompanyMatchRate(event.review.companyMatchRate || 3);
      setJobMatchRate(event.review.jobMatchRate || 3);
    } else {
      setReviewFeedback('');
      setCompanyMatchRate(3);
      setJobMatchRate(3);
    }
    setIsEditingReview(false);
  };

  /**
   * レビューを保存
   */
  const handleSaveReview = async () => {
    if (!user || !eventId) return;

    try {
      setIsSavingReview(true);
      const eventRef = doc(db, 'users', user.uid, 'events', eventId);
      await updateDoc(eventRef, {
        review: {
          feedback: reviewFeedback,
          companyMatchRate,
          jobMatchRate,
          reviewedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              review: {
                feedback: reviewFeedback,
                companyMatchRate,
                jobMatchRate,
                reviewedAt: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            }
          : null
      );

      setIsEditingReview(false);
    } catch (err: unknown) {
      console.error('レビュー保存エラー:', err);

      let errorMessage = 'レビューの保存に失敗しました';

      if (err instanceof FirestoreError) {
        console.error('Firestore エラーコード:', err.code);
        console.error('Firestore エラーメッセージ:', err.message);

        if (err.code === 'permission-denied') {
          errorMessage = 'レビューを保存する権限がありません。';
        } else if (err.code === 'not-found') {
          errorMessage = '予定が見つかりません。ページを更新してください。';
        } else if (err.code === 'unavailable') {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          errorMessage = `レビューの保存に失敗しました: ${err.message}`;
        }
      } else if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        errorMessage = `レビューの保存に失敗しました: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSavingReview(false);
    }
  };

  /**
   * 結果を保存
   */
  const handleSaveResult = async () => {
    if (!user || !eventId) return;

    try {
      setIsSaving(true);
      const eventRef = doc(db, 'users', user.uid, 'events', eventId);
      await updateDoc(eventRef, {
        status,
        result,
        resultMemo,
        updatedAt: new Date().toISOString(),
      });

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              status,
              result,
              resultMemo,
              updatedAt: new Date().toISOString(),
            }
          : null
      );

      setIsEditingResult(false);
    } catch (err: unknown) {
      console.error('結果保存エラー:', err);

      let errorMessage = '結果の保存に失敗しました';

      if (err instanceof FirestoreError) {
        console.error('Firestore エラーコード:', err.code);
        console.error('Firestore エラーメッセージ:', err.message);

        if (err.code === 'permission-denied') {
          errorMessage = '結果を保存する権限がありません。';
        } else if (err.code === 'not-found') {
          errorMessage = '予定が見つかりません。ページを更新してください。';
        } else if (err.code === 'unavailable') {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          errorMessage = `結果の保存に失敗しました: ${err.message}`;
        }
      } else if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        errorMessage = `結果の保存に失敗しました: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 予定削除を確認
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * 予定削除をキャンセル
   */
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * 予定削除を実行
   */
  const handleDeleteConfirm = async () => {
    if (!user || !eventId || !event) return;

    try {
      setIsDeleting(true);

      // 予定を削除
      const eventRef = doc(db, 'users', user.uid, 'events', eventId);
      await deleteDoc(eventRef);

      // TODO: 企業統計を更新（eventCount--, lastEventDate更新）
      // Issue #補足実装で対応

      // 予定一覧に戻る
      navigate('/events');
    } catch (err: unknown) {
      console.error('予定削除エラー:', err);

      let errorMessage = '予定の削除に失敗しました';

      if (err instanceof FirestoreError) {
        console.error('Firestore エラーコード:', err.code);
        console.error('Firestore エラーメッセージ:', err.message);

        if (err.code === 'permission-denied') {
          errorMessage = '削除する権限がありません。';
        } else if (err.code === 'not-found') {
          errorMessage = '削除対象の予定が見つかりません。';
        } else {
          errorMessage = `削除に失敗しました: ${err.message}`;
        }
      } else if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        errorMessage = `削除に失敗しました: ${err.message}`;
      }

      alert(errorMessage);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * 日時をフォーマット
   */
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * マッチ度メモリUIを描画（5段階評価）
   */
  const renderMatchRateMemory = (rate: number, onChange: (rate: number) => void, disabled: boolean = false) => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => !disabled && onChange(level)}
            disabled={disabled}
            className={`w-12 h-12 rounded-lg border-2 transition-all ${
              level <= rate
                ? level <= 2
                  ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-600 shadow-md'
                  : level === 3
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-600 shadow-md'
                  : 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 shadow-md'
                : 'bg-white border-gray-300'
            } ${!disabled ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          >
            <span className={`text-sm font-bold ${level <= rate ? 'text-white' : 'text-gray-400'}`}>
              {level}
            </span>
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2 font-medium">
          {rate === 1 && '20%'}
          {rate === 2 && '40%'}
          {rate === 3 && '60%'}
          {rate === 4 && '80%'}
          {rate === 5 && '100%'}
        </span>
      </div>
    );
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // エラー状態
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <p className="text-red-800 text-lg mb-4">{error || '予定が見つかりません'}</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              予定一覧に戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
        >
          ← 予定一覧に戻る
        </button>

        {/* 予定情報 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.companyName}</h2>
              <p className="text-xl text-gray-700">{event.eventType}</p>
            </div>

            {/* ステータスバッジ */}
            <div className="flex flex-col items-end gap-2">
              {event.status === 'scheduled' && (
                <span className="bg-blue-100 text-[#1A4472] px-4 py-2 rounded-full text-sm font-semibold border border-blue-300">
                  予定
                </span>
              )}
              {event.status === 'completed' && (
                <span className="bg-green-100 text-[#2E7D4D] px-4 py-2 rounded-full text-sm font-semibold border border-green-300">
                  完了
                </span>
              )}
              {event.status === 'cancelled' && (
                <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold border border-gray-300">
                  キャンセル
                </span>
              )}
            </div>
          </div>

          {/* 日時・場所 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span>📅</span>
              <span>{formatDateTime(event.date)}</span>
              <span>〜</span>
              <span>{formatDateTime(event.endDate)}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}

            {event.googleCalendar && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                {event.googleCalendar.syncStatus === 'synced' && (
                  <>
                    <span>✅</span>
                    <span>Googleカレンダーと同期済み</span>
                  </>
                )}
                {event.googleCalendar.syncStatus === 'pending' && (
                  <>
                    <span>⏳</span>
                    <span>Googleカレンダーと同期中</span>
                  </>
                )}
                {event.googleCalendar.syncStatus === 'failed' && (
                  <>
                    <span>⚠️</span>
                    <span>Googleカレンダー同期失敗</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* メモ */}
          {event.memo && (
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">メモ</h4>
              <p className="text-gray-800 whitespace-pre-wrap">{event.memo}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleViewCompany}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              企業情報を見る
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/edit`)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
            >
              ✏️ 予定を編集
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
            >
              🗑️ 予定を削除
            </button>
          </div>
        </div>

        {/* 職種情報 */}
        {event.jobPosition && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">応募職種</h3>
            <p className="text-gray-700 font-medium">{event.jobPosition}</p>
          </div>
        )}

        {/* 結果記録 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">結果記録</h3>
            {!isEditingResult && (
              <button
                onClick={handleEditResult}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                編集
              </button>
            )}
          </div>

          {isEditingResult ? (
            <div>
              {/* ステータス */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">予定</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              {/* 結果 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  結果
                </label>
                <select
                  value={result || ''}
                  onChange={(e) => setResult((e.target.value as Result) || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">未選択</option>
                  <option value="passed">✅ 通過</option>
                  <option value="failed">❌ 不合格</option>
                  <option value="waiting">⏳ 結果待ち</option>
                </select>
              </div>

              {/* 結果メモ */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  結果メモ
                </label>
                <textarea
                  value={resultMemo}
                  onChange={(e) => setResultMemo(e.target.value)}
                  placeholder="面接の感触、フィードバックなど"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* 保存・キャンセルボタン */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* ステータス表示 */}
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700">ステータス: </span>
                {event.status === 'scheduled' && (
                  <span className="text-blue-600">予定</span>
                )}
                {event.status === 'completed' && (
                  <span className="text-green-600">完了</span>
                )}
                {event.status === 'cancelled' && (
                  <span className="text-gray-600">キャンセル</span>
                )}
              </div>

              {/* 結果表示 */}
              {event.result && (
                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-700">結果: </span>
                  {event.result === 'passed' && (
                    <span className="text-green-600 font-semibold">✅ 通過</span>
                  )}
                  {event.result === 'failed' && (
                    <span className="text-red-600 font-semibold">❌ 不合格</span>
                  )}
                  {event.result === 'waiting' && (
                    <span className="text-yellow-600 font-semibold">⏳ 結果待ち</span>
                  )}
                </div>
              )}

              {/* 結果メモ表示 */}
              {event.resultMemo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">結果メモ</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{event.resultMemo}</p>
                </div>
              )}

              {!event.result && !event.resultMemo && (
                <p className="text-gray-500 italic">結果がまだ記録されていません</p>
              )}
            </div>
          )}
        </div>

        {/* レビュー・マッチ度記録 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">レビュー・マッチ度</h3>
            {!isEditingReview && (
              <button
                onClick={handleEditReview}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                編集
              </button>
            )}
          </div>

          {isEditingReview ? (
            <div>
              {/* 企業マッチ度 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  企業とのマッチ度
                </label>
                {renderMatchRateMemory(companyMatchRate, setCompanyMatchRate, isSavingReview)}
                <p className="text-xs text-gray-500 mt-2">
                  💡 この企業の雰囲気・文化・価値観があなたに合っていると感じましたか?
                </p>
              </div>

              {/* 職種マッチ度 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  職種とのマッチ度
                </label>
                {renderMatchRateMemory(jobMatchRate, setJobMatchRate, isSavingReview)}
                <p className="text-xs text-gray-500 mt-2">
                  💡 この職種の業務内容・求められるスキルがあなたに合っていると感じましたか?
                </p>
              </div>

              {/* 感想 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  感想・気づき
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="面接や説明会で感じたこと、印象に残ったこと、気づいたことなどを自由に記入してください"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={isSavingReview}
                />
              </div>

              {/* 保存・キャンセルボタン */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {isSavingReview ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancelReviewEdit}
                  disabled={isSavingReview}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* 企業マッチ度表示 */}
              {event.review && (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">企業とのマッチ度</h4>
                    {renderMatchRateMemory(event.review.companyMatchRate, () => {}, true)}
                  </div>

                  {/* 職種マッチ度表示 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">職種とのマッチ度</h4>
                    {renderMatchRateMemory(event.review.jobMatchRate, () => {}, true)}
                  </div>

                  {/* 感想表示 */}
                  {event.review.feedback && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">感想・気づき</h4>
                      <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                        {event.review.feedback}
                      </p>
                    </div>
                  )}
                </>
              )}

              {!event.review && (
                <p className="text-gray-500 italic">
                  レビューがまだ記録されていません。「編集」ボタンからマッチ度と感想を記録できます。
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">予定を削除しますか？</h3>
            <p className="text-gray-700 mb-2">
              <strong>{event?.companyName}</strong> の予定を削除します。
            </p>
            <p className="text-red-600 text-sm mb-6">
              ⚠️ この操作は取り消せません。
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
