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
 * 企業分析結果（改訂版）
 */
export interface CompanyAnalysis {
  corporateProfile: CorporateProfile;
  marketAnalysis: MarketAnalysis;
  futureDirection: FutureDirection;
  workEnvironment: WorkEnvironment;
}

/**
 * I. 企業概要
 */
export interface CorporateProfile {
  mission: string; // 100文字以内
  businessSummary: string; // 200文字以内
}

/**
 * II. 企業の強みと市場環境
 */
export interface MarketAnalysis {
  industry: string; // 業界名（1単語）
  strengths: string[]; // 3〜5つのキーワード
  weaknesses: string[]; // 2〜3つのキーワード
  industryPosition: string; // 100文字以内
  competitors: string[]; // 2〜3社
}

/**
 * III. 将来の方向性
 */
export interface FutureDirection {
  recentTrends: string; // 200文字以内
  growthPotential: string; // 200文字以内
}

/**
 * IV. 働く環境と文化
 */
export interface WorkEnvironment {
  corporateCulture: string; // 200文字以内
  careerPath: string; // 200文字以内
  hiringInfo: string; // 150文字以内
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
