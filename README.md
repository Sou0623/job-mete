# 💼 Job Mete（ジョブメイト）

就職活動における「企業分析」と「予定管理」を一元化した、学生向け支援Webアプリケーション

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8)](https://tailwindcss.com/)

---

## 📋 目次

- [プロジェクト概要](#-プロジェクト概要)
- [主要機能](#-主要機能)
- [技術スタック](#-技術スタック)
- [開発環境セットアップ](#-開発環境セットアップ)
- [ディレクトリ構造](#-ディレクトリ構造)
- [開発ガイド](#-開発ガイド)
- [設計ドキュメント](#-設計ドキュメント)
- [よくある質問](#-よくある質問)
- [ライセンス](#-ライセンス)

---

## 🎯 プロジェクト概要

### 背景

就職活動では、以下のような課題があります：

- 📊 **複数企業の情報管理が煩雑** - 企業ごとの特徴や分析結果が散在
- 📅 **面接スケジュールの管理が大変** - カレンダーアプリと就活メモが別々
- 🤔 **自分の志望傾向が不明確** - 登録企業から傾向を分析する機能がない

### 解決策

Job Meteは、これらの課題を解決する統合プラットフォームです：

✅ **企業分析の自動化** - Gemini APIで企業情報を自動分析  
✅ **予定管理の一元化** - Googleカレンダーと自動連携  
✅ **志望傾向の可視化** - 登録企業から共通点を抽出・分析

### 対象ユーザー

- 就職活動中の大学生・専門学生
- 複数企業の選考を並行して進めている学生
- 効率的に就活情報を整理したい学生

---

## ✨ 主要機能

### 1. 企業管理

- 📝 **企業登録** - 企業名を入力するだけで自動分析
- 🔍 **重複チェック** - 表記ゆれを吸収して重複を防止
- 📊 **企業分析** - Gemini APIで最新情報を取得・構造化
- 📝 **メモ機能** - 企業ごとに自由記述のメモを保存
- 🔄 **再分析** - 30日経過で最新情報に更新推奨

### 2. 予定管理

- 📅 **予定登録** - 面接・説明会などのスケジュール管理
- 🔗 **カレンダー連携** - Googleカレンダーと自動同期
- ✏️ **結果記録** - 面接後に結果（通過/不合格）を記録
- 🔔 **通知機能** - カレンダー経由で面接前に通知

### 3. 傾向分析

- 📈 **業界分析** - 登録企業の業界分布を円グラフで可視化
- 🏷️ **キーワード抽出** - 共通するキーワードをタグクラウド表示
- 🤖 **AIサマリー** - Geminiが志望傾向を200文字で要約
- 💡 **推奨スキル** - 志望企業に必要なスキルを提案

---

## 🛠️ 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|-----|-----------|------|
| [React](https://react.dev/) | 18.x | UIフレームワーク |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 型安全性 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | スタイリング |
| [React Router](https://reactrouter.com/) | 6.x | ルーティング |
| [Recharts](https://recharts.org/) | 2.x | グラフ表示 |

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

---

## 🚀 開発環境セットアップ

### 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: v18.0.0 以上
- **npm**: v9.0.0 以上
- **Git**: v2.0.0 以上

```bash
# バージョン確認
node --version  # v18.0.0以上
npm --version   # v9.0.0以上
git --version   # v2.0.0以上
```

---

### 📦 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/job-mete.git
cd job-mete
```

---

### 🔧 2. 依存パッケージのインストール

#### フロントエンド

```bash
# ルートディレクトリで実行
npm install
```

#### バックエンド（Functions）

```bash
cd functions
npm install
cd ..
```

---

### 🔑 3. Firebase プロジェクトのセットアップ

#### 3-1. Firebase CLIのインストール

```bash
npm install -g firebase-tools

# ログイン
firebase login
```

#### 3-2. Firebaseプロジェクトの作成

```bash
# Firebase Console（https://console.firebase.google.com/）でプロジェクト作成
# プロジェクト名: job-mete-dev（例）
```

#### 3-3. Firebase初期化

```bash
firebase init

# 選択する機能:
# ✅ Firestore
# ✅ Functions
# ✅ Emulators

# プロジェクト選択: 
# → Use an existing project
# → job-mete-dev（作成したプロジェクト）

# Functions言語:
# → TypeScript

# Emulators選択:
# ✅ Authentication Emulator
# ✅ Functions Emulator
# ✅ Firestore Emulator
```

---

### 🔐 4. 環境変数の設定

#### 4-1. クライアント側の環境変数設定

プロジェクトには環境変数のテンプレートファイルが用意されています。

```bash
# client/ ディレクトリに移動
cd client

# テンプレートファイルから .env.local を作成
cp .env.local.template .env.local
```

#### 4-2. Firebase設定の取得

Firebase Consoleから設定値を取得します：

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「job-mete」を選択
3. 左側メニューから ⚙️ **プロジェクトの設定** をクリック
4. **全般** タブで下にスクロール
5. **マイアプリ** セクションで Web アプリの **SDK の設定と構成** を確認
6. 表示される設定値を `.env.local` にコピー

#### 4-3. `.env.local` の編集

取得した値を `.env.local` に記入します：

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=job-mete.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=job-mete
VITE_FIREBASE_STORAGE_BUCKET=job-mete.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### 4-4. Functions側の環境変数設定

```bash
# functions/ ディレクトリに移動
cd ../functions

# テンプレートファイルから .env を作成
cp .env.template .env
```

#### 4-5. Gemini API キーの取得と設定

1. **Gemini API キーの取得:**
   - [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
   - **Create API Key** をクリック
   - 生成されたキーをコピー

2. **`functions/.env` に記入:**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 4-6. Google Calendar API の設定（後で実装）

Google Calendar連携は後のフェーズで実装します。以下は参考情報です：

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. **APIs & Services** → **Credentials** を選択
3. **OAuth 2.0 Client ID** を作成
4. 必要なスコープ: `https://www.googleapis.com/auth/calendar.events`

```bash
# functions/.env に追加（Calendar連携実装時）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 環境変数ファイルの確認

以下のファイルが作成されていることを確認してください：

```
job-mete/
├── client/
│   ├── .env.local.template    # ✅ Gitにコミット済み
│   └── .env.local              # ✅ 作成完了（.gitignoreで除外）
└── functions/
    ├── .env.template           # ✅ Gitにコミット済み
    └── .env                    # ✅ 作成完了（.gitignoreで除外）
```

⚠️ **重要:** `.env.local` と `.env` ファイルは機密情報を含むため、Gitにコミットしないでください（`.gitignore`で除外されています）。

---

### 🎨 5. Tailwind CSS と React Router のインストール

#### 5-1. npm キャッシュの修正（必要な場合のみ）

npm インストールでエラーが発生する場合、以下のコマンドで修正してください：

```bash
# npm キャッシュディレクトリの権限を修正
sudo chown -R $(whoami) "$(npm config get cache)"
```

#### 5-2. パッケージのインストール

```bash
# client/ ディレクトリに移動
cd client

# Tailwind CSS と React Router をインストール
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom
```

#### 5-3. 設定の確認

以下のファイルがすでに設定されています：

- `tailwind.config.js` - Tailwind CSS の設定
- `postcss.config.js` - PostCSS の設定
- `src/index.css` - Tailwind ディレクティブを含む
- `src/App.tsx` - React Router のセットアップ済み
- `vite.config.ts` - パスエイリアス（`@/`）の設定済み

インストールが完了すれば、すぐに開発を開始できます。

---

### 🚀 6. 開発サーバーの起動

#### ターミナル1: Firebase Emulators

```bash
firebase emulators:start
```

起動確認:
- Authentication Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Emulator UI: http://localhost:4000

#### ターミナル2: Functions自動ビルド

```bash
cd functions
npm run build -- --watch
```

#### ターミナル3: React開発サーバー

```bash
npm start
```

ブラウザで http://localhost:3000 を開く

---

### ✅ 7. 動作確認

1. **ログイン画面が表示されるか**
   - http://localhost:3000/login

2. **Google認証が動作するか**
   - Emulatorで自動的にテストアカウントが作成される

3. **Firestore接続確認**
   - Emulator UIで http://localhost:4000 を開く
   - Firestoreタブでデータが見えるか確認

---

## 📁 ディレクトリ構造

```
job-mete/
├── public/                          # 静的ファイル
│   ├── index.html
│   └── favicon.ico
│
├── src/                             # フロントエンドソースコード
│   ├── components/                  # Reactコンポーネント
│   │   ├── common/                  # 汎用コンポーネント
│   │   ├── layout/                  # レイアウト
│   │   ├── companies/               # 企業関連
│   │   ├── events/                  # 予定関連
│   │   └── trends/                  # 傾向分析
│   ├── pages/                       # ページコンポーネント
│   ├── hooks/                       # カスタムHooks
│   ├── contexts/                    # Reactコンテキスト
│   ├── services/                    # 外部サービス連携
│   ├── utils/                       # ユーティリティ関数
│   ├── types/                       # TypeScript型定義
│   ├── constants/                   # 定数
│   ├── App.tsx                      # アプリルート
│   └── index.tsx                    # エントリーポイント
│
├── functions/                       # Firebase Functions
│   ├── src/
│   │   ├── handlers/                # 各種ハンドラー
│   │   ├── services/                # サービスレイヤー
│   │   ├── utils/                   # ユーティリティ
│   │   ├── prompts/                 # Geminiプロンプト
│   │   ├── types/                   # 型定義
│   │   └── index.ts                 # エントリーポイント
│   └── package.json
│
├── docs/                            # 設計ドキュメント
│   ├── requirements.md              # 要件定義書
│   ├── architecture.md              # アーキテクチャ設計
│   ├── database.md                  # データベース設計
│   ├── api.md                       # API設計
│   ├── sitemap.md                   # サイトマップ設計
│   └── implementation-guide.md      # 実装ガイド
│
├── .env.local                       # 環境変数（Git非管理）
├── .gitignore
├── firebase.json                    # Firebase設定
├── firestore.rules                  # Firestoreセキュリティルール
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── CLAUDE.md                        # Claude Code用設定
└── README.md                        # このファイル
```

---

## 👨‍💻 開発ガイド

### コーディング規約

**必ず `docs/implementation-guide.md` を参照してください。**

重要なルール:
- ✅ **Tailwind CSSのみ使用** - カスタムCSSは書かない
- ✅ **TypeScript型定義必須** - `any`型は使用禁止
- ✅ **関数コンポーネント** - Arrow関数ではなく関数宣言
- ✅ **命名規則** - PascalCase（コンポーネント）、camelCase（その他）

### コミットメッセージ

Conventional Commits形式を使用:

```bash
# 形式
<type>: <subject>

# 例
feat: 企業一覧画面を実装
fix: カレンダー同期のバグを修正
docs: READMEにセットアップ手順を追加
refactor: 企業名正規化ロジックをリファクタリング
```

### ブランチ戦略

```
main (本番)
  └─ develop (開発)
       ├─ feature/company-list
       ├─ feature/event-form
       └─ bugfix/calendar-sync
```

---

## 📚 設計ドキュメント

プロジェクトの詳細な設計は `docs/` ディレクトリに格納されています：

| ドキュメント | 内容 |
|------------|------|
| [requirements.md](docs/requirements.md) | 要件定義書（機能要件、非機能要件） |
| [architecture.md](docs/architecture.md) | アーキテクチャ設計（システム構成、データフロー） |
| [database.md](docs/database.md) | データベース設計（スキーマ、インデックス） |
| [api.md](docs/api.md) | API設計（全エンドポイント仕様） |
| [sitemap.md](docs/sitemap.md) | サイトマップ設計（画面構成、遷移） |
| [implementation-guide.md](docs/implementation-guide.md) | 実装ガイド（コーディング規約） |

### 新規参加者へ

1. **まず読むべきドキュメント:**
   - `README.md`（このファイル）
   - `docs/requirements.md`
   - `docs/implementation-guide.md`

2. **実装前に参照すべきドキュメント:**
   - `docs/architecture.md`
   - `docs/database.md`
   - `docs/api.md`
   - `docs/sitemap.md`

---

## 🧪 テスト

### ユニットテスト（将来実装予定）

```bash
npm test
```

### E2Eテスト（将来実装予定）

```bash
npm run test:e2e
```

---

## 🐛 デバッグ

### Firebase Emulator UI

http://localhost:4000 で以下を確認:

- **Authentication**: 登録ユーザー一覧
- **Firestore**: データベースの中身
- **Functions**: ログ出力

### よくあるエラーと対処法

#### エラー1: `FirebaseError: Could not reach Cloud Firestore backend`

**原因:** Emulatorが起動していない

**対処法:**
```bash
firebase emulators:start
```

#### エラー2: Tailwind CSSが効かない

**原因:** `content`設定が正しくない

**対処法:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ← これを確認
  ],
}
```

#### エラー3: `Module not found: Can't resolve '@/types'`

**原因:** パスエイリアスが設定されていない

**対処法:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

---

## 📊 開発状況

### 現在のバージョン: v1.5（プロトタイプ）

| フェーズ | 状態 | 説明 |
|---------|------|------|
| P1: 環境構築 | ⏳ 準備中 | Firebase、React、Tailwind設定 |
| P2: 認証・UI基盤 | 📝 未着手 | Google認証、基本レイアウト |
| P3: 企業管理 | 📝 未着手 | 企業CRUD、重複チェック |
| P4: Gemini分析 | 📝 未着手 | 企業分析、再分析機能 |
| P5: 予定管理 | 📝 未着手 | 予定CRUD |
| P6: Calendar連携 | 📝 未着手 | Googleカレンダー同期 |
| P7: 傾向分析 | 📝 未着手 | 業界分析、キーワード抽出 |
| P8: テスト | 📝 未着手 | 統合テスト、バグ修正 |

---

## ❓ よくある質問

### Q1: 本番環境にデプロイするには？

**A:** v1.5はローカル開発のみです。本番デプロイはv2.0以降で対応予定。

### Q2: Gemini APIは無料で使える？

**A:** 無料枠があります（Flash 2.0: 1,500 RPD）。詳細は [Gemini API Pricing](https://ai.google.dev/pricing) を参照。

### Q3: Google Calendar APIの認証設定は？

**A:** Google Cloud Consoleで以下を設定:
1. Calendar APIを有効化
2. OAuth 2.0クライアントIDを作成
3. スコープ: `https://www.googleapis.com/auth/calendar.events`

### Q4: カスタムCSSを書きたい場合は？

**A:** 原則禁止です。Tailwind CSSのユーティリティクラスで対応してください。どうしても必要な場合は、`tailwind.config.js`の`extend`で追加。

### Q5: Claude Codeとは？

**A:** ターミナルからClaudeにコード生成を依頼できる機能です。`CLAUDE.md`を参照してプロジェクトルールに従ったコードを生成します。

---

## 🤝 コントリビューション

### 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: 素晴らしい機能を追加'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コードレビュー基準

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] Tailwind CSSのみ使用
- [ ] コミットメッセージがConventional Commits形式
- [ ] 設計ドキュメントに従っている

---

## 📞 サポート

### 問題が発生した場合

1. **既存のIssueを確認**: [GitHub Issues](https://github.com/your-username/job-mete/issues)
2. **新しいIssueを作成**: 問題の詳細を記載
3. **設計ドキュメントを確認**: `docs/`ディレクトリ

---

## 📜 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) を参照してください。

---

## 🙏 謝辞

- [Firebase](https://firebase.google.com/) - バックエンドインフラ
- [Gemini API](https://ai.google.dev/) - AI分析機能
- [Tailwind CSS](https://tailwindcss.com/) - スタイリングフレームワーク
- [React](https://react.dev/) - UIフレームワーク

---

## 🚀 今後の展望（v2.0以降）

- [ ] カレンダー双方向同期
- [ ] 面接対策チャット機能
- [ ] LINE通知連携
- [ ] 推薦企業レコメンド
- [ ] モバイルアプリ化（React Native）

---

**Made with ❤️ for Job Seekers**

プロジェクトに⭐️をつけていただけると励みになります！
>>>>>>> c7c10d0 (修正)
