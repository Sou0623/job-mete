/**
 * 傾向分析ページ（ダッシュボード風レイアウト）
 * 登録企業から志望傾向を分析・可視化
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import { functions } from '@/services/firebase';
import { useTrends } from '@/hooks/useTrends';
import { useCompanies } from '@/hooks/useCompanies';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import UserModal from '@/components/common/UserModal';
import type { AnalyzeTrendsRequest, AnalyzeTrendsResponse } from '@/types';

// サイドバーの選択項目
type SidebarSection = 'overview' | 'industry' | 'match';

export default function TrendsPage() {
  const navigate = useNavigate();
  const { trend, loading: trendLoading } = useTrends();
  const { companies } = useCompanies();
  const { events } = useEvents();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SidebarSection>('overview');
  const [hoveredOthers, setHoveredOthers] = useState(false);

  /**
   * レビュー済み予定数を計算
   */
  const reviewedEventsCount = useMemo(() => {
    return events.filter((event) => event.review).length;
  }, [events]);

  // マッチ度詳細モーダル用のstate
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'job'>('company');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [companySortBy, setCompanySortBy] = useState<'match' | 'reviews'>('match');
  const [jobFilter, setJobFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [jobSortBy, setJobSortBy] = useState<'match' | 'count'>('match');

  /**
   * 企業別マッチ度リストのフィルタリング・ソート
   */
  const filteredAndSortedCompanies = useMemo(() => {
    if (!trend?.reviewStats) return [];

    const filteredCompanies = trend.reviewStats.companyStats.filter((company) => {
      const avgMatch = (company.avgCompanyMatch + company.avgJobMatch) / 2;
      if (companyFilter === 'high') return avgMatch >= 4.0;
      if (companyFilter === 'medium') return avgMatch >= 2.5 && avgMatch < 4.0;
      if (companyFilter === 'low') return avgMatch < 2.5;
      return true;
    });

    return [...filteredCompanies].sort((a, b) => {
      if (companySortBy === 'match') {
        const avgA = (a.avgCompanyMatch + a.avgJobMatch) / 2;
        const avgB = (b.avgCompanyMatch + b.avgJobMatch) / 2;
        return avgB - avgA;
      } else {
        return b.reviewCount - a.reviewCount;
      }
    });
  }, [trend?.reviewStats, companyFilter, companySortBy]);

  /**
   * 職種別マッチ度リストのフィルタリング・ソート
   */
  const filteredAndSortedJobs = useMemo(() => {
    if (!trend?.reviewStats) return [];

    const filteredJobs = trend.reviewStats.jobPositionStats.filter((job) => {
      const avgMatch = (job.avgCompanyMatch + job.avgJobMatch) / 2;
      if (jobFilter === 'high') return avgMatch >= 4.0;
      if (jobFilter === 'medium') return avgMatch >= 2.5 && avgMatch < 4.0;
      if (jobFilter === 'low') return avgMatch < 2.5;
      return true;
    });

    return [...filteredJobs].sort((a, b) => {
      if (jobSortBy === 'match') {
        const avgA = (a.avgCompanyMatch + a.avgJobMatch) / 2;
        const avgB = (b.avgCompanyMatch + b.avgJobMatch) / 2;
        return avgB - avgA;
      } else {
        return b.count - a.count;
      }
    });
  }, [trend?.reviewStats, jobFilter, jobSortBy]);

  /**
   * 傾向分析を実行
   */
  const handleAnalyzeTrends = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const analyzeTrendsFn = httpsCallable<AnalyzeTrendsRequest, AnalyzeTrendsResponse>(
        functions,
        'analyzeTrends'
      );

      const result = await analyzeTrendsFn({});

      if (result.data.success) {
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
  }, []);

  /**
   * 最終分析日時をフォーマット
   */
  const formatAnalyzedAt = useCallback((isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  /**
   * 業界タグクリック時に企業一覧ページに遷移
   */
  const handleIndustryClick = useCallback((industryName: string) => {
    navigate(`/companies?industry=${encodeURIComponent(industryName)}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />

      {/* メインコンテンツ */}
    <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
       <div>
          <h2 className="text-4xl font-bold text-[#1A4472]">
            傾向分析
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            登録企業数: <span className="font-bold text-[#1A4472]">{companies.length}</span>社
          </p>
        </div>


          <button
            onClick={handleAnalyzeTrends}
            disabled={isAnalyzing || reviewedEventsCount < 3}
            className="bg-[#1A4472] text-white px-6 py-3 rounded-lg hover:bg-[#143659] transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isAnalyzing ? '分析中...' : '傾向を分析'}
          </button>
        </div>

        {/* タブナビゲーション（傾向分析データがある場合のみ表示） */}
        {!trendLoading && trend && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-6">
                <button
                  onClick={() => setSelectedSection('overview')}
                  className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
                    selectedSection === 'overview'
                      ? 'border-[#1A4472] text-[#1A4472]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    総評
                  </div>
                </button>
                <button
                  onClick={() => setSelectedSection('industry')}
                  className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
                    selectedSection === 'industry'
                      ? 'border-[#1A4472] text-[#1A4472]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                    業界別分析
                  </div>
                </button>
                {trend.reviewStats && (
                  <button
                    onClick={() => setSelectedSection('match')}
                    className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
                      selectedSection === 'match'
                        ? 'border-[#1A4472] text-[#1A4472]'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      マッチ度分析
                    </div>
                  </button>
                )}
              </nav>
            </div>

            {/* メタ情報（コンパクト表示） */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span>最終分析: {formatAnalyzedAt(trend.analyzedAt)}</span>
              <span className="font-mono">{trend.modelUsed}</span>
            </div>
          </div>
        )}

        {/* レビュー済み予定数が3件未満の場合の警告 */}
        {reviewedEventsCount < 3 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-900 font-bold text-base mb-3">
                  傾向分析には、レビュー済みの予定が3件以上必要です
                </p>

                {/* プログレスバー */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-800">
                      レビュー済み予定: {reviewedEventsCount} / 3 件
                    </span>
                    <span className="text-xs text-blue-700">
                      あと {3 - reviewedEventsCount} 件
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((reviewedEventsCount / 3) * 100, 100)}%` }}
                    >
                      {reviewedEventsCount > 0 && (
                        <span className="text-white font-bold text-xs">
                          {Math.round((reviewedEventsCount / 3) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    レビューの記入方法
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                    <li>予定一覧から、完了した予定を選択</li>
                    <li>「企業マッチ度」と「職種マッチ度」を5段階で評価</li>
                    <li>感想やフィードバックを記入して保存</li>
                  </ol>
                </div>
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

        {/* 傾向分析結果: セクションごとに表示 */}
        {!trendLoading && trend && (
          <>
            {/* 総評セクション */}
            {selectedSection === 'overview' && (
                <div className="space-y-6">
                  {/* メタ情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1A4472] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">分析企業数</p>
                          <p className="text-3xl font-bold text-gray-900">{trend.companyCount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1A4472] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">業界数</p>
                          <p className="text-3xl font-bold text-gray-900">{trend.summary.topIndustries.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#47845E] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">推奨スキル</p>
                          <p className="text-3xl font-bold text-gray-900">{trend.summary.recommendedSkills.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 全体傾向 */}
                  <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-[#1A4472] rounded-lg flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">あなたの志望傾向</h3>
                    </div>
                    <p className="text-base leading-relaxed text-gray-700">{trend.summary.overallTrend}</p>
                  </div>

                  {/* 2列レイアウト：左側（推奨スキル＋推奨職種）、右側（高マッチ企業） */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左側：推奨スキルと推奨職種 */}
                    <div className="space-y-6">
                      {/* 推奨スキル */}
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-[#CAC75C] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">推奨スキル</h3>
                        </div>
                        <ul className="space-y-2">
                          {trend.summary.recommendedSkills.map((skill, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="flex-shrink-0 w-5 h-5 bg-[#1A4472] rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-gray-700">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 推奨職種 */}
                      {trend.summary.matchInsights && trend.summary.matchInsights.recommendedJobPositions && trend.summary.matchInsights.recommendedJobPositions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#1A4472] rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">推奨職種（AIのアドバイス）</h3>
                          </div>
                          <div className="space-y-3">
                            {trend.summary.matchInsights.recommendedJobPositions.map((job, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-gray-900">{job.position}</p>
                                  <span className="bg-[#1A4472] text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {job.avgMatchRate.toFixed(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{job.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 右側：高マッチ企業 */}
                    {trend.summary.matchInsights && trend.summary.matchInsights.highMatchCompanies.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-[#47845E] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">高マッチ企業（AIの推奨）</h3>
                        </div>
                        <div className="space-y-3">
                          {trend.summary.matchInsights.highMatchCompanies.map((company, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-gray-900">{company.companyName}</p>
                                <span className="bg-[#47845E] text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {company.avgMatchRate.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{company.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* キャリアアドバイス */}
                  {trend.summary.matchInsights && (
                    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#1A4472] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">キャリアアドバイス</h3>
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed bg-gray-50 rounded-lg p-5 border border-gray-200">
                        {trend.summary.matchInsights.careerAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 業界別分析セクション */}
              {selectedSection === 'industry' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#1A4472] rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">業界別分布</h3>
                    </div>

                    {(() => {
                      // 業界ごとに固定の色を割り当てるカラーパレット
                      const industryColors = [
                        '#1A4472', // 濃紺
                        '#47845E', // 緑
                        '#CAC75C', // 黄緑
                        '#E57373', // 赤
                        '#64B5F6', // 青
                        '#FFB74D', // オレンジ
                        '#9575CD', // 紫
                        '#4DB6AC', // ティール
                        '#81C784', // ライトグリーン
                        '#FFD54F', // イエロー
                      ];

                      // 上位10業界とその他を分ける
                      const maxDisplayIndustries = 10;
                      const displayIndustries = trend.summary.topIndustries.slice(0, maxDisplayIndustries);
                      const otherIndustries = trend.summary.topIndustries.slice(maxDisplayIndustries);

                      // その他の合計を計算
                      const othersTotal = otherIndustries.reduce((sum, ind) => ({
                        count: sum.count + ind.count,
                        percentage: sum.percentage + ind.percentage
                      }), { count: 0, percentage: 0 });

                      // 表示用の業界リスト（その他を含む）
                      const industriesWithOthers = othersTotal.count > 0
                        ? [...displayIndustries, { name: 'その他', count: othersTotal.count, percentage: othersTotal.percentage }]
                        : displayIndustries;

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* バーチャート */}
                          <div className="space-y-4">
                            {industriesWithOthers.map((industry, index) => {
                              const isOthers = industry.name === 'その他';
                              return (
                                <div
                                  key={index}
                                  onClick={() => !isOthers && handleIndustryClick(industry.name)}
                                  onMouseEnter={() => isOthers && setHoveredOthers(true)}
                                  onMouseLeave={() => isOthers && setHoveredOthers(false)}
                                  className={`${isOthers ? 'relative' : 'cursor-pointer'} hover:bg-gray-50 p-2 rounded-lg transition-colors`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className="w-4 h-4 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: isOthers ? '#9E9E9E' : industryColors[index % industryColors.length] }}
                                    ></div>
                                    <span className={`text-sm font-semibold text-gray-800 flex-1 ${!isOthers && 'hover:text-[#1A4472]'} transition-colors`}>
                                      {industry.name}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                      {industry.count}社 ({industry.percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                      className="h-3 rounded-full transition-all duration-500"
                                      style={{
                                        width: `${industry.percentage}%`,
                                        backgroundColor: isOthers ? '#9E9E9E' : industryColors[index % industryColors.length]
                                      }}
                                    ></div>
                                  </div>

                                  {/* その他のツールチップ */}
                                  {isOthers && hoveredOthers && otherIndustries.length > 0 && (
                                    <div className="absolute z-50 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-72">
                                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        その他の業界詳細
                                      </h4>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {otherIndustries.map((other, idx) => (
                                          <div
                                            key={idx}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleIndustryClick(other.name);
                                            }}
                                            className="flex items-center justify-between text-xs p-2 hover:bg-gray-50 rounded cursor-pointer"
                                          >
                                            <span className="font-medium text-gray-700 hover:text-[#1A4472]">{other.name}</span>
                                            <span className="text-gray-600">{other.count}社 ({other.percentage.toFixed(1)}%)</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 円グラフ + 凡例 */}
                          <div className="flex flex-col items-center gap-4">
                            {/* 円グラフ */}
                            <div className="relative w-64 h-64">
                              {(() => {
                                let currentAngle = 0;

                                return (
                                  <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                                    <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
                                    {industriesWithOthers.map((industry, index) => {
                                      const angle = (industry.percentage / 100) * 360;
                                      const startAngle = currentAngle;
                                      const endAngle = currentAngle + angle;
                                      currentAngle = endAngle;

                                      const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                                      const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                                      const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                                      const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                                      const largeArcFlag = angle > 180 ? 1 : 0;

                                      const isOthers = industry.name === 'その他';

                                      return (
                                        <path
                                          key={index}
                                          d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                          fill={isOthers ? '#9E9E9E' : industryColors[index % industryColors.length]}
                                          opacity="0.9"
                                          className={`${isOthers ? '' : 'cursor-pointer'} hover:opacity-100 transition-opacity`}
                                          onClick={() => !isOthers && handleIndustryClick(industry.name)}
                                          onMouseEnter={() => isOthers && setHoveredOthers(true)}
                                          onMouseLeave={() => isOthers && setHoveredOthers(false)}
                                        />
                                      );
                                    })}
                                    <circle cx="100" cy="100" r="50" fill="white" />
                                  </svg>
                                );
                              })()}

                              {/* 中央のテキスト */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-3xl font-bold text-gray-900">{trend.companyCount}</p>
                                <p className="text-sm text-gray-600">企業</p>
                              </div>
                            </div>

                            {/* 凡例 */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full max-w-xs">
                              {industriesWithOthers.map((industry, index) => {
                                const isOthers = industry.name === 'その他';
                                return (
                                  <div
                                    key={index}
                                    onClick={() => !isOthers && handleIndustryClick(industry.name)}
                                    onMouseEnter={() => isOthers && setHoveredOthers(true)}
                                    onMouseLeave={() => isOthers && setHoveredOthers(false)}
                                    className={`flex items-center gap-2 ${!isOthers && 'cursor-pointer'} hover:bg-gray-100 p-1 rounded transition-colors relative`}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: isOthers ? '#9E9E9E' : industryColors[index % industryColors.length] }}
                                    ></div>
                                    <span className={`text-xs text-gray-700 truncate ${!isOthers && 'hover:text-[#1A4472]'} transition-colors`}>
                                      {industry.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* マッチ度分析セクション */}
              {selectedSection === 'match' && trend.reviewStats && (
                <div className="space-y-6">
                  {/* 統計カード */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#47845E] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">高マッチ企業</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {trend.reviewStats.companyStats.filter(c => (c.avgCompanyMatch + c.avgJobMatch) / 2 >= 4.0).length}社
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#CAC75C] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">中マッチ企業</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {trend.reviewStats.companyStats.filter(c => {
                              const avg = (c.avgCompanyMatch + c.avgJobMatch) / 2;
                              return avg >= 2.5 && avg < 4.0;
                            }).length}社
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">低マッチ企業</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {trend.reviewStats.companyStats.filter(c => (c.avgCompanyMatch + c.avgJobMatch) / 2 < 2.5).length}社
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* マッチ度分布 */}
                  <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1A4472] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">マッチ度の分布</h3>
                      </div>
                      <button
                        onClick={() => setShowMatchModal(true)}
                        className="bg-[#1A4472] text-white px-6 py-3 rounded-lg hover:bg-[#143659] transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        詳細を見る
                      </button>
                    </div>

                    {/* 企業マッチ度分布 */}
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-gray-800 mb-4">企業マッチ度の分布</h5>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((level) => {
                          const count = trend.reviewStats!.companyMatchDistribution[level - 1];
                          const percentage = trend.reviewStats!.totalReviews > 0
                            ? (count / trend.reviewStats!.totalReviews) * 100
                            : 0;
                          const labels = ['20%', '40%', '60%', '80%', '100%'];
                          const industryColors = ['#1A4472', '#47845E', '#CAC75C', '#9CA3AF', '#1A4472'];
                          const colors = [
                            industryColors[0], // 青 (1)
                            industryColors[1], // 緑 (2)
                            industryColors[2], // 黄色 (3)
                            industryColors[3], // グレー (4)
                            industryColors[4], // 青 (5)
                          ];

                          return (
                            <div key={level} className="flex items-center gap-3">
                              <div className="w-20 text-right">
                                <span className="text-sm font-bold text-gray-700">
                                  {level} ({labels[level - 1]})
                                </span>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className="h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                  style={{ width: `${percentage}%`, backgroundColor: colors[level - 1] }}
                                >
                                  {count > 0 && (
                                    <span className="text-white font-bold text-sm">{count}件</span>
                                  )}
                                </div>
                              </div>
                              <div className="w-16 text-left">
                                <span className="text-xs text-gray-600">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 職種マッチ度分布 */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-4">職種マッチ度の分布</h5>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((level) => {
                          const count = trend.reviewStats!.jobMatchDistribution[level - 1];
                          const percentage = trend.reviewStats!.totalReviews > 0
                            ? (count / trend.reviewStats!.totalReviews) * 100
                            : 0;
                          const labels = ['20%', '40%', '60%', '80%', '100%'];
                          const industryColors = ['#1A4472', '#47845E', '#CAC75C', '#9CA3AF', '#1A4472'];
                          const colors = [
                            industryColors[0], // 青 (1)
                            industryColors[1], // 緑 (2)
                            industryColors[2], // 黄色 (3)
                            industryColors[3], // グレー (4)
                            industryColors[4], // 青 (5)
                          ];

                          return (
                            <div key={level} className="flex items-center gap-3">
                              <div className="w-20 text-right">
                                <span className="text-sm font-bold text-gray-700">
                                  {level} ({labels[level - 1]})
                                </span>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className="h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                  style={{ width: `${percentage}%`, backgroundColor: colors[level - 1] }}
                                >
                                  {count > 0 && (
                                    <span className="text-white font-bold text-sm">{count}件</span>
                                  )}
                                </div>
                              </div>
                              <div className="w-16 text-left">
                                <span className="text-xs text-gray-600">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        {/* まだ分析が実行されていない場合 */}
        {!trendLoading && !trend && reviewedEventsCount >= 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">まだ傾向分析が実行されていません</p>
            <p className="text-gray-500 text-sm">
              「傾向を分析」ボタンをクリックして、志望傾向を分析しましょう
            </p>
          </div>
        )}
      </main>

      {/* マッチ度詳細モーダル */}
      {showMatchModal && trend?.summary.matchInsights && trend.reviewStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="bg-[#1A4472] text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">マッチ度詳細分析</h3>
              <button
                onClick={() => setShowMatchModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* タブ切り替え */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('company')}
                  className={`py-3 px-4 font-semibold transition-all ${
                    activeTab === 'company'
                      ? 'text-[#1A4472] border-b-2 border-[#1A4472]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  企業別マッチ度
                </button>
                <button
                  onClick={() => setActiveTab('job')}
                  className={`py-3 px-4 font-semibold transition-all ${
                    activeTab === 'job'
                      ? 'text-[#1A4472] border-b-2 border-[#1A4472]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  職種別マッチ度
                </button>
              </div>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* 企業別タブ */}
              {activeTab === 'company' && (
                <div>
                  {/* AIの推奨企業（上部：2列レイアウト） */}
                  {trend.summary.matchInsights && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* 左側：高マッチ企業 */}
                      {trend.summary.matchInsights.highMatchCompanies.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
                          <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            高マッチ企業（AIの推奨）
                          </h4>
                          <div className="space-y-3">
                            {trend.summary.matchInsights.highMatchCompanies.map((company, index) => (
                              <div key={index} className="bg-white rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-gray-900">{company.companyName}</p>
                                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {company.avgMatchRate.toFixed(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{company.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 右側：低マッチ企業 */}
                      {trend.summary.matchInsights.lowMatchCompanies.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300">
                          <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            低マッチ企業（要検討）
                          </h4>
                          <div className="space-y-3">
                            {trend.summary.matchInsights.lowMatchCompanies.map((company, index) => (
                              <div key={index} className="bg-white rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-gray-900">{company.companyName}</p>
                                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {company.avgMatchRate.toFixed(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{company.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* フィルター（タブボタン形式）・ソート */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      {/* タブボタン形式のフィルター */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCompanyFilter('all')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            companyFilter === 'all'
                              ? 'bg-[#1A4472] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          すべて
                        </button>
                        <button
                          onClick={() => setCompanyFilter('high')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            companyFilter === 'high'
                              ? 'bg-[#47845E] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          高マッチ (≥4.0)
                        </button>
                        <button
                          onClick={() => setCompanyFilter('medium')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            companyFilter === 'medium'
                              ? 'bg-[#CAC75C] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          中マッチ (2.5-4.0)
                        </button>
                        <button
                          onClick={() => setCompanyFilter('low')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            companyFilter === 'low'
                              ? 'bg-gray-400 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          低マッチ (&lt;2.5)
                        </button>
                      </div>

                      {/* 並び順 */}
                      <div>
                        <label className="text-sm text-gray-600 mr-2">並び順:</label>
                        <select
                          value={companySortBy}
                          onChange={(e) => setCompanySortBy(e.target.value as 'match' | 'reviews')}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="match">マッチ度順</option>
                          <option value="reviews">レビュー数順</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 企業別マッチ度リスト */}
                  <div className="space-y-4">
                    {filteredAndSortedCompanies.map((company) => {
                      const avgMatch = (company.avgCompanyMatch + company.avgJobMatch) / 2;
                      const matchColor =
                        avgMatch >= 4.0
                          ? '#47845E'
                          : avgMatch >= 2.5
                          ? '#CAC75C'
                          : '#9CA3AF';

                      return (
                        <div key={company.companyName} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-900">{company.companyName}</h4>
                            <div className="text-white px-4 py-2 rounded-lg font-bold text-lg" style={{ backgroundColor: matchColor }}>
                              {avgMatch.toFixed(1)}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">企業マッチ度</p>
                              <p className="text-xl font-bold text-gray-900">{company.avgCompanyMatch.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">職種マッチ度</p>
                              <p className="text-xl font-bold text-gray-900">{company.avgJobMatch.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">レビュー数</p>
                              <p className="text-xl font-bold text-gray-900">{company.reviewCount}件</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 職種別タブ */}
              {activeTab === 'job' && (
                <div>
                  {/* AIの推奨職種（上部表示） */}
                  {trend.summary.matchInsights && trend.summary.matchInsights.recommendedJobPositions.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300 mb-8">
                      <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        推奨職種（AIのアドバイス）
                      </h4>
                      <div className="space-y-3">
                        {trend.summary.matchInsights.recommendedJobPositions.map((job, index) => (
                          <div key={index} className="bg-white rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-900">{job.position}</p>
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {job.avgMatchRate.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{job.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* フィルター（タブボタン形式）・ソート */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      {/* タブボタン形式のフィルター */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setJobFilter('all')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            jobFilter === 'all'
                              ? 'bg-[#1A4472] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          すべて
                        </button>
                        <button
                          onClick={() => setJobFilter('high')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            jobFilter === 'high'
                              ? 'bg-[#47845E] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          高マッチ (≥4.0)
                        </button>
                        <button
                          onClick={() => setJobFilter('medium')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            jobFilter === 'medium'
                              ? 'bg-[#CAC75C] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          中マッチ (2.5-4.0)
                        </button>
                        <button
                          onClick={() => setJobFilter('low')}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            jobFilter === 'low'
                              ? 'bg-gray-400 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          低マッチ (&lt;2.5)
                        </button>
                      </div>

                      {/* 並び順 */}
                      <div>
                        <label className="text-sm text-gray-600 mr-2">並び順:</label>
                        <select
                          value={jobSortBy}
                          onChange={(e) => setJobSortBy(e.target.value as 'match' | 'count')}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="match">マッチ度順</option>
                          <option value="count">応募数順</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 職種別マッチ度リスト */}
                  <div className="space-y-4">
                    {filteredAndSortedJobs.map((job) => {
                      const avgMatch = (job.avgCompanyMatch + job.avgJobMatch) / 2;
                      const matchColor =
                        avgMatch >= 4.0
                          ? '#47845E'
                          : avgMatch >= 2.5
                          ? '#CAC75C'
                          : '#9CA3AF';

                      return (
                        <div key={job.position} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-900">{job.position}</h4>
                            <div className="text-white px-4 py-2 rounded-lg font-bold text-lg" style={{ backgroundColor: matchColor }}>
                              {avgMatch.toFixed(1)}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600">企業マッチ度</p>
                              <p className="text-xl font-bold text-gray-900">{job.avgCompanyMatch.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">職種マッチ度</p>
                              <p className="text-xl font-bold text-gray-900">{job.avgJobMatch.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">応募数</p>
                              <p className="text-xl font-bold text-gray-900">{job.count}社</p>
                            </div>
                          </div>

                          {/* 企業リスト */}
                          {job.companies && job.companies.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <p className="text-xs text-gray-600 mb-2">応募企業:</p>
                              <div className="flex flex-wrap gap-2">
                                {job.companies.map((company, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs"
                                  >
                                    {company.companyName} ({company.eventType}) - {company.matchRate.toFixed(1)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ユーザー設定モーダル */}
      <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
