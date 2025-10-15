/**
 * 予定詳細ページ
 * 予定の詳細情報を表示し、結果記録が可能
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
        setLoading(false);
      } catch (err) {
        console.error('予定取得エラー:', err);
        setError('予定データの取得に失敗しました');
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
    } catch (err) {
      console.error('結果保存エラー:', err);
      alert('結果の保存に失敗しました');
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
    } catch (err) {
      console.error('予定削除エラー:', err);
      alert('予定の削除に失敗しました');
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

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // エラー状態
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-100">
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
    <div className="min-h-screen bg-gray-100">
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
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  予定
                </span>
              )}
              {event.status === 'completed' && (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  完了
                </span>
              )}
              {event.status === 'cancelled' && (
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
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
              onClick={handleDeleteClick}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
            >
              🗑️ 予定を削除
            </button>
          </div>
        </div>

        {/* 結果記録 */}
        <div className="bg-white rounded-lg shadow-md p-8">
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
