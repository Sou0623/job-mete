# Issue #5: 認証機能（AuthContext, ログイン画面）の実装

## 背景 / 目的
Firebase Authentication を使った Google ログイン機能を実装し、アプリ全体で認証状態を管理できるようにします。これにより、ユーザーごとにデータを分離し、セキュアなアプリケーションを実現します。

- **依存**: #2, #3, #4
- **ラベル**: `frontend`, `auth`
- **作業時間**: 1日

---

## スコープ / 作業項目

### 1. src/contexts/AuthContext.tsx の実装
- `AuthProvider` コンポーネント
- `useAuth` カスタムフック
- `onAuthStateChanged` で認証状態監視
- `login()`, `logout()` メソッド

### 2. src/pages/LoginPage.tsx の実装
- Google ログインボタン
- ログイン成功後のリダイレクト（/dashboard）
- ローディング状態の表示

### 3. ProtectedRoute コンポーネントの実装
- 認証チェック
- 未認証時は /login にリダイレクト
- ローディング中の表示

### 4. App.tsx でのルーティング設定
- React Router の設定
- ProtectedRoute でページを保護
- 認証不要ページ（/login）と認証必須ページの分離

### 5. src/components/layout/Header.tsx の実装
- ユーザー情報表示（名前、アイコン）
- ログアウトボタン

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] src/contexts/AuthContext.tsx が実装され、useAuth() で認証状態を取得できる
- [ ] src/pages/LoginPage.tsx が実装され、Google ログインボタンが表示される
- [ ] ログイン成功後、/dashboard にリダイレクトされる
- [ ] ProtectedRoute コンポーネントで認証チェックが実装されている
- [ ] 未認証時は /login にリダイレクトされる

---

## テスト観点

### 認証フロー
- **正常系**:
  - Google ログインボタンをクリックすると、Google 認証画面が表示される
  - ログイン成功後、/dashboard にリダイレクトされる
  - ヘッダーにユーザー名とアイコンが表示される
  - ログアウトボタンをクリックすると、/login にリダイレクトされる

- **異常系**:
  - 未認証時に /dashboard にアクセスすると、/login にリダイレクトされる
  - ログイン失敗時、エラーメッセージが表示される

### 検証方法
```bash
# React 開発サーバー起動
npm start

# ブラウザで http://localhost:3000 にアクセス
# /login にリダイレクトされることを確認
# Google ログインボタンをクリックして認証
# /dashboard にリダイレクトされることを確認
```

---

## 実装参考

### src/contexts/AuthContext.tsx
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '@/services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### src/pages/LoginPage.tsx
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('ログインエラー:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold text-center mb-2">Job Mete</h1>
        <p className="text-center text-gray-600 mb-8">就活を効率化しよう</p>

        <button
          onClick={handleLogin}
          className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google ロゴ SVG */}
          </svg>
          Googleでログイン
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          ※ Googleアカウントが必要です
        </p>
      </div>
    </div>
  );
}
```

### src/components/common/ProtectedRoute.tsx
```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### src/App.tsx
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### src/components/layout/Header.tsx
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-xl font-bold">Job Mete</h1>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'ユーザー'}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">{user.displayName}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

## 注意事項

### Firebase Authentication Emulator
- Emulator では実際の Google 認証は使えない
- Emulator UI (http://localhost:4000/auth) からテストユーザーを作成可能
- または、`signInWithEmailAndPassword` でテスト用のメールアドレスを使用

### 本番環境への移行
- Google Cloud Console で OAuth 2.0 クライアントIDを作成
- Firebase Console で Google ログインを有効化
- 承認済みドメインにデプロイ先を追加

---

## 参考資料

- `docs/job_mete_architecture.txt` - 認証・認可フロー
- `docs/job_mete_sitemap.txt` - ログイン画面の設計
- Firebase Authentication ドキュメント: https://firebase.google.com/docs/auth
