# Issue #3: TypeScript 型定義の作成

## 背景 / 目的
型安全性を確保し、開発効率を向上させるため、プロジェクト全体で使用する TypeScript 型定義を作成します。データベース設計書（`docs/job_mete_database.txt`）と整合性を保ちます。

- **依存**: #1
- **ラベル**: `frontend`, `types`
- **作業時間**: 0.5日

---

## スコープ / 作業項目

### 1. src/types/ ディレクトリ構造の作成
```
src/types/
├── company.ts      # Company, CompanyAnalysis, AnalysisMetadata
├── event.ts        # Event, EventType, Status
├── trend.ts        # Trend, TrendSummary
├── user.ts         # User
├── api.ts          # API リクエスト・レスポンス型
└── index.ts        # 全型のエクスポート
```

### 2. 各型定義ファイルの実装
参照: `docs/job_mete_database.txt`

#### company.ts
- `Company`: 企業マスターデータ
- `CompanyAnalysis`: 企業分析結果
- `AnalysisMetadata`: 分析メタ情報
- `CompanyStats`: 統計情報

#### event.ts
- `Event`: 予定データ
- `EventType`: イベント種別（Union Type）
- `Status`: ステータス（Union Type）
- `Result`: 結果（Union Type）
- `GoogleCalendar`: カレンダー連携情報

#### trend.ts
- `Trend`: 傾向分析結果
- `TrendSummary`: 分析サマリー
- `IndustryData`: 業界別データ
- `KeywordData`: キーワードデータ

#### user.ts
- `User`: ユーザー情報

#### api.ts
- リクエスト・レスポンス型
  - `CreateCompanyRequest`, `CreateCompanyResponse`
  - `CreateEventRequest`, `CreateEventResponse`
  - `AnalyzeTrendsRequest`, `AnalyzeTrendsResponse`

### 3. index.ts でのエクスポート
- 全型を一箇所からエクスポート
- `export * from './company'` 形式

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] src/types/company.ts に Company, CompanyAnalysis, AnalysisMetadata 型が定義されている
- [ ] src/types/event.ts に Event, EventType, Status 型が定義されている
- [ ] src/types/trend.ts に Trend, TrendSummary 型が定義されている
- [ ] src/types/user.ts に User 型が定義されている
- [ ] src/types/api.ts に各Function のリクエスト・レスポンス型が定義されている
- [ ] 全ての型定義が docs/job_mete_database.txt と整合している

---

## テスト観点

### 型チェック
- `npm run type-check` でエラーが出ないこと
- 各型が適切にエクスポートされていること
- インポート時に型補完が効くこと

### 検証方法
```bash
# TypeScript コンパイルチェック
npx tsc --noEmit

# または package.json に追加
npm run type-check
```

---

## 実装参考

### src/types/company.ts
```typescript
export interface Company {
  id: string;
  companyName: string;
  normalizedName: string;
  companyNameVariations?: string[];
  analysis: CompanyAnalysis;
  analysisMetadata: AnalysisMetadata;
  userNotes?: string;
  stats: CompanyStats;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAnalysis {
  businessOverview: string;
  strengths: string[];
  recentNews: string;
  industryPosition: string;
  recruitmentInsights: string;
}

export interface AnalysisMetadata {
  status: 'completed' | 'pending' | 'failed';
  modelUsed: string;
  tokensUsed: number;
  searchSources: string[];
  analyzedAt: string;
  version: string;
  needsUpdate: boolean;
  lastUpdateCheck: string;
}

export interface CompanyStats {
  eventCount: number;
  firstRegistered: string;
  lastEventDate: string | null;
}
```

### src/types/event.ts
```typescript
export type EventType =
  | '一次面接'
  | '二次面接'
  | '最終面接'
  | '説明会'
  | 'インターン'
  | 'カジュアル面談'
  | 'その他';

export type Status = 'scheduled' | 'completed' | 'cancelled';

export type Result = 'passed' | 'failed' | 'waiting' | null;

export interface Event {
  id: string;
  companyId: string;
  companyName: string;
  eventType: EventType;
  date: string; // ISO 8601
  endDate: string;
  location?: string;
  memo?: string;
  googleCalendar?: GoogleCalendar;
  status: Status;
  result?: Result;
  resultMemo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleCalendar {
  eventId: string | null;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAttempt: string | null;
}
```

### src/types/trend.ts
```typescript
export interface Trend {
  summary: TrendSummary;
  sourceCompanies: Array<{
    companyId: string;
    companyName: string;
  }>;
  analyzedAt: string;
  companyCount: number;
  modelUsed: string;
}

export interface TrendSummary {
  overallTrend: string;
  topIndustries: IndustryData[];
  commonKeywords: KeywordData[];
  recommendedSkills: string[];
}

export interface IndustryData {
  name: string;
  count: number;
  percentage: number;
}

export interface KeywordData {
  word: string;
  count: number;
}
```

### src/types/user.ts
```typescript
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}
```

### src/types/api.ts
```typescript
// createCompany
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

// createEvent
export interface CreateEventRequest {
  companyName: string;
  eventType: EventType;
  date: string;
  endDate: string;
  location?: string;
  memo?: string;
  syncToCalendar?: boolean;
}

export interface CreateEventResponse {
  success: boolean;
  eventId: string;
  companyId: string;
  calendarEventId?: string;
  calendarSyncStatus: 'synced' | 'pending' | 'failed';
}

// analyzeTrends
export interface AnalyzeTrendsRequest {
  // パラメータなし
}

export interface AnalyzeTrendsResponse {
  success: boolean;
  summary: TrendSummary;
  analyzedAt: string;
  companyCount: number;
}
```

### src/types/index.ts
```typescript
export * from './company';
export * from './event';
export * from './trend';
export * from './user';
export * from './api';
```

---

## 参考資料

- `docs/job_mete_database.txt` - データベーススキーマ定義
- `docs/job_mete_api.txt` - API 仕様
- `CLAUDE.md` - TypeScript 規約（Enum禁止、Union Type使用）
