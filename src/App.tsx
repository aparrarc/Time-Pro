import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import {
  DashboardPage,
  LoginPage,
  HistoryPage,
  AbsencesPage,
  ReportsPage,
  SettingsPage,
  UsersPage,
  UserCreatePage,
  PayrollPage,
  HRInboxPage,
  CommitteePage,
  DirectoryPage,
  PrivacyPage
} from './pages';
import { useAppStore } from './store/appStore';
import './index.css';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore(state => state.user);
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { isDarkMode, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — Core */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/absences" element={
            <ProtectedRoute>
              <AbsencesPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Protected routes — New Modules */}
          <Route path="/payroll" element={
            <ProtectedRoute>
              <PayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/hr-inbox" element={
            <ProtectedRoute>
              <HRInboxPage />
            </ProtectedRoute>
          } />
          <Route path="/committee" element={
            <ProtectedRoute>
              <CommitteePage />
            </ProtectedRoute>
          } />
          <Route path="/directory" element={
            <ProtectedRoute>
              <DirectoryPage />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={
            <ProtectedRoute>
              <PrivacyPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/users" element={
            <ProtectedRoute>
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/users/create" element={
            <ProtectedRoute>
              <AdminRoute>
                <UserCreatePage />
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
