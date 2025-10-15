/**
 * 企業一覧ページ
 * 登録された企業一覧を表示し、検索・フィルタ機能を提供
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import CompanyCard from '@/components/companies/CompanyCard';
import Header from '@/components/layout/Header';

export default function CompaniesPage() {
  const { companies, loading, error } = useCompanies();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 検索クエリで企業をフィルタリング
   */
  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * 企業登録ページに遷移
   */
  const handleAddCompany = () => {
    navigate('/companies/new');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ページタイトル・アクション */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">企業一覧</h2>
            <p className="text-sm text-gray-600 mt-1">
              登録企業数: {companies.length}社
            </p>
          </div>

          <button
            onClick={handleAddCompany}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + 企業を追加
          </button>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="企業名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* 企業一覧 */}
        {!loading && !error && (
          <>
            {filteredCompanies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                {searchQuery ? (
                  <>
                    <p className="text-gray-600 text-lg mb-2">
                      「{searchQuery}」に一致する企業が見つかりません
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      検索をクリア
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg mb-4">
                      まだ企業が登録されていません
                    </p>
                    <button
                      onClick={handleAddCompany}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      最初の企業を追加
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
