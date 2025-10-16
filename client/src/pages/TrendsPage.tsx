/**
 * 傾向分析ページ
 * 登録企業から志望傾向を分析・可視化
 */

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import { functions } from '@/services/firebase';
import { useTrends } from '@/hooks/useTrends';
import { useCompanies } from '@/hooks/useCompanies';
import Header from '@/components/layout/Header';
import UserModal from '@/components/common/UserModal';
import type { AnalyzeTrendsRequest, AnalyzeTrendsResponse } from '@/types';

export default function TrendsPage() {
  const { trend, loading: trendLoading } = useTrends();
  const { companies } = useCompanies();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

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
    } catch (err: unknown) {
      console.error('傾向分析エラー:', err);

      if (err instanceof FirebaseError) {
        if (err.code === 'unauthenticated') {
          setError('認証が必要です。ログインし直してください。');
        } else if (err.code === 'failed-precondition') {
          setError(err.message || '傾向分析には最低3社の企業登録が必要です');
        } else {
          setError('傾向分析に失敗しました。もう一度お試しください。');
        }
      } else {
        setError('予期しないエラーが発生しました。もう一度お試しください。');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル・アクション */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              傾向分析
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-600">
                登録企業数: <span className="font-bold text-blue-600">{companies.length}</span>社
              </p>
              <div className="h-4 w-px bg-gray-300"></div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                登録企業から志望傾向を分析
              </p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeTrends}
            disabled={isAnalyzing || companies.length < 3}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isAnalyzing ? '分析中...' : '傾向を分析'}
          </button>
        </div>

        {/* 企業数が3社未満の場合の警告 */}
        {companies.length < 3 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-yellow-900 font-semibold text-sm mb-1">
                  傾向分析には最低3社の企業登録が必要です
                </p>
                <p className="text-yellow-800 text-sm mb-2">
                  現在: <span className="font-bold">{companies.length}社</span> 登録済み
                </p>
                <p className="text-yellow-700 text-xs">
                  💡 予定を登録すると、自動的に企業が分析されて一覧に追加されます
                </p>
              </div>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-900 font-semibold text-sm">{error}</p>
              </div>
            </div>
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
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">分析企業数</p>
                    <p className="text-2xl font-bold text-blue-600">{trend.companyCount}社</p>
                  </div>
                  <div className="h-12 w-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">最終分析</p>
                    <p className="text-sm font-medium text-gray-700">{formatAnalyzedAt(trend.analyzedAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">使用モデル</p>
                  <p className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1">
                    {trend.modelUsed}
                  </p>
                </div>
              </div>
            </div>

            {/* 全体傾向サマリー */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  全体傾向
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">{trend.summary.overallTrend}</p>
            </div>

            {/* 業界分布 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">業界別分布</h3>
              </div>
              <div className="space-y-4">
                {trend.summary.topIndustries.map((industry, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">{industry.name}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {industry.count}社 ({industry.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${industry.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 頻出キーワード */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">頻出キーワード</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {trend.summary.commonKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-full px-5 py-2.5 hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-semibold text-blue-900">{keyword.word}</span>
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full px-2.5 py-1">
                      {keyword.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 推奨スキル */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">推奨スキル</h3>
              </div>
              <ul className="space-y-3">
                {trend.summary.recommendedSkills.map((skill, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-base">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 分析元企業一覧 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">分析対象企業</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {trend.sourceCompanies.map((company) => (
                  <span
                    key={company.companyId}
                    className="inline-block bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-md transition-shadow"
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
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">まだ傾向分析が実行されていません</p>
            <p className="text-gray-500 text-sm mb-4">
              「傾向を分析」ボタンをクリックして、志望傾向を分析しましょう
            </p>
          </div>
        )}
      </main>

      {/* ユーザー設定モーダル */}
      <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
