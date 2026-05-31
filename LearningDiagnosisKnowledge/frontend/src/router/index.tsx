import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../stores/useAuth';
import { Spin } from 'antd';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginPage() {
  return <div>Login Page</div>;
}

function KnowledgePage() {
  return <div>Knowledge Graph Page</div>;
}

function DiagnosisPage() {
  return <div>Diagnosis Report Page</div>;
}

function RecommendationPage() {
  return <div>Recommendation Page</div>;
}

function ClassPage() {
  return <div>Class Page</div>;
}

function ExportPage() {
  return <div>Export Page</div>;
}

function ShareReportPage() {
  return <div>Share Report Page</div>;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/knowledge" replace />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="recommendation" element={<RecommendationPage />} />
        <Route path="class" element={<ClassPage />} />
        <Route path="export" element={<ExportPage />} />
      </Route>
      <Route path="/share/:token" element={<ShareReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
