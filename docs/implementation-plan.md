# 🚀 Job Mete 実装計画書 v1.5

---

## フェーズ構成

### フェーズ0: Walking Skeleton（基盤構築）
**目的**: Firebase・認証・基本レイアウトを構築し、End-to-Endの動作を確認
**含むIssue**: #1〜#5

### フェーズ1: 企業管理MVP
**目的**: 企業登録・一覧表示・Gemini分析の最小限のフローを実装
**含むIssue**: #6〜#11

### フェーズ2: 予定管理MVP
**目的**: 予定登録・一覧表示・Googleカレンダー同期の基本フローを実装
**含むIssue**: #12〜#17

### フェーズ3: 傾向分析MVP
**目的**: 傾向分析機能の実装とダッシュボード統合
**含むIssue**: #18〜#20

### フェーズ4: 堅牢化・UX向上
**目的**: エラーハンドリング、ローディング、バリデーション、レスポンシブ対応
**含むIssue**: #21〜#25

---

## 依存関係マップ

```
#1 → #2, #3, #4
#2 → #5
#3 → #5
#4 → #5
#5 → #6, #12, #18
#6 → #7, #8
#7 → #9
#8 → #9
#9 → #10, #11
#10 → #12
#11 → (並行可能)
#12 → #13, #14
#13 → #15
#14 → #15
#15 → #16, #17
#16 → #18
#17 → (並行可能)
#18 → #19
#19 → #20
#20 → #21, #22, #23, #24, #25（全て並行可能）
```

---

## Issue詳細

### フェーズ0: Walking Skeleton（基盤構築）

#### Issue #1: Firebase プロジェクトとEmulator環境のセットアップ
**概要**: Firebase プロジェクトの作成、Emulatorの設定、環境変数の設定を行い、ローカル開発環境を構築
**依存**: -
**ラベル**: `infra`, `setup`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] Firebase プロジェクトが作成され、firebase.json が設定済み
- [ ] Firestore, Authentication, Functions の Emulator が起動可能
- [ ] .env.local に必要な環境変数（Firebase設定）が記載されている
- [ ] `firebase emulators:start` で全Emulatorが起動することを確認
- [ ] README.md にセットアップ手順が記載されている

---

#### Issue #2: Firestore セキュリティルール・インデックスの設定
**概要**: firestore.rules の実装、必要なインデックスの定義（firestore.indexes.json）
**依存**: #1
**ラベル**: `infra`, `security`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] firestore.rules が実装され、ユーザーごとのデータ分離が実現されている
- [ ] firestore.indexes.json に必要な複合インデックスが定義されている（companies, eventsのクエリ用）
- [ ] Emulator上でルールが正しく動作することを確認（他ユーザーのデータにアクセスできないこと）

**実装内容**:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "normalizedName", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

#### Issue #3: TypeScript 型定義の作成
**概要**: src/types/ 配下に Company, Event, Trend, User などの型定義を作成
**依存**: #1
**ラベル**: `frontend`, `types`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] src/types/company.ts に Company, CompanyAnalysis, AnalysisMetadata 型が定義されている
- [ ] src/types/event.ts に Event, EventType, Status 型が定義されている
- [ ] src/types/trend.ts に Trend, TrendSummary 型が定義されている
- [ ] src/types/user.ts に User 型が定義されている
- [ ] src/types/api.ts に各Function のリクエスト・レスポンス型が定義されている
- [ ] 全ての型定義が docs/job_mete_database.txt と整合している

**実装参考**:
```typescript
// src/types/company.ts
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

---

#### Issue #4: Firebase SDK とEmulator接続の実装
**概要**: src/services/firebase.ts を実装し、Firebase SDK の初期化とEmulator接続を行う
**依存**: #1
**ラベル**: `frontend`, `infra`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] src/services/firebase.ts に Firebase SDK 初期化コードが実装されている
- [ ] 開発環境（NODE_ENV=development）では Emulator に接続される
- [ ] Firestore, Authentication, Functions の接続が確認できる
- [ ] 環境変数から Firebase 設定を読み込んでいる

**実装参考**:
```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Emulator接続（開発環境のみ）
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { db, auth, functions };
```

---

#### Issue #5: 認証機能（AuthContext, ログイン画面）の実装
**概要**: Firebase Authentication を使った Google ログイン機能と AuthContext の実装
**依存**: #2, #3, #4
**ラベル**: `frontend`, `auth`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/contexts/AuthContext.tsx が実装され、useAuth() で認証状態を取得できる
- [ ] src/pages/LoginPage.tsx が実装され、Google ログインボタンが表示される
- [ ] ログイン成功後、/dashboard にリダイレクトされる
- [ ] ProtectedRoute コンポーネントで認証チェックが実装されている
- [ ] 未認証時は /login にリダイレクトされる

**実装内容**:
- AuthProvider: onAuthStateChanged でログイン状態監視
- LoginPage: Google Sign-In ボタン
- ProtectedRoute: 認証チェックとリダイレクト
- App.tsx: ルーティング設定

---

### フェーズ1: 企業管理MVP

#### Issue #6: Functions の基盤実装（共通処理・エラーハンドリング）
**概要**: functions/src/ の基本構造構築、共通ユーティリティ（正規化、バリデーション、リトライ）の実装
**依存**: #5
**ラベル**: `backend`, `infra`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/utils/normalizer.ts に企業名正規化関数が実装されている
- [ ] functions/src/utils/validators.ts にバリデーション関数が実装されている
- [ ] functions/src/utils/retry.ts に Exponential Backoff リトライロジックが実装されている
- [ ] functions/src/utils/errorHandler.ts に統一エラーハンドリングが実装されている
- [ ] functions/src/config/firebase.ts に Firebase Admin 初期化が実装されている

**実装参考**:
```typescript
// functions/src/utils/normalizer.ts
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/株式会社|かぶしきがいしゃ|㈱/g, '')
    .replace(/\s+/g, '')
    .replace(/[\.、。・]/g, '');
}
```

---

#### Issue #7: Gemini API 統合とプロンプト実装
**概要**: functions/src/services/geminiService.ts の実装、企業分析プロンプトの作成
**依存**: #6
**ラベル**: `backend`, `ai`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/services/geminiService.ts に Gemini API 呼び出しコードが実装されている
- [ ] functions/src/prompts/companyAnalysisPrompt.ts に企業分析用プロンプトが実装されている
- [ ] Gemini API からの JSON レスポンスがパース可能である
- [ ] レート制限エラー（429）時のリトライが実装されている
- [ ] 環境変数 GEMINI_API_KEY から API キーを読み込んでいる

**実装内容**:
- GoogleGenerativeAI SDK を使用
- モデル: gemini-2.0-flash-exp
- responseMimeType: application/json
- Grounding（Google Search）有効化

---

#### Issue #8: createCompany Function の実装
**概要**: 企業登録API（重複チェック、Gemini分析、Firestore保存）の実装
**依存**: #6, #7
**ラベル**: `backend`, `api`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/companies/createCompany.ts が実装されている
- [ ] 企業名の正規化と重複チェックが動作する
- [ ] 重複時は既存企業情報を返す
- [ ] 新規企業の場合、Gemini API で分析を実行する
- [ ] 分析結果を Firestore に保存する
- [ ] エラーハンドリングが適切に行われている

**処理フロー**:
1. 認証チェック（context.auth）
2. 企業名正規化
3. 重複チェック（normalizedName で検索）
4. 重複ありの場合、既存企業情報を返す
5. 新規の場合、Gemini API で企業分析
6. Firestore に保存
7. companyId を返す

---

#### Issue #9: 企業一覧表示（CompaniesPage, CompanyCard）の実装
**概要**: 企業一覧画面とカードコンポーネントの実装、useCompanies フックの作成
**依存**: #7, #8
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/hooks/useCompanies.ts が実装され、Firestore からリアルタイムでデータ取得できる
- [ ] src/components/companies/CompanyCard.tsx が実装され、企業情報を表示できる
- [ ] src/pages/CompaniesPage.tsx が実装され、企業一覧が表示される
- [ ] 再分析バッジ（30日経過）が表示される
- [ ] 検索機能（企業名フィルタ）が動作する

**実装内容**:
- onSnapshot でリアルタイム更新
- 企業カード: 企業名、業界、予定数、最終分析日、再分析バッジ
- 検索: フィルタリングはフロントエンドで実装

---

#### Issue #10: 企業登録画面（CompanyForm, DuplicateWarning）の実装
**概要**: 企業登録フォームと重複警告コンポーネントの実装
**依存**: #9
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/CompanyFormPage.tsx が実装されている
- [ ] 企業名入力後、リアルタイムで重複チェックが行われる
- [ ] 重複時は DuplicateWarning コンポーネントで警告を表示する
- [ ] 強制登録オプションが実装されている
- [ ] 登録成功時、企業詳細画面にリダイレクトされる
- [ ] ローディング状態が表示される

**実装内容**:
- useCreateCompany フックで API 呼び出し
- 重複警告: 既存企業情報を表示、「既存企業を見る」「それでも新規登録」ボタン
- Gemini分析中のローディング表示

---

#### Issue #11: 企業詳細画面（CompanyDetailPage, CompanyAnalysis）の実装
**概要**: 企業詳細画面と分析結果表示コンポーネントの実装
**依存**: #9
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/CompanyDetailPage.tsx が実装されている
- [ ] 企業分析結果が表示される（事業内容、強み、最近の動向、業界ポジション、採用情報）
- [ ] ユーザーメモの編集機能が実装されている
- [ ] 再分析ボタンが実装されている（30日経過時に表示）
- [ ] 企業削除ボタンが実装されている（確認ダイアログ付き）

**実装内容**:
- useParams で companyId 取得
- Firestore から企業データ取得
- ユーザーメモ: テキストエリア + 保存ボタン
- 関連予定一覧表示（別Issueで詳細実装）

---

### フェーズ2: 予定管理MVP

#### Issue #12: createEvent Function の実装
**概要**: 予定登録API（企業ID取得/作成、Firestore保存、企業統計更新）の実装
**依存**: #10
**ラベル**: `backend`, `api`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/events/createEvent.ts が実装されている
- [ ] 企業名から企業IDを取得または新規作成する
- [ ] 予定を Firestore に保存する
- [ ] 企業の stats.eventCount を更新する
- [ ] エラーハンドリングが適切に行われている

**処理フロー**:
1. 認証チェック
2. 企業名から企業ID取得（なければ createCompany 呼び出し）
3. 予定を Firestore に保存
4. 企業統計を更新（eventCount++, lastEventDate更新）
5. eventId を返す

---

#### Issue #13: Google Calendar API 統合の実装
**概要**: functions/src/services/calendarService.ts の実装、OAuth 2.0 フローの実装
**依存**: #12
**ラベル**: `backend`, `integration`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/services/calendarService.ts が実装されている
- [ ] OAuth 2.0 でリフレッシュトークンを取得できる
- [ ] Googleカレンダーに予定を作成できる
- [ ] カレンダーEventID を取得し、Firestoreに保存できる
- [ ] エラー時は syncStatus を 'failed' に設定する

**実装内容**:
- googleapis SDK を使用
- OAuth 2.0 フロー
- リフレッシュトークンを Firestore に保存（暗号化推奨）

**注意事項**:
- v1.5 では簡易実装（リフレッシュトークンを環境変数または手動設定）
- v2.0 で完全な OAuth フローを実装

---

#### Issue #14: syncToCalendar Function の実装
**概要**: カレンダー同期Function（内部用）の実装
**依存**: #12, #13
**ラベル**: `backend`, `api`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/calendar/syncToCalendar.ts が実装されている
- [ ] 予定データをGoogleカレンダーに同期できる
- [ ] 同期成功時、EventID を返す
- [ ] 同期失敗時、適切なエラーを返す

**実装内容**:
- createEvent 内部から呼び出される
- calendarService.createCalendarEvent を呼び出し
- 成功時: eventId に googleCalendar.eventId を保存
- 失敗時: googleCalendar.syncStatus = 'failed'

---

#### Issue #15: 予定一覧表示（EventsPage, EventCard, EventCalendar）の実装
**概要**: 予定一覧画面とカードコンポーネント、カレンダー表示の実装
**依存**: #13, #14
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/hooks/useEvents.ts が実装され、予定データをリアルタイム取得できる
- [ ] src/components/events/EventCard.tsx が実装され、予定情報を表示できる
- [ ] src/pages/EventsPage.tsx が実装され、予定一覧が表示される
- [ ] ステータスフィルタ（scheduled/completed/cancelled）が動作する
- [ ] リスト表示/月表示の切り替えが実装されている

**実装内容**:
- useEvents: onSnapshot でリアルタイム更新
- EventCard: 日時、企業名、イベント種別、場所、ステータス
- フィルタ: ドロップダウンでステータス選択
- カレンダー表示: FullCalendar または React Big Calendar を使用

---

#### Issue #16: 予定登録画面（EventForm）の実装
**概要**: 予定登録フォームの実装、Googleカレンダー同期オプション
**依存**: #15
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/EventFormPage.tsx が実装されている
- [ ] 企業名の選択（既存企業のドロップダウン or 新規入力）が実装されている
- [ ] イベント種別、日時、場所、メモの入力が可能である
- [ ] Googleカレンダー同期オプションが実装されている
- [ ] 登録成功時、予定詳細画面にリダイレクトされる
- [ ] ローディング状態が表示される

**実装内容**:
- useCreateEvent フックで API 呼び出し
- 企業名: Combobox（検索可能なドロップダウン）
- 日時: DateTimePicker
- カレンダー同期: チェックボックス（デフォルト: ON）

---

#### Issue #17: 予定詳細画面（EventDetailPage）の実装
**概要**: 予定詳細画面、結果記録機能の実装
**依存**: #15
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/EventDetailPage.tsx が実装されている
- [ ] 予定情報（日時、場所、メモ）が表示される
- [ ] カレンダー同期状態が表示される
- [ ] 結果記録（ステータス、結果、結果メモ）が編集可能である
- [ ] 企業情報へのリンクが実装されている
- [ ] 予定削除ボタンが実装されている

**実装内容**:
- useParams で eventId 取得
- Firestore から予定データ取得
- 結果記録: ステータス・結果のドロップダウン、結果メモのテキストエリア
- updateEvent Function を呼び出して更新

---

### フェーズ3: 傾向分析MVP

#### Issue #18: analyzeTrends Function の実装
**概要**: 傾向分析API（企業データ集計、Geminiサマリー生成）の実装
**依存**: #16
**ラベル**: `backend`, `api`, `ai`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/trends/analyzeTrends.ts が実装されている
- [ ] 企業数が3社未満の場合、エラーを返す
- [ ] 業界別集計、キーワード抽出が実装されている
- [ ] Gemini API でサマリーを生成する
- [ ] 分析結果を Firestore に保存する（trends/latest）
- [ ] 使用量カウンターを更新する（10回/日制限）

**処理フロー**:
1. 認証チェック
2. 企業数チェック（< 3社の場合エラー）
3. 使用量チェック（10回/日制限）
4. 全企業データ取得
5. 業界別集計、キーワード抽出
6. Gemini API でサマリー生成
7. Firestore に保存（trends/latest に上書き）
8. 使用量カウンター更新

---

#### Issue #19: 傾向分析画面（TrendsPage, チャート）の実装
**概要**: 傾向分析画面、円グラフ、タグクラウドの実装
**依存**: #18
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/TrendsPage.tsx が実装されている
- [ ] 業界別円グラフ（IndustryPieChart）が表示される
- [ ] キーワードタグクラウド（KeywordCloud）が表示される
- [ ] AIサマリー（TrendSummary）が表示される
- [ ] 分析実行ボタンが実装されている
- [ ] 企業数3社未満の場合、警告メッセージが表示される
- [ ] 10回/日制限到達時、警告メッセージが表示される

**実装内容**:
- Recharts を使用して円グラフ表示
- react-tagcloud または react-wordcloud でタグクラウド
- useTrends フックで trends/latest を購読
- analyzeTrends Function 呼び出しボタン

---

#### Issue #20: ダッシュボード（DashboardPage）の実装
**概要**: ダッシュボード画面、サマリー表示、直近予定表示の実装
**依存**: #19
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/pages/DashboardPage.tsx が実装されている
- [ ] 登録企業数、今週・今月の予定数が表示される
- [ ] 直近の予定3件が表示される
- [ ] クイックアクション（企業追加、予定追加）が実装されている
- [ ] 傾向分析への誘導が表示される

**実装内容**:
- useCompanies, useEvents フックを使用
- 集計: 今週・今月の予定数をフィルタリング
- 直近予定: date でソートして3件取得
- クイックアクション: /companies/new, /events/new へのリンク

---

### フェーズ4: 堅牢化・UX向上

#### Issue #21: エラーハンドリング・通知システムの実装
**概要**: ErrorBoundary, Toast通知、エラーページの実装
**依存**: #20
**ラベル**: `frontend`, `ui`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] src/components/common/ErrorBoundary.tsx が実装されている
- [ ] src/components/common/Toast.tsx が実装され、成功/エラー通知が表示できる
- [ ] NotificationContext が実装され、アプリ全体で通知を管理できる
- [ ] 404 Not Found ページが実装されている
- [ ] 500 Internal Server Error ページが実装されている

**実装内容**:
- ErrorBoundary: componentDidCatch でエラーをキャッチ
- Toast: react-hot-toast または自前実装
- NotificationContext: showToast メソッド提供

---

#### Issue #22: ローディング状態・スケルトン画面の実装
**概要**: Loading コンポーネント、スケルトンUI、ボタンローディング状態の実装
**依存**: #20
**ラベル**: `frontend`, `ui`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] src/components/common/Loading.tsx が実装されている
- [ ] 各ページでローディング状態が表示される
- [ ] Gemini分析中のプログレスバー（またはスピナー）が表示される
- [ ] ボタンのローディング状態が実装されている（クリック不可）

**実装内容**:
- Loading: スピナーアニメーション（Tailwind CSS のみ）
- スケルトンUI: グレーのプレースホルダー
- Button コンポーネントに loading props 追加

---

#### Issue #23: バリデーション・フォームエラー表示の実装
**概要**: 入力バリデーション、フォームエラーメッセージの実装
**依存**: #20
**ラベル**: `frontend`, `validation`
**作業時間**: 0.5日

**受け入れ基準（AC）**:
- [ ] 企業名入力のバリデーション（必須、100文字以内）が実装されている
- [ ] 予定登録のバリデーション（企業名、日時、イベント種別が必須）が実装されている
- [ ] エラーメッセージが入力欄下部に赤文字で表示される
- [ ] フロントエンドとバックエンド両方でバリデーションが行われる

**実装内容**:
- react-hook-form または自前実装
- バリデーションルール: required, maxLength, pattern
- エラーメッセージ: 入力欄の下に赤文字で表示

---

#### Issue #24: レスポンシブ対応（モバイル・タブレット）の実装
**概要**: モバイル・タブレット用レイアウト、Bottom Navigationの実装
**依存**: #20
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/components/layout/BottomNavigation.tsx が実装されている
- [ ] 画面幅 < 640px でモバイルレイアウトに切り替わる
- [ ] 企業一覧・予定一覧が1カラム表示になる
- [ ] タップ領域が最小44pxを確保している
- [ ] ヘッダー・サイドバーが適切に表示/非表示される

**実装内容**:
- Tailwind CSS のブレークポイント（sm, md, lg）を使用
- BottomNavigation: ホーム、企業、予定、分析、設定
- 画面幅 < 640px: BottomNavigation 表示、Sidebar 非表示
- 画面幅 >= 640px: Sidebar 表示、BottomNavigation 非表示

---

#### Issue #25: 共通UIコンポーネントの実装
**概要**: Button, Input, Modal, Badgeなどの汎用コンポーネントの実装
**依存**: #20
**ラベル**: `frontend`, `ui`
**作業時間**: 1日

**受け入れ基準（AC）**:
- [ ] src/components/common/Button.tsx が実装されている（variant, size, loading対応）
- [ ] src/components/common/Input.tsx が実装されている
- [ ] src/components/common/Modal.tsx が実装されている
- [ ] src/components/common/Badge.tsx が実装されている
- [ ] 全てのコンポーネントが Tailwind CSS のみで実装されている
- [ ] 各コンポーネントが TypeScript で型定義されている

**実装内容**:
- Button: variant (primary, secondary, danger), size (sm, md, lg), loading props
- Input: type, placeholder, error, disabled props
- Modal: isOpen, onClose, title, children props
- Badge: variant (success, warning, danger, info)

---

## 補足実装（フェーズ4以降または並行実装）

### reanalyzeCompany Function（優先度: 中）
**概要**: 企業再分析API の実装
**作業時間**: 0.5日
**実装タイミング**: Issue #11 の後

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/companies/reanalyzeCompany.ts が実装されている
- [ ] 企業IDから企業データを取得し、Gemini API で再分析する
- [ ] 使用量カウンターをチェック（10回/日制限）
- [ ] 分析結果を Firestore に上書き保存する

---

### deleteCompany Function（優先度: 中）
**概要**: 企業削除API の実装
**作業時間**: 0.5日
**実装タイミング**: Issue #11 の後

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/companies/deleteCompany.ts が実装されている
- [ ] 企業データと関連予定を一括削除する（Batch Write）
- [ ] 削除された予定数を返す

---

### updateEvent & deleteEvent Function（優先度: 中）
**概要**: 予定更新・削除API の実装
**作業時間**: 0.5日
**実装タイミング**: Issue #17 の後

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/events/updateEvent.ts が実装されている
- [ ] functions/src/handlers/events/deleteEvent.ts が実装されている
- [ ] 予定更新時、Googleカレンダーも更新する
- [ ] 予定削除時、企業統計を更新する

---

### retryCalendarSync (Firestore Trigger)（優先度: 低）
**概要**: カレンダー同期失敗時の自動リトライ
**作業時間**: 0.5日
**実装タイミング**: フェーズ4以降

**受け入れ基準（AC）**:
- [ ] functions/src/handlers/calendar/retryCalendarSync.ts が実装されている
- [ ] Firestore Trigger で googleCalendar.syncStatus が 'failed' になった際に発火
- [ ] 5分後、30分後、1時間後にリトライ
- [ ] 3回失敗したら諦める

---

## 要確認事項

1. **Gemini API キーの取得方法**: 開発者が各自 Gemini API キーを取得する必要があるか、共有キーを使用するか
2. **Google Calendar OAuth 認証フロー**: OAuth 2.0 のリダイレクトURIをどこに設定するか（ローカル: http://localhost:3000/callback など）
3. **テスト実装の優先度**: Issue #1〜#25 にはテストが含まれていないが、v2.0でテスト実装を開始する認識で良いか
4. **Firebase Hosting へのデプロイ**: フェーズ5として「デプロイ・CI/CD」を追加すべきか
5. **再分析Function（reanalyzeCompany）とdeleteCompany Functionの優先度**: MVP に含めるか、フェーズ4以降にするか
6. **retryCalendarSync（Firestore Trigger）の実装タイミング**: Issue #14 と並行して実装すべきか、フェーズ4で実装すべきか

---

## 作業時間見積もり

| フェーズ | 作業時間 |
|---------|---------|
| フェーズ0: Walking Skeleton | 3日 |
| フェーズ1: 企業管理MVP | 6日 |
| フェーズ2: 予定管理MVP | 6日 |
| フェーズ3: 傾向分析MVP | 3日 |
| フェーズ4: 堅牢化・UX向上 | 3.5日 |
| **合計** | **21.5日** |

---

## 次のアクション

1. **環境構築**: Issue #1〜#5 を実施
2. **企業管理実装**: Issue #6〜#11 を実施
3. **予定管理実装**: Issue #12〜#17 を実施
4. **傾向分析実装**: Issue #18〜#20 を実施
5. **UX向上**: Issue #21〜#25 を実施
6. **追加機能**: reanalyzeCompany, deleteCompany, updateEvent, deleteEvent を実装
7. **テスト**: ユニットテスト、統合テストを実装
8. **デプロイ**: Firebase Hosting にデプロイ

---

このドキュメントは、Job Mete v1.5 の実装計画を網羅しています。各Issueは半日〜1日で完了する粒度に設計されており、依存関係が明確化されているため、順次実装を進めることができます。
