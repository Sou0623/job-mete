/**
 * 企業カードコンポーネント
 * 企業一覧画面で表示される個別の企業カード
 */

import { useNavigate } from 'react-router-dom';
import type { Company } from '@/types/company';

interface CompanyCardProps {
  company: Company;
}

/**
 * 旧データ構造の型定義（後方互換性のため）
 */
type LegacyCompanyAnalysis = {
  businessOverview?: string;
  strengths?: string[];
  industryPosition?: string;
};

/**
 * 企業カードコンポーネント
 *
 * @param company - 企業データ
 * @returns 企業カード
 */
export default function CompanyCard({ company }: CompanyCardProps) {
  const navigate = useNavigate();

  /**
   * 最終分析日からの経過日数を計算
   */
  const daysSinceAnalysis = (): number => {
    const analyzedAt = new Date(company.analysisMetadata.analyzedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - analyzedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * 再分析が必要かどうか（30日経過）
   */
  const needsReanalysis = (): boolean => {
    return daysSinceAnalysis() >= 30;
  };

  /**
   * 日付をフォーマット
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * 企業詳細ページに遷移
   */
  const handleClick = () => {
    navigate(`/companies/${company.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 truncate">
            {company.companyName}
          </h3>
          {/* 業界バッジ */}
          {company.analysis.marketAnalysis?.industry && (
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-[#1A4472] px-2 sm:px-3 py-0.5 rounded-full text-xs font-medium border border-blue-300">
                {company.analysis.marketAnalysis.industry}
              </span>
            </div>
          )}
          {(() => {
            const legacyAnalysis = company.analysis as LegacyCompanyAnalysis;
            const industryPosition = company.analysis.marketAnalysis?.industryPosition || legacyAnalysis.industryPosition;
            return industryPosition ? (
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {industryPosition.split('、')[0]}
              </p>
            ) : null;
          })()}
        </div>

        {/* 再分析バッジ */}
        {needsReanalysis() && (
          <span className="bg-yellow-100 text-[#9B8E00] text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded border border-yellow-300 flex-shrink-0 ml-2">
            再分析推奨
          </span>
        )}
      </div>

      {/* 事業概要 */}
      {(() => {
        const legacyAnalysis = company.analysis as LegacyCompanyAnalysis;
        const businessSummary = company.analysis.corporateProfile?.businessSummary || legacyAnalysis.businessOverview;
        return businessSummary ? (
          <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 line-clamp-2">
            {businessSummary}
          </p>
        ) : null;
      })()}

      {/* 統計情報 */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-medium">予定:</span>
          <span>{company.stats.eventCount}件</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-medium hidden sm:inline">分析日:</span>
          <span className="font-medium sm:hidden">分析:</span>
          <span className="truncate">{formatDate(company.analysisMetadata.analyzedAt)}</span>
        </div>
      </div>

      {/* 強み（最大3つ表示） */}
      {(() => {
        const legacyAnalysis = company.analysis as LegacyCompanyAnalysis;
        const strengths = company.analysis.marketAnalysis?.strengths || legacyAnalysis.strengths;
        return strengths && strengths.length > 0 ? (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {strengths.slice(0, 3).map((strength, index) => (
              <span
                key={index}
                className="bg-green-100 text-[#2E7D4D] text-xs font-medium px-2 py-1 rounded border border-green-300"
              >
                {strength}
              </span>
            ))}
          </div>
        ) : null;
      })()}
    </div>
  );
}
