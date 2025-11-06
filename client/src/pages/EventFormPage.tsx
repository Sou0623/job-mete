/**
 * 予定登録ページ
 * 予定を登録するフォーム
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import { functions } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import {
  initializeGoogleCalendar,
  authenticateGoogleCalendar,
  createCalendarEvent,
  hasValidToken,
} from '@/services/googleCalendar';
import type {
  EventType,
  CreateEventRequest,
  CreateEventResponse,
} from '@/types';

export default function EventFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [eventType, setEventType] = useState<EventType>('説明会');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [jobPosition, setJobPosition] = useState(''); // 職種
  const [syncToCalendar, setSyncToCalendar] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  /**
   * Google Calendar APIの初期化
   */
  useEffect(() => {
    const initCalendar = async () => {
      try {
        await initializeGoogleCalendar();
        setCalendarInitialized(true);
      } catch (error) {
        console.error(
          '[EventFormPage] Google Calendar初期化エラー:',
          error
        );
      }
    };
    initCalendar();
  }, []);

  /**
   * 終了日時を開始日時と同じにする（デフォルト）
   */
  useEffect(() => {
    if (date && !endDate) {
      // 開始日時の1時間後を終了日時にする
      const startDate = new Date(date);
      startDate.setHours(startDate.getHours() + 1);
      setEndDate(startDate.toISOString().slice(0, 16));
    }
  }, [date, endDate]);

  /**
   * 予定登録処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !companyName.trim()) {
      setError('企業名を選択してください');
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

      // Googleカレンダー同期の前処理
      let calendarEventId: string | undefined;
      if (syncToCalendar) {
        try {
          // トークンがない場合は認証
          if (!hasValidToken()) {
            await authenticateGoogleCalendar();
          }

          // カレンダーイベントを作成
          calendarEventId = await createCalendarEvent({
            companyName: companyName.trim(),
            eventType,
            startTime: new Date(date).toISOString(),
            endTime: new Date(endDate).toISOString(),
            location: location.trim(),
            memo: memo.trim(),
          });

          console.log(
            '[EventFormPage] カレンダーイベント作成成功:',
            calendarEventId
          );
        } catch (calendarError) {
          console.error(
            '[EventFormPage] カレンダー同期エラー:',
            calendarError
          );
          // カレンダー同期エラーは警告のみ、予定登録は続行
          setError(
            'カレンダー同期に失敗しましたが、予定は登録されます'
          );
        }
      }

      // createEvent Function を呼び出し
      const createEventFn = httpsCallable<
        CreateEventRequest,
        CreateEventResponse
      >(
        functions,
        'createEvent'
      );

      const result = await createEventFn({
        companyName: companyName.trim(),
        eventType,
        date: new Date(date).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location: location.trim(),
        memo: memo.trim(),
        jobPosition: jobPosition.trim(),
        syncToCalendar,
      });

      if (result.data.success && result.data.eventId) {
        // 詳細ページにリダイレクト
        navigate(`/events/${result.data.eventId}`);
      } else {
        setError('予定の登録に失敗しました');
      }
    } catch (err: unknown) {
      console.error('予定登録エラー:', err);

      // Firebase Functions のエラーメッセージを表示
      if (err instanceof FirebaseError) {
        if (err.code === 'unauthenticated') {
          setError('認証が必要です。ログインし直してください。');
        } else if (err.code === 'not-found') {
          setError('企業の自動作成に失敗しました。');
        } else if (err.code === 'invalid-argument') {
          setError(err.message || '入力内容が不正です');
        } else {
          setError('予定の登録に失敗しました。もう一度お試しください。');
        }
      } else {
        setError('予期しないエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル
   */
  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">予定を登録</h2>

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
                placeholder="例: 株式会社〇〇"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 企業が未登録の場合、自動的にAI分析が行われて企業一覧に追加されます
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

            {/* 職種 */}
            <div className="mb-6">
              <label
                htmlFor="jobPosition"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                応募職種
              </label>
              <input
                type="text"
                id="jobPosition"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="例: バックエンドエンジニア / 営業職 / データサイエンティスト"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 選考を受けている職種を入力すると、後でマッチ度分析に活用できます
              </p>
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

            {/* Googleカレンダー同期 */}
            <div
              className={
                `mb-6 p-4 border rounded-md ` +
                `${calendarInitialized
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
                }`
              }
            >
              <label
                className={
                  `flex items-center gap-2 ` +
                  `${calendarInitialized
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                  }`
                }
              >
                <input
                  type="checkbox"
                  checked={syncToCalendar}
                  onChange={(e) => setSyncToCalendar(e.target.checked)}
                  disabled={!calendarInitialized || isSubmitting}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Googleカレンダーに同期
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-2">
                {calendarInitialized ? (
                  <>
                    ✅ 予定をGoogleカレンダーに自動追加します
                    <br />
                    📅 1時間前と1日前にリマインダーが設定されます
                  </>
                ) : (
                  '⏳ Google Calendar APIを初期化中...'
                )}
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !companyName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm sm:text-base"
              >
                {isSubmitting ? 'AI分析中...' : '予定を登録'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm sm:text-base"
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
