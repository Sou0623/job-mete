/**
 * Functions用の型定義
 */

/**
 * 企業マスターデータ
 */
export interface Company {
  id?: string;
  companyName: string;
  normalizedName: string;
  companyNameVariations?: string[];
  analysis: CompanyAnalysis;
  analysisMetadata: AnalysisMetadata;
  userNotes?: string;
  stats: CompanyStats;
  createdAt: FirebaseFirestore.Timestamp | string;
  updatedAt: FirebaseFirestore.Timestamp | string;
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
  status: "completed" | "pending" | "failed";
  modelUsed: string;
  tokensUsed: number;
  searchSources: string[];
  analyzedAt: string;
  version: string;
  needsUpdate: boolean;
  lastUpdateCheck: string;
  /** デバッグ用：Gemini APIに送信したプロンプト */
  prompt?: string;
  /** デバッグ用：Gemini APIからの生のレスポンス（JSON文字列） */
  rawResponse?: string;
}

/**
 * 企業統計情報
 */
export interface CompanyStats {
  eventCount: number;
  firstRegistered: string;
  lastEventDate: string | null;
}

/**
 * createCompany Function のリクエスト
 */
export interface CreateCompanyRequest {
  companyName: string;
}

/**
 * createCompany Function のレスポンス
 */
export interface CreateCompanyResponse {
  success: boolean;
  companyId?: string;
  isDuplicate?: boolean;
  error?: string;
}
