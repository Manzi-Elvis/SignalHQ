import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { IncidentListPage } from './pages/IncidentListPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { Role } from './types';

// Logged-in visitors skip the marketing page and go straight to their
// incident list; logged-out visitors see the landing page as the entry
// point instead of being bounced straight to /login.
function Root() {
  const { user } = useAuth();
  return user ? <Navigate to="/incidents" replace /> : <LandingPage />;
}

function AppShell() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {user && <NavBar />}
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute>
              <IncidentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}