/**
 * 個別企業データを取得するカスタムフック
 * Firestore からリアルタイムで特定の企業データを取得
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/company';

/**
 * useCompany フックの戻り値の型
 */
interface UseCompanyReturn {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

/**
 * 特定の企業データを取得するカスタムフック
 *
 * @param companyId - 企業ID
 * @returns 企業データ、ローディング状態、エラー
 *
 * @example
 * const { company, loading, error } = useCompany(companyId);
 */
export function useCompany(companyId: string | undefined): UseCompanyReturn {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !companyId) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      // Firestore ドキュメント参照
      const companyRef = doc(db, 'users', user.uid, 'companies', companyId);

      // リアルタイム購読
      const unsubscribe = onSnapshot(
        companyRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const companyData = {
              id: snapshot.id,
              ...snapshot.data(),
            } as Company;

            setCompany(companyData);
            setError(null);
          } else {
            setCompany(null);
            setError('企業が見つかりません');
          }
          setLoading(false);
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
  }, [user, companyId]);

  return { company, loading, error };
}
