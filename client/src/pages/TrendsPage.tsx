/**
 * 傾向分析ページ
 * 登録企業から志望傾向を分析・可視化
 */

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase';
import { useTrends } from '@/hooks/useTrends';
import { useCompanies } from '@/hooks/useCompanies';
import Header from '@/components/layout/Header';
import type { AnalyzeTrendsRequest, AnalyzeTrendsResponse } from '@/types';

export default function TrendsPage() {
  const { trend, loading: trendLoading } = useTrends();
  const { companies } = useCompanies();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 傾向分析を実行
   */
  const handleAnalyzeTrends = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const analyzeTrendsFn = httpsCallable<AnalyzeTrendsRequest, AnalyzeTrendsResponse>(
        functions,
        'analyzeTrends'
      );

      const result = await analyzeTrendsFn({});

      if (result.data.success) {
        // useTrends が自動的に最新データを取得
        console.log('傾向分析完了:', result.data);
      } else {
        setError('傾向分析に失敗しました');
      }
    } catch (err: any) {
      console.error('傾向分析エラー:', err);

      if (err.code === 'unauthenticated') {
        setError('認証が必要です。ログインし直してください。');
      } else if (err.code === 'failed-precondition') {
        setError(err.message || '傾向分析には最低3社の企業登録が必要です');
      } else {
        setError('傾向分析に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 最終分析日時をフォーマット
   */
  const formatAnalyzedAt = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル・アクション */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">傾向分析</h2>
            <p className="text-sm text-gray-600 mt-1">
              登録企業から志望傾向を分析します
            </p>
          </div>

          <button
            onClick={handleAnalyzeTrends}
            disabled={isAnalyzing || companies.length < 3}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isAnalyzing ? '分析中...' : '傾向を分析'}
          </button>
        </div>

        {/* 企業数が3社未満の場合の警告 */}
        {companies.length < 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              💡 傾向分析には最低3社の企業登録が必要です（現在: {companies.length}社）
            </p>
            <p className="text-yellow-700 text-xs mt-2">
              予定を登録すると、自動的に企業が分析されて一覧に追加されます
            </p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* ローディング状態 */}
        {trendLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* 傾向分析結果 */}
        {!trendLoading && trend && (
          <>
            {/* メタ情報 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    分析企業数: <span className="font-semibold text-gray-900">{trend.companyCount}社</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    最終分析: {formatAnalyzedAt(trend.analyzedAt)}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  使用モデル: {trend.modelUsed}
                </div>
              </div>
            </div>

            {/* 全体傾向サマリー */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">全体傾向</h3>
              <p className="text-gray-700 leading-relaxed">{trend.summary.overallTrend}</p>
            </div>

            {/* 業界分布 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">業界別分布</h3>
              <div className="space-y-3">
                {trend.summary.topIndustries.map((industry, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{industry.name}</span>
                      <span className="text-sm text-gray-600">
                        {industry.count}社 ({industry.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${industry.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 頻出キーワード */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">頻出キーワード</h3>
              <div className="flex flex-wrap gap-2">
                {trend.summary.commonKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium text-blue-900">{keyword.word}</span>
                    <span className="text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                      {keyword.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 推奨スキル */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">推奨スキル</h3>
              <ul className="space-y-2">
                {trend.summary.recommendedSkills.map((skill, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 分析元企業一覧 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">分析対象企業</h3>
              <div className="flex flex-wrap gap-2">
                {trend.sourceCompanies.map((company) => (
                  <span
                    key={company.companyId}
                    className="inline-block bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                  >
                    {company.companyName}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* まだ分析が実行されていない場合 */}
        {!trendLoading && !trend && companies.length >= 3 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">まだ傾向分析が実行されていません</p>
            <p className="text-gray-500 text-sm mb-4">
              「傾向を分析」ボタンをクリックして、志望傾向を分析しましょう
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
