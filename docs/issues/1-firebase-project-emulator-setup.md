# Issue #1: Firebase プロジェクトとEmulator環境のセットアップ

## 背景 / 目的
Job Mete v1.5 のローカル開発環境を構築するため、Firebase プロジェクトの作成と Emulator 環境のセットアップを行います。これにより、本番環境に影響を与えずに開発・テストが可能になります。

- **依存**: -
- **ラベル**: `infra`, `setup`
- **作業時間**: 0.5日

---

## スコープ / 作業項目

### 1. Firebase プロジェクトの作成
- Firebase Console でプロジェクト作成
- プロジェクトID の設定
- Firestore, Authentication, Functions の有効化

### 2. Firebase CLI のインストールと設定
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 3. firebase.json の設定
- Emulator ポート設定
  - Firestore: 8080
  - Authentication: 9099
  - Functions: 5001
- Hosting 設定（public ディレクトリ）

### 4. .env.local の作成
- Firebase 設定値の記載
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

### 5. README.md の更新
- セットアップ手順の追加
- Emulator 起動コマンドの記載
- 環境変数の設定方法

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] Firebase プロジェクトが作成され、firebase.json が設定済み
- [ ] Firestore, Authentication, Functions の Emulator が起動可能
- [ ] .env.local に必要な環境変数（Firebase設定）が記載されている
- [ ] `firebase emulators:start` で全Emulatorが起動することを確認
- [ ] README.md にセットアップ手順が記載されている

---

## テスト観点

### 動作確認
- `firebase emulators:start` で以下が起動すること
  - Firestore Emulator (localhost:8080)
  - Authentication Emulator (localhost:9099)
  - Functions Emulator (localhost:5001)
  - Emulator UI (localhost:4000)

### 検証方法
```bash
# Emulator 起動
firebase emulators:start

# ブラウザで以下にアクセス
# http://localhost:4000 (Emulator UI)
```

---

## 実装参考

### firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### .env.local
```bash
# Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Gemini API (Functions用)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 要確認事項

- Gemini API キーの取得方法（開発者各自で取得するか、共有キーを使用するか）
- Google Calendar OAuth 認証のリダイレクトURI設定
