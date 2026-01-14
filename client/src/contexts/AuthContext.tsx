/**
 * 認証コンテキスト
 * Firebase Authentication を使ったユーザー認証状態の管理
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * 認証コンテキストの型定義
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileSetupCompleted: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  markProfileSetupCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダーコンポーネント
 *
 * @param children - 子コンポーネント
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSetupCompleted, setProfileSetupCompleted] = useState(false);

  useEffect(() => {
    // Firebase Authentication の認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // プロフィール設定完了フラグを確認
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        setProfileSetupCompleted(userDoc.exists() && userDoc.data()?.profileSetupCompleted === true);
      } else {
        setProfileSetupCompleted(false);
      }

      setLoading(false);
    });

    // クリーンアップ関数
    return unsubscribe;
  }, []);

  /**
   * Google ログイン
   */
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  /**
   * ログアウト
   */
  const logout = async () => {
    await signOut(auth);
  };

  /**
   * ユーザープロフィールを更新
   */
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) {
      throw new Error('ログインしていません');
    }

    await updateProfile(auth.currentUser, {
      displayName,
      ...(photoURL && { photoURL }),
    });

    // ユーザー情報を再取得して状態を更新
    setUser({ ...auth.currentUser });
  };

  /**
   * プロフィール設定完了フラグを保存
   */
  const markProfileSetupCompleted = async () => {
    if (!auth.currentUser) {
      throw new Error('ログインしていません');
    }

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userDocRef, {
      profileSetupCompleted: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    setProfileSetupCompleted(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileSetupCompleted, login, logout, updateUserProfile, markProfileSetupCompleted }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するカスタムフック
 *
 * @returns 認証コンテキスト
 * @throws AuthProvider の外で使用された場合にエラー
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
