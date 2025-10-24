/**
 * 企業一覧ページ
 * 登録された企業一覧を表示し、検索・フィルタ機能を提供
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import CompanyCard from '@/components/companies/CompanyCard';
import Header from '@/components/layout/Header';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import UserModal from '@/components/common/UserModal';

export default function CompaniesPage() {
  const { companies, loading, error } = useCompanies();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('すべて');

  /**
   * URLパラメータから業界フィルターを初期化
   */
  useEffect(() => {
    const industryParam = searchParams.get('industry');
    if (industryParam) {
      setSelectedIndustry(decodeURIComponent(industryParam));
    }
  }, [searchParams]);

  /**
   * 業界選択時にURLパラメータを更新
   */
  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    if (industry === 'すべて') {
      setSearchParams({});
    } else {
      setSearchParams({ industry: industry });
    }
  };

  /**
   * 登録されている業界一覧を取得
   */
  const industries = useMemo(() => {
    const industrySet = new Set<string>();
    companies.forEach((company) => {
      // 新データ構造: industry フィールドを優先
      const industry = company.analysis?.marketAnalysis?.industry;
      if (industry) {
        industrySet.add(industry);
      } else {
        // 旧データ構造: industryPosition から抽出（後方互換性）
        const legacyAnalysis = company.analysis as { industryPosition?: string };
        const industryPosition = company.analysis?.marketAnalysis?.industryPosition || legacyAnalysis?.industryPosition;
        if (industryPosition) {
          // 業界名を抽出（例: "IT業界で〜" → "IT"）
          const match = industryPosition.match(/^([^業界]+)/);
          if (match) {
            industrySet.add(match[1].trim());
          }
        }
      }
    });
    return ['すべて', ...Array.from(industrySet).sort()];
  }, [companies]);

  /**
   * 検索クエリと業界で企業をフィルタリング
   */
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedIndustry === 'すべて') {
        return matchesSearch;
      }

      // 新データ構造: industry フィールドを優先
      const industry = company.analysis?.marketAnalysis?.industry;
      if (industry) {
        const matchesIndustry = industry === selectedIndustry;
        return matchesSearch && matchesIndustry;
      }

      // 旧データ構造: industryPosition から判定（後方互換性）
      const legacyAnalysis = company.analysis as { industryPosition?: string };
      const industryPosition = company.analysis?.marketAnalysis?.industryPosition || legacyAnalysis?.industryPosition;
      const matchesIndustry = industryPosition?.startsWith(selectedIndustry) ?? false;
      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchQuery, selectedIndustry]);

  /**
   * 予定登録ページに遷移
   */
  const handleAddEvent = () => {
    navigate('/events/new');
  };

  /**
   * 企業追加ページに遷移
   */
  const handleAddCompany = () => {
    navigate('/companies/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUserIconClick={() => setShowUserModal(true)} />

     {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* ページタイトル・アクション */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-[#1A4472]">
                企業一覧
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-600">
                  登録企業数: <span className="font-bold text-[#1A4472]">{companies.length}</span>社
                </p>
                <div className="h-4 w-px bg-gray-300"></div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#1A4472]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  予定を登録すると、AIが自動分析します
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCompany}
                className="bg-white text-[#1A4472] border-2 border-[#1A4472] px-6 py-3 rounded-xl hover:bg-[#1A4472]/10 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                企業を分析
              </button>
              <button
                onClick={handleAddEvent}
                className="bg-[#1A4472] text-white px-6 py-3 rounded-xl hover:bg-[#153a64] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                予定を登録
              </button>
            </div>
          </div>

          {/* 検索バー */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="企業名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A4472] focus:border-transparent transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 業界タブフィルター */}
          {industries.length > 1 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handleIndustrySelect(industry)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedIndustry === industry
                        ? 'bg-[#1A4472] text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#1A4472] hover:text-[#1A4472]'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          )}


        {/* ローディング状態 */}
        {loading && (
          <div className="py-12">
            <Loading />
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* 企業一覧 */}
        {!loading && !error && (
          <>
            {filteredCompanies.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                {searchQuery ? (
                  <>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg mb-2 font-medium">
                      「{searchQuery}」に一致する企業が見つかりません
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[#1A4472] hover:text-[#47845E] text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      検索をクリア
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-[#1A4472]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg mb-2 font-medium">
                      まだ企業が登録されていません
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      予定を登録すると、AIが自動的に企業情報を分析して一覧に追加します
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleAddCompany}
                        className="bg-white text-[#1A4472] border-2 border-[#1A4472] px-6 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-md hover:shadow-lg"
                      >
                        企業分析から登録
                      </button>
                      <button
                        onClick={handleAddEvent}
                        className="bg-[#1A4472] text-white px-6 py-2 rounded-lg hover:bg-[#47845E] transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        予定から登録
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* 検索結果の件数表示 */}
                {(searchQuery || selectedIndustry !== 'すべて') && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium text-[#1A4472]">{filteredCompanies.length}</span>件の企業が見つかりました
                    {selectedIndustry !== 'すべて' && (
                      <span className="ml-2">
                        （業界: <span className="font-medium text-[#47845E]">{selectedIndustry}</span>）
                      </span>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ユーザー設定モーダル */}
      <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
