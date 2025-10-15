/**
 * 企業データを取得するカスタムフック
 * Firestore からリアルタイムで企業一覧を取得
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/company';

/**
 * useCompanies フックの戻り値の型
 */
interface UseCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

/**
 * 企業一覧を取得するカスタムフック
 *
 * @returns 企業一覧、ローディング状態、エラー
 *
 * @example
 * const { companies, loading, error } = useCompanies();
 */
export function useCompanies(): UseCompaniesReturn {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    try {
      // Firestore クエリ: users/{userId}/companies を createdAt 降順で取得
      const companiesRef = collection(db, 'users', user.uid, 'companies');
      const q = query(companiesRef, orderBy('createdAt', 'desc'));

      // リアルタイム購読
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const companiesData: Company[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Company[];

          setCompanies(companiesData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('企業データ取得エラー:', err);
          setError('企業データの取得に失敗しました');
          setLoading(false);
        }
      );

      // クリーンアップ関数
      return unsubscribe;
    } catch (err) {
      console.error('予期しないエラー:', err);
      setError('予期しないエラーが発生しました');
      setLoading(false);
    }
  }, [user]);

  return { companies, loading, error };
}
