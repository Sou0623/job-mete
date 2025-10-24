# 💼 Job Mete（ジョブメイト）

就職活動における「企業分析」と「予定管理」を一元化した、学生向け支援Webアプリケーション

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 目次

- [プロジェクト概要](#-プロジェクト概要)
- [主要機能](#-主要機能)
- [技術スタック](#-技術スタック)
- [アーキテクチャ](#-アーキテクチャ)
- [セキュリティ](#-セキュリティ)
- [テスト](#-テスト)
- [開発環境セットアップ](#-開発環境セットアップ)
- [ライセンス](#-ライセンス)

---

## 🎯 プロジェクト概要

### 背景と課題

就職活動では、以下のような課題があります：

- 📊 **複数企業の情報管理が煩雑** - 企業ごとの特徴や分析結果が散在
- 📅 **面接スケジュールの管理が大変** - カレンダーアプリと就活メモが別々
- 🤔 **自分の志望傾向が不明確** - 登録企業から傾向を分析する機能がない

### 解決策

Job Meteは、これらの課題を解決する統合プラットフォームです：

✅ **AI企業分析** - Gemini APIで企業情報を自動分析・構造化
✅ **スケジュール管理** - Googleカレンダーとの自動連携
✅ **志望傾向分析** - 登録企業から共通点を抽出・可視化

### 技術的な特徴

- **型安全性**: TypeScript + 厳格な型定義で堅牢性を確保
- **セキュリティ**: XSS、プロンプトインジェクション対策を実装
- **テスト**: ユニットテスト、コンポーネントテスト、E2Eテスト完備
- **パフォーマンス**: React.memo、useMemo、コード分割で最適化
- **モダンUI**: Tailwind CSS + レスポンシブデザイン

---

### 主要画面

- **ダッシュボード**: 企業数、予定数、最近の活動を一覧表示
- **企業一覧**: 登録企業をカード形式で表示、検索・フィルタリング機能
- **企業詳細**: AI分析結果、企業情報、関連予定を表示
- **予定管理**: カレンダービュー、予定の追加・編集・削除
- **傾向分析**: 業界分布、キーワードクラウド、AIサマリー

---

## ✨ 主要機能

### 1. 企業管理

- 📝 **企業登録**: 企業名を入力するだけで自動分析
- 🔍 **重複チェック**: 表記ゆれを吸収（株式会社の有無など）
- 🤖 **AI分析**: Gemini APIで最新情報を取得・構造化
- 📊 **詳細表示**: 業界、特徴、求めるスキルなどを可視化
- 🔄 **再分析**: 30日経過で最新情報に更新推奨

### 2. 予定管理

- 📅 **予定登録**: 面接・説明会などのスケジュール管理
- 🗓️ **カレンダー連携**: Google Calendarと自動同期
- ✏️ **結果記録**: 面接後に結果（通過/不合格）を記録
- 🔔 **リマインダー**: 1時間前、1日前に自動通知

### 3. 傾向分析

- 📈 **業界分析**: 登録企業の業界分布を円グラフで可視化
- 🏷️ **キーワード抽出**: 共通するキーワードをタグクラウド表示
- 🤖 **AIサマリー**: Geminiが志望傾向を200文字で要約
- 💡 **推奨スキル**: 志望企業に必要なスキルを提案

---

## 🛠️ 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|-----|-----------|------|
| [React](https://react.dev/) | 19.x | UIフレームワーク |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.x | 型安全性 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | スタイリング |
| [React Router](https://reactrouter.com/) | 7.x | ルーティング |
| [Vite](https://vitejs.dev/) | 7.x | ビルドツール |

### バックエンド

| 技術 | 用途 |
|-----|------|
| [Firebase Authentication](https://firebase.google.com/docs/auth) | Google認証 |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | NoSQLデータベース |
| [Cloud Functions](https://firebase.google.com/docs/functions) | サーバーレス関数 |
| [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) | ローカル開発環境 |

### 外部API

| API | 用途 |
|-----|------|
| [Gemini API](https://ai.google.dev/docs) | 企業分析・傾向分析 |
| [Google Calendar API](https://developers.google.com/calendar) | カレンダー連携 |

### テスト・品質管理

| ツール | 用途 |
|-------|------|
| [Vitest](https://vitest.dev/) | ユニットテスト |
| [React Testing Library](https://testing-library.com/react) | コンポーネントテスト |
| [Playwright](https://playwright.dev/) | E2Eテスト |
| [ESLint](https://eslint.org/) | コード品質 |
| [TypeScript](https://www.typescriptlang.org/) | 型チェック |

---

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────────────────────┐
│                     ユーザー（学生）                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              React SPA (TypeScript + Vite)               │
│  ┌─────────────┬──────────────┬─────────────────────┐   │
│  │ Components  │    Hooks     │  Utils & Services   │   │
│  │  (UI Layer) │ (Logic Layer)│  (Business Logic)   │   │
│  └─────────────┴──────────────┴─────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase (BaaS)                       │
│  ┌──────────────┬──────────────┬──────────────────┐     │
│  │ Authenticati │  Firestore   │ Cloud Functions  │     │
│  │   on         │  (Database)  │  (Serverless)    │     │
│  └──────────────┴──────────────┴──────────────────┘     │
└────────────┬─────────────────────────┬──────────────────┘
             │                         │
             ▼                         ▼
  ┌──────────────────┐      ┌──────────────────┐
  │   Google         │      │   Gemini API     │
  │   Calendar API   │      │   (AI Analysis)  │
  └──────────────────┘      └──────────────────┘
```

### データフロー

1. **認証**: Firebase Authentication（Google OAuth）
2. **企業登録**: Firestore → Cloud Functions → Gemini API
3. **予定管理**: Firestore ⇄ Google Calendar API
4. **傾向分析**: Firestore → Cloud Functions → Gemini API

---

## 🔒 セキュリティ

セキュリティを重視した実装を行っています。詳細は [SECURITY.md](SECURITY.md) を参照してください。

### 実装されているセキュリティ対策

#### 1. 入力バリデーション

```typescript
// 文字数制限
INPUT_LIMITS = {
  COMPANY_NAME: 100,
  EVENT_TITLE: 100,
  MEMO: 1000,
  PASSWORD_MIN: 8,
}

// 危険なパターンの検出
- <script>タグ、<iframe>タグ
- javascript:プロトコル
- イベントハンドラ（onclick=, onerror=）
- eval()関数
```

#### 2. プロンプトインジェクション対策

```typescript
// 検出パターン
- "ignore previous instructions"
- "disregard all prompts"
- "system:", "assistant:", "user:"
- [INST], [/INST]
```

#### 3. サニタイゼーション

```typescript
// 入力サニタイゼーション処理
- HTMLタグの除去
- 制御文字の除去
- 連続する空白の正規化
```

#### 4. 環境変数管理

```bash
# APIキーは環境変数で管理
.env.local        # Gitに含まれない
.env.example      # サンプルファイル（Gitに含まれる）
```

#### 5. Firebase Security Rules

```javascript
// Firestoreセキュリティルール
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 テスト

### テストカバレッジ

- **ユニットテスト**: 30テスト（utils関数）
- **コンポーネントテスト**: 28テスト（React components）
- **E2Eテスト**: Playwright設定完了

### テスト実行

```bash
# ユニットテスト + コンポーネントテスト
npm test

# テストカバレッジ
npm run test:coverage

# E2Eテスト
npm run test:e2e

# E2EテストUI mode
npm run test:e2e:ui
```

### テスト結果

```
Test Files  4 passed (4)
Tests       58 passed (58)
Duration    3.17s
```

### テスト戦略

1. **ユニットテスト**: ビジネスロジック、バリデーション関数
2. **コンポーネントテスト**: UI コンポーネント、ユーザーインタラクション
3. **E2Eテスト**: 実際のユーザーフロー（ログイン、企業登録等）

---

## 🚀 開発環境セットアップ

### 前提条件

- Node.js: v18.0.0 以上
- npm: v9.0.0 以上
- Git: v2.0.0 以上

### セットアップ手順

#### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/job-mete.git
cd job-mete
```

#### 2. 依存パッケージのインストール

```bash
# クライアント
npm install

# Functions
cd functions
npm install
cd ..
```

#### 3. 環境変数の設定

```bash
# .env.example をコピー
cp .env.example .env.local

# .env.local を編集してAPIキーを設定
# - Firebase API Key
# - Gemini API Key
# - Google Calendar API Key (オプション)
```

詳細な環境変数の取得方法は `.env.example` ファイル内のコメントを参照してください。

#### 4. 開発サーバーの起動

```bash
# ターミナル1: Firebase Emulators
firebase emulators:start

# ターミナル2: Functions自動ビルド
cd functions && npm run build -- --watch

# ターミナル3: React開発サーバー
npm run dev
```

ブラウザで `http://localhost:5173` を開く

---

## 📁 プロジェクト構造

```
job-mete/
├── client/src/
│   ├── components/      # Reactコンポーネント
│   │   ├── common/      # 汎用コンポーネント
│   │   ├── layout/      # レイアウト
│   │   ├── companies/   # 企業関連
│   │   ├── events/      # 予定関連
│   │   └── trends/      # 傾向分析
│   ├── pages/           # ページコンポーネント
│   ├── hooks/           # カスタムHooks
│   ├── utils/           # ユーティリティ関数
│   │   ├── validation.ts      # バリデーション
│   │   ├── dateFormatter.ts   # 日付フォーマット
│   │   └── normalizeCompanyName.ts
│   ├── services/        # 外部サービス連携
│   └── types/           # TypeScript型定義
├── functions/           # Firebase Functions
│   ├── src/handlers/    # APIハンドラー
│   ├── src/services/    # サービスレイヤー
│   └── src/prompts/     # Geminiプロンプト
├── e2e/                 # E2Eテスト
├── .env.example         # 環境変数サンプル
├── .gitignore           # Git除外設定
├── SECURITY.md          # セキュリティガイド
└── README.md            # このファイル
```

---

## 🎨 コーディング規約

### 重要なルール

- ✅ **Tailwind CSSのみ使用** - カスタムCSS禁止
- ✅ **TypeScript型定義必須** - `any`型使用禁止
- ✅ **Enum禁止** - Union Typeを使用
- ✅ **関数コンポーネント** - Arrow関数ではなく関数宣言
- ✅ **入力バリデーション必須** - 全てのユーザー入力をチェック

### コミットメッセージ

Conventional Commits形式:

```bash
feat: 新機能
fix: バグ修正
docs: ドキュメント
test: テスト追加・修正
refactor: リファクタリング
```

---

## 🌟 技術的ハイライト

### 1. 型安全性の徹底

```typescript
// ✅ 厳格な型定義
interface Company {
  id: string;
  companyName: string;
  normalizedName: string;
  analysisMetadata: {
    status: 'pending' | 'completed' | 'failed';
    lastAnalyzedAt: string;
  };
}

// ❌ any型は使用禁止
const data: any = fetchData(); // 絶対NG
```

### 2. セキュアな入力処理

```typescript
// バリデーション + サニタイゼーション
const result = validateCompanyName(userInput);
if (!result.valid) {
  setError(result.error);
  return;
}
const sanitized = result.sanitized;
```

### 3. パフォーマンス最適化

```typescript
// React.memo
const CompanyCard = memo(function CompanyCard({ company }: Props) {
  return <div>{company.companyName}</div>;
});

// useMemo
const sortedCompanies = useMemo(() => {
  return [...companies].sort((a, b) => ...);
}, [companies]);

// React.lazy
const TrendsPage = lazy(() => import('@/pages/TrendsPage'));
```

---

## 📜 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

---

## 👨‍💻 作成者

- GitHub: [@Sou0623](https://github.com/Sou0623)

---

## 🙏 謝辞

- [Firebase](https://firebase.google.com/) - バックエンドインフラ
- [Gemini API](https://ai.google.dev/) - AI分析機能
- [Tailwind CSS](https://tailwindcss.com/) - スタイリングフレームワーク
- [React](https://react.dev/) - UIフレームワーク

---

**Made with ❤️ for Job Seekers**

プロジェクトに⭐️をつけていただけると励みになります！
