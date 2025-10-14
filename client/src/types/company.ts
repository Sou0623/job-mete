/**
 * 企業データの型定義
 */

/**
 * 企業マスターデータ
 */
export interface Company {
  id: string;
  companyName: string;
  normalizedName: string;
  companyNameVariations?: string[];
  analysis: CompanyAnalysis;
  analysisMetadata: AnalysisMetadata;
  userNotes?: string;
  stats: CompanyStats;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * 企業分析結果
 */
export interface CompanyAnalysis {
  businessOverview: string;
  strengths: string[];
  recentNews: string;
  industryPosition: string;
  recruitmentInsights: string;
}

/**
 * 分析メタ情報
 */
export interface AnalysisMetadata {
  status: 'completed' | 'pending' | 'failed';
  modelUsed: string;
  tokensUsed: number;
  searchSources: string[];
  analyzedAt: string; // ISO 8601
  version: string;
  needsUpdate: boolean;
  lastUpdateCheck: string; // ISO 8601
}

/**
 * 企業統計情報
 */
export interface CompanyStats {
  eventCount: number;
  firstRegistered: string; // ISO 8601
  lastEventDate: string | null; // ISO 8601
}
