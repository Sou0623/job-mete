/**
 * 予定編集ページ
 * 既存予定の日時・場所・メモ・イベント種別を編集
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import type { EventType, Event } from '@/types';

export default function EventEditPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [eventType, setEventType] = useState<EventType>('説明会');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 既存の予定データを取得
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

        const eventData = eventSnap.data() as Event;

        // フォームに既存データをセット
        setCompanyName(eventData.companyName);
        setEventType(eventData.eventType);
        setDate(new Date(eventData.date).toISOString().slice(0, 16));
        setEndDate(new Date(eventData.endDate).toISOString().slice(0, 16));
        setLocation(eventData.location || '');
        setMemo(eventData.memo || '');

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
   * 予定更新処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !eventId) {
      setError('認証が必要です');
      return;
    }

    if (!date) {
      setError('開始日時を入力してください');
      return;
    }

    if (!endDate) {
      setError('終了日時を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Firestoreを直接更新
      const eventRef = doc(db, 'users', user.uid, 'events', eventId);
      await updateDoc(eventRef, {
        eventType,
        date: new Date(date).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location: location.trim(),
        memo: memo.trim(),
        updatedAt: new Date().toISOString(),
      });

      // 詳細ページにリダイレクト
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('予定更新エラー:', err);
      setError('予定の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル
   */
  const handleCancel = () => {
    navigate(`/events/${eventId}`);
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
  if (error && !companyName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <p className="text-red-800 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/events')}
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
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">予定を編集</h2>

          <form onSubmit={handleSubmit}>
            {/* 企業名（読み取り専用） */}
            <div className="mb-6">
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                企業名
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 企業名は変更できません
              </p>
            </div>

            {/* イベント種別 */}
            <div className="mb-6">
              <label
                htmlFor="eventType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                イベント種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              >
                <option value="説明会">説明会</option>
                <option value="一次面接">一次面接</option>
                <option value="二次面接">二次面接</option>
                <option value="最終面接">最終面接</option>
                <option value="インターン">インターン</option>
                <option value="カジュアル面談">カジュアル面談</option>
                <option value="その他">その他</option>
              </select>
            </div>

            {/* 開始日時 */}
            <div className="mb-6">
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                開始日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 終了日時 */}
            <div className="mb-6">
              <label
                htmlFor="endDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                終了日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 場所 */}
            <div className="mb-6">
              <label
                htmlFor="location"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                場所
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 東京本社 / オンライン（Zoom）"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* メモ */}
            <div className="mb-6">
              <label
                htmlFor="memo"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                メモ
              </label>
              <textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="持ち物、準備事項など"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {isSubmitting ? '更新中...' : '更新'}
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
          </form>
        </div>
      </main>
    </div>
  );
}
