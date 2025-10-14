import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/services/firebase'; // Firebase初期化とEmulator接続
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

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

          {/* ルートパスは /dashboard にリダイレクト */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
