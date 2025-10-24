/**
 * 認証保護ルート
 * 未認証ユーザーをログインページにリダイレクトする
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 認証が必要なページを保護するコンポーネント
 *
 * @param children - 保護するページのコンポーネント
 * @returns 認証済みの場合は children、未認証の場合は /login にリダイレクト
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // ローディング中は読み込み画面を表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合は /login にリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 認証済みの場合は children を表示
  return <>{children}</>;
}
