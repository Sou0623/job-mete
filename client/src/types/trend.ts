/**
 * 傾向分析データの型定義
 */

/**
 * 傾向分析結果
 */
export interface Trend {
  id: string;
  summary: TrendSummary;
  sourceCompanies: Array<{
    companyId: string;
    companyName: string;
  }>;
  reviewStats?: ReviewStats | null; // レビュー統計データ
  analyzedAt: string; // ISO 8601
  companyCount: number;
  modelUsed: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * 傾向分析サマリー
 */
export interface TrendSummary {
  overallTrend: string;
  topIndustries: IndustryData[];
  commonKeywords: KeywordData[];
  recommendedSkills: string[];
  matchInsights?: MatchInsights | null; // レビューデータがある場合のみ
}

/**
 * 業界別データ
 */
export interface IndustryData {
  name: string;
  count: number;
  percentage: number;
}

/**
 * キーワードデータ
 */
export interface KeywordData {
  word: string;
  count: number;
}

/**
 * マッチ度分析の洞察（レビューデータから生成）
 */
export interface MatchInsights {
  highMatchCompanies: MatchCompanyData[];
  lowMatchCompanies: MatchCompanyData[];
  recommendedJobPositions: RecommendedJobData[];
  careerAdvice: string;
}

/**
 * マッチ度の高い/低い企業データ
 */
export interface MatchCompanyData {
  companyName: string;
  avgMatchRate: number;
  reason: string;
}

/**
 * 推奨職種データ
 */
export interface RecommendedJobData {
  position: string;
  avgMatchRate: number;
  reason: string;
}

/**
 * レビュー統計データ
 */
export interface ReviewStats {
  totalReviews: number;
  avgCompanyMatch: number;
  avgJobMatch: number;
  jobPositionStats: JobPositionStat[];
  companyStats: CompanyStat[];
  companyMatchDistribution: number[]; // [1の件数, 2の件数, 3の件数, 4の件数, 5の件数]
  jobMatchDistribution: number[];
}

/**
 * 職種別統計
 */
export interface JobPositionStat {
  position: string;
  count: number;
  avgCompanyMatch: number;
  avgJobMatch: number;
  companies: Array<{
    companyName: string;
    eventType: string;
    matchRate: number;
  }>;
}

/**
 * 企業別統計
 */
export interface CompanyStat {
  companyName: string;
  reviewCount: number;
  avgCompanyMatch: number;
  avgJobMatch: number;
}
