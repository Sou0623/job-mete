import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/services/firebase'; // Firebase初期化とEmulator接続
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CompaniesPage from '@/pages/CompaniesPage';
import CompanyDetailPage from '@/pages/CompanyDetailPage';
import CompanyFormPage from '@/pages/CompanyFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ログインページ（認証不要） */}
          <Route path="/login" element={<LoginPage />} />

          {/* ダッシュボード（認証必須） */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 企業一覧（認証必須） */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompaniesPage />
              </ProtectedRoute>
            }
          />

          {/* 企業登録（認証必須） */}
          <Route
            path="/companies/new"
            element={
              <ProtectedRoute>
                <CompanyFormPage />
              </ProtectedRoute>
            }
          />

          {/* 企業詳細（認証必須） */}
          <Route
            path="/companies/:companyId"
            element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ルートパスは /dashboard にリダイレクト */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
