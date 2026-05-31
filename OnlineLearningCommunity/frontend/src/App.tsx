import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GroupListPage from './pages/GroupListPage';
import GroupDetailPage from './pages/GroupDetailPage';
import CheckinPage from './pages/CheckinPage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      
      <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route index element={<HomePage />} />
        <Route path="groups" element={<GroupListPage />} />
        <Route path="groups/:id" element={<GroupDetailPage />} />
        <Route path="checkin" element={<CheckinPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
