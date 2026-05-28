import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Plaza from './pages/Plaza';
import Editor from './pages/Editor';
import MemeDetail from './pages/MemeDetail';
import Hotlist from './pages/Hotlist';
import Review from './pages/Review';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/auth';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen grid-bg">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Plaza />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/meme/:id" element={<MemeDetail />} />
        <Route path="/hotlist" element={<Hotlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/review"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Review />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;
