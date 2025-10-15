/**
 * useEvents フック
 * 予定データをFirestoreからリアルタイム取得
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Event } from '@/types/event';

/**
 * 予定一覧を取得するフック
 *
 * @returns 予定一覧、ローディング状態、エラー
 */
export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Firestoreクエリを設定（日付の降順）
    const eventsRef = collection(db, 'users', user.uid, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));

    // リアルタイム購読
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData: Event[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Event));

        setEvents(eventsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('予定データ取得エラー:', err);
        setError('予定データの取得に失敗しました');
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [user]);

  return { events, loading, error };
}
