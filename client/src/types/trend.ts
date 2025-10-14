/**
 * 傾向分析データの型定義
 */

/**
 * 傾向分析結果
 */
export interface Trend {
  summary: TrendSummary;
  sourceCompanies: Array<{
    companyId: string;
    companyName: string;
  }>;
  analyzedAt: string; // ISO 8601
  companyCount: number;
  modelUsed: string;
}

/**
 * 傾向分析サマリー
 */
export interface TrendSummary {
  overallTrend: string;
  topIndustries: IndustryData[];
  commonKeywords: KeywordData[];
  recommendedSkills: string[];
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
