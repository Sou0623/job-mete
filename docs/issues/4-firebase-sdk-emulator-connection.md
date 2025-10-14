# Issue #4: Firebase SDK とEmulator接続の実装

## 背景 / 目的
React アプリケーションから Firebase を使用するため、Firebase SDK の初期化と Emulator 接続を実装します。開発環境では Emulator に接続し、本番環境では実際の Firebase に接続します。

- **依存**: #1
- **ラベル**: `frontend`, `infra`
- **作業時間**: 0.5日

---

## スコープ / 作業項目

### 1. Firebase SDK のインストール
```bash
npm install firebase
```

### 2. src/services/firebase.ts の実装
- Firebase App の初期化
- Firestore, Authentication, Functions の取得
- 環境変数からの設定読み込み
- 開発環境での Emulator 接続

### 3. Emulator 接続の実装
- `import.meta.env.DEV` で開発環境判定
- `connectFirestoreEmulator`
- `connectAuthEmulator`
- `connectFunctionsEmulator`

### 4. エクスポート
- `db`, `auth`, `functions` をエクスポート
- 他のファイルから `import { db, auth, functions } from '@/services/firebase'` で使用可能に

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] src/services/firebase.ts に Firebase SDK 初期化コードが実装されている
- [ ] 開発環境（NODE_ENV=development）では Emulator に接続される
- [ ] Firestore, Authentication, Functions の接続が確認できる
- [ ] 環境変数から Firebase 設定を読み込んでいる

---

## テスト観点

### 接続確認
- **開発環境**:
  - Emulator に接続されていること
  - Firestore Emulator (localhost:8080) に接続
  - Authentication Emulator (localhost:9099) に接続
  - Functions Emulator (localhost:5001) に接続

- **本番環境**:
  - 実際の Firebase に接続されること（将来）

### 検証方法
```bash
# React 開発サーバー起動
npm start

# ブラウザコンソールで確認
# Emulator に接続されている場合、以下のようなログが表示される
# "Firestore Emulator connected to localhost:8080"
```

---

## 実装参考

### src/services/firebase.ts
```typescript
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

// Firebase App 初期化
const app = initializeApp(firebaseConfig);

// サービス取得
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Emulator接続（開発環境のみ）
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);

  console.log('🔧 Firebase Emulator connected');
}

export { db, auth, functions };
```

### 使用例
```typescript
// 他のファイルから使用
import { db, auth, functions } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Firestore 操作
const companiesRef = collection(db, 'users', userId, 'companies');
const snapshot = await getDocs(companiesRef);

// Authentication 操作
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);

// Functions 呼び出し
import { httpsCallable } from 'firebase/functions';
const createCompany = httpsCallable(functions, 'createCompany');
await createCompany({ companyName: '株式会社コドモン' });
```

---

## 注意事項

### Emulator 接続の注意点
- Emulator 接続は**アプリ起動時に1度だけ**実行する
- 複数回実行するとエラーになる
- `import.meta.env.DEV` は Vite の環境変数（開発環境で `true`）

### 環境変数の設定
- `.env.local` に Firebase 設定を記載
- `.env.local` は `.gitignore` に追加（Git管理しない）
- Vite では `VITE_` プレフィックスが必要

---

## 参考資料

- `docs/job_mete_architecture.txt` - Firebase SDK 統合
- Firebase SDK ドキュメント: https://firebase.google.com/docs/web/setup
