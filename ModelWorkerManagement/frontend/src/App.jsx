import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrainingListPage from './pages/TrainingListPage';
import TrainingDetailPage from './pages/TrainingDetailPage';
import ForumPage from './pages/ForumPage';
import ForumDetailPage from './pages/ForumDetailPage';
import AnnouncementListPage from './pages/AnnouncementListPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyPostsPage from './pages/MyPostsPage';
import MyFavoritesPage from './pages/MyFavoritesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ArchiveManagementPage from './pages/admin/ArchiveManagementPage';
import ArchiveChangeManagementPage from './pages/admin/ArchiveChangeManagementPage';
import RewardPunishmentPage from './pages/admin/RewardPunishmentPage';
import TrainingEnrollmentPage from './pages/admin/TrainingEnrollmentPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import useAuthStore from './store/useAuthStore';
import { useEffect } from 'react';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  const WorkerRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role === 'admin') return <Navigate to="/admin" />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'admin') return <Navigate to="/" />;
    return children;
  };

  const PublicRoute = ({ children }) => {
    return children;
  };

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <PublicRoute>
              <MainLayout />
            </PublicRoute>
          }>
            <Route index element={<HomePage />} />
            <Route path="trainings" element={<TrainingListPage />} />
            <Route path="trainings/:id" element={<TrainingDetailPage />} />
            <Route path="forum" element={<ForumPage />} />
            <Route path="forum/:id" element={<ForumDetailPage />} />
            <Route path="announcements" element={<AnnouncementListPage />} />
            <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
            <Route path="profile" element={
              <WorkerRoute>
                <ProfilePage />
              </WorkerRoute>
            } />
            <Route path="my-posts" element={
              <WorkerRoute>
                <MyPostsPage />
              </WorkerRoute>
            } />
            <Route path="my-favorites" element={
              <WorkerRoute>
                <MyFavoritesPage />
              </WorkerRoute>
            } />
          </Route>

          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="archives" element={<ArchiveManagementPage />} />
            <Route path="archive-changes" element={<ArchiveChangeManagementPage />} />
            <Route path="rewards-punishments" element={<RewardPunishmentPage />} />
            <Route path="training-enrollments" element={<TrainingEnrollmentPage />} />
            <Route path="courses" element={<CourseManagementPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
