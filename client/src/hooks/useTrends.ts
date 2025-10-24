/**
 * useTrends Hook
 * 傾向分析データの取得・管理
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Trend } from '@/types/trend';

/**
 * useTrends Hook の戻り値型
 */
interface UseTrendsReturn {
  trend: Trend | null;
  loading: boolean;
  error: string | null;
}

/**
 * Firestore から傾向分析データをリアルタイム取得するカスタムフック
 *
 * @returns {UseTrendsReturn} 傾向分析データ、ローディング状態、エラー
 *
 * @example
 * const { trend, loading, error } = useTrends();
 */
export function useTrends(): UseTrendsReturn {
  const { user } = useAuth();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrend(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Firestore リアルタイム購読
    const trendDocRef = doc(db, 'users', user.uid, 'trends', 'latest');

    const unsubscribe = onSnapshot(
      trendDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          console.log('[useTrends] Firestore data.reviewStats:', data.reviewStats);
          console.log('[useTrends] jobPositionStats:', data.reviewStats?.jobPositionStats);

          setTrend({
            id: docSnapshot.id,
            summary: data.summary,
            sourceCompanies: data.sourceCompanies,
            reviewStats: data.reviewStats || null, // レビュー統計データ
            analyzedAt: data.analyzedAt,
            companyCount: data.companyCount,
            modelUsed: data.modelUsed,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          });
        } else {
          // まだ傾向分析が実行されていない場合
          setTrend(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error('傾向分析データの取得エラー:', err);
        setError('傾向分析データの取得に失敗しました');
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [user]);

  return { trend, loading, error };
}
