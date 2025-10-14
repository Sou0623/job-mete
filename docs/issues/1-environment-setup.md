# Issue #1: 環境変数・Tailwind CSS・React Router セットアップ

## 背景 / 目的
Job Mete v1.5 の開発を開始するため、環境変数の設定、Tailwind CSS のセットアップ、React Router の導入を行います。既に Firebase プロジェクトと Emulator は設定済みなので、これらの追加セットアップを実施します。

- **依存**: -
- **ラベル**: `infra`, `setup`, `frontend`
- **作業時間**: 0.5日

---

## スコープ / 作業項目

### 1. 環境変数の設定

#### 1-1. `.env.local.template` の作成
```bash
# client/ ディレクトリに作成
touch client/.env.local.template
```

テンプレート内容:
```bash
# Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### 1-2. `.env.local` の作成と設定
```bash
# client/ ディレクトリに作成
cd client
cp .env.local.template .env.local

# Firebase Console から実際の値を取得して .env.local に記入
```

#### 1-3. `.gitignore` の確認
```bash
# client/.gitignore に以下が含まれていることを確認
.env.local
.env*.local
```

#### 1-4. Functions の環境変数設定
```bash
# functions/ ディレクトリに作成
cd functions
touch .env

# .env に記入
GEMINI_API_KEY=your-gemini-api-key
```

---

### 2. Tailwind CSS のセットアップ

#### 2-1. パッケージのインストール
```bash
cd client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2-2. `tailwind.config.js` の設定
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### 2-3. `src/index.css` の更新
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 2-4. 動作確認
App.tsx を一時的に変更して Tailwind が効いているか確認:
```tsx
// src/App.tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600">Job Mete</h1>
        <p className="text-gray-600 mt-2">Tailwind CSS is working!</p>
      </div>
    </div>
  );
}
```

---

### 3. React Router のセットアップ

#### 3-1. パッケージのインストール
```bash
cd client
npm install react-router-dom
npm install -D @types/react-router-dom
```

#### 3-2. 基本的なルーティング設定
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div>Login Page (placeholder)</div>} />
        <Route path="/dashboard" element={<div>Dashboard (placeholder)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 3-3. 動作確認
- http://localhost:5173/ → /login にリダイレクト
- http://localhost:5173/login → Login Page 表示
- http://localhost:5173/dashboard → Dashboard 表示

---

### 4. パスエイリアスの設定

#### 4-1. `vite.config.ts` の設定
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### 4-2. `tsconfig.app.json` の設定
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 5. README.md の更新

#### 5-1. 環境変数セクションの追加
```markdown
## 🔐 環境変数の設定

### 1. `.env.local` ファイルの作成

\`\`\`bash
cd client
cp .env.local.template .env.local
\`\`\`

### 2. Firebase 設定の取得

Firebase Console → プロジェクト設定 → 全般 → マイアプリ → SDK設定から以下を取得:

- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

### 3. `.env.local` に記入

\`\`\`bash
VITE_FIREBASE_API_KEY=AIzaSy...（実際の値）
VITE_FIREBASE_AUTH_DOMAIN=job-mete.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=job-mete
VITE_FIREBASE_STORAGE_BUCKET=job-mete.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
\`\`\`

### 4. Functions の環境変数

\`\`\`bash
cd functions
touch .env
\`\`\`

\`\`\`.env\`\`\` に記入:
\`\`\`bash
GEMINI_API_KEY=your-gemini-api-key
\`\`\`

**Gemini API キーの取得**: https://aistudio.google.com/app/apikey
```

#### 5-2. Tailwind CSS セクションの確認
README.md に Tailwind CSS の記載があることを確認し、必要に応じて更新。

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] `client/.env.local.template` が作成され、必要な環境変数が列挙されている
- [ ] `client/.env.local` が作成され、Firebase 設定が記入されている（実際の値）
- [ ] `functions/.env` が作成され、GEMINI_API_KEY が設定されている
- [ ] Tailwind CSS がインストールされ、`tailwind.config.js` が正しく設定されている
- [ ] `src/index.css` に Tailwind ディレクティブが追加されている
- [ ] React Router がインストールされ、基本的なルーティングが動作する
- [ ] パスエイリアス（`@/`）が設定され、`import from '@/types'` が動作する
- [ ] README.md に環境変数の設定手順が追加されている

---

## テスト観点

### 1. 環境変数の確認
```bash
# client/ で開発サーバー起動
npm run dev

# ブラウザコンソールで以下を確認
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
# → "job-mete" が表示される
```

### 2. Tailwind CSS の確認
```bash
# npm run dev で開発サーバー起動
# ブラウザで http://localhost:5173 にアクセス

# 以下のクラスが効いているか確認:
# - bg-gray-100
# - text-blue-600
# - rounded-lg
# - shadow-md
```

### 3. React Router の確認
```bash
# http://localhost:5173/ にアクセス → /login にリダイレクト
# http://localhost:5173/login → Login Page 表示
# http://localhost:5173/dashboard → Dashboard 表示
```

### 4. パスエイリアスの確認
```tsx
// src/App.tsx で試す
import { Test } from '@/components/Test'; // エラーが出ないこと
```

---

## 実装参考

### client/.env.local.template
```bash
# Firebase Config (Replace with your actual values)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // カスタムカラーなどを追加する場合はここに記述
    },
  },
  plugins: [],
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* グローバルスタイルはここに追加（最小限に） */
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
```

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### src/App.tsx（動作確認用）
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h1 className="text-3xl font-bold text-blue-600">Job Mete</h1>
                  <p className="text-gray-600 mt-2">Login Page (placeholder)</p>
                </div>
              </div>
            }
          />

          <Route
            path="/dashboard"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h1 className="text-3xl font-bold text-green-600">Dashboard</h1>
                  <p className="text-gray-600 mt-2">Dashboard (placeholder)</p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

---

## 注意事項

### 環境変数の取り扱い
- `.env.local` は**絶対に Git にコミットしない**
- `.env.local.template` のみコミットする
- チーム開発時は、各自で `.env.local` を作成する

### Tailwind CSS のベストプラクティス
- カスタムCSSは**原則として書かない**
- 必要な場合は `tailwind.config.js` の `extend` で追加
- グローバルスタイルは最小限に

### React Router の注意点
- Vite のデフォルトポートは `5173`（Create React App の `3000` ではない）
- `BrowserRouter` を使用（HashRouter は使わない）
- ルート `/` は `/login` にリダイレクト

---

## 参考資料

- Tailwind CSS ドキュメント: https://tailwindcss.com/docs/installation/framework-guides#vite
- React Router ドキュメント: https://reactrouter.com/en/main/start/tutorial
- Vite 環境変数: https://vitejs.dev/guide/env-and-mode.html
- `CLAUDE.md` - コーディング規約（Tailwind Only）
