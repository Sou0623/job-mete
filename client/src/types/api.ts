/**
 * API リクエスト・レスポンスの型定義
 */

import type { CompanyAnalysis, CompanyStats } from './company';
import type { EventType } from './event';
import type { TrendSummary } from './trend';

// ============================================================
// createCompany
// ============================================================

export interface CreateCompanyRequest {
  companyName: string;
  forceCreate?: boolean;
}

export interface CreateCompanyResponse {
  success: boolean;
  isDuplicate?: boolean;
  companyId?: string;
  analysis?: CompanyAnalysis;
  existingCompany?: {
    id: string;
    companyName: string;
    normalizedName: string;
    createdAt: string;
    stats: CompanyStats;
  };
}

// ============================================================
// createEvent
// ============================================================

export interface CreateEventRequest {
  companyName: string;
  eventType: EventType;
  date: string; // ISO 8601
  endDate: string; // ISO 8601
  location?: string;
  memo?: string;
  jobPosition?: string; // 応募職種
  syncToCalendar?: boolean;
}

export interface CreateEventResponse {
  success: boolean;
  eventId: string;
  companyId: string;
  calendarEventId?: string;
  calendarSyncStatus: 'synced' | 'pending' | 'failed';
}

// ============================================================
// analyzeTrends
// ============================================================

export interface AnalyzeTrendsRequest {
  // パラメータなし
}

export interface AnalyzeTrendsResponse {
  success: boolean;
  summary: TrendSummary;
  analyzedAt: string; // ISO 8601
  companyCount: number;
}

// ============================================================
// reanalyzeCompany
// ============================================================

export interface ReanalyzeCompanyRequest {
  companyId: string;
}

export interface ReanalyzeCompanyResponse {
  success: boolean;
  companyId: string;
  message: string;
}
