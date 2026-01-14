/**
 * 認証保護ルート
 * 未認証ユーザーをログインページにリダイレクトする
 * プロフィール未設定の場合はプロフィール設定ページにリダイレクトする
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfileSetup?: boolean; // プロフィール設定を必須とするか（デフォルト: true）
}

/**
 * 認証が必要なページを保護するコンポーネント
 *
 * @param children - 保護するページのコンポーネント
 * @param requireProfileSetup - プロフィール設定を必須とするか（デフォルト: true）
 * @returns 認証済みの場合は children、未認証の場合は /login にリダイレクト
 */
export default function ProtectedRoute({ children, requireProfileSetup = true }: ProtectedRouteProps) {
  const { user, loading, profileSetupCompleted } = useAuth();
  const location = useLocation();

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

  // プロフィール設定が必須かつ未完了の場合は /profile-setup にリダイレクト
  // ただし、すでに /profile-setup にいる場合は無限ループを防ぐためリダイレクトしない
  if (requireProfileSetup && !profileSetupCompleted && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // プロフィール設定ページにいるが、すでにプロフィールが設定されている場合はダッシュボードにリダイレクト
  if (!requireProfileSetup && profileSetupCompleted && location.pathname === '/profile-setup') {
    return <Navigate to="/dashboard" replace />;
  }

  // 認証済みの場合は children を表示
  return <>{children}</>;
}
