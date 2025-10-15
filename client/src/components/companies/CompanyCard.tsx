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
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {company.companyName}
          </h3>
          {company.analysis.industryPosition && (
            <p className="text-sm text-gray-600">
              {company.analysis.industryPosition.split('、')[0]}
            </p>
          )}
        </div>

        {/* 再分析バッジ */}
        {needsReanalysis() && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            再分析推奨
          </span>
        )}
      </div>

      {/* 事業概要 */}
      {company.analysis.businessOverview && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {company.analysis.businessOverview}
        </p>
      )}

      {/* 統計情報 */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-medium">予定:</span>
          <span>{company.stats.eventCount}件</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-medium">分析日:</span>
          <span>{formatDate(company.analysisMetadata.analyzedAt)}</span>
        </div>
      </div>

      {/* 強み（最大3つ表示） */}
      {company.analysis.strengths && company.analysis.strengths.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {company.analysis.strengths.slice(0, 3).map((strength, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
            >
              {strength}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
