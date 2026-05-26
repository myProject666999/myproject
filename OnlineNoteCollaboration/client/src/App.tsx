import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Spaces from './pages/Spaces';
import SpaceDetail from './pages/SpaceDetail';
import DocumentEditor from './pages/DocumentEditor';
import Members from './pages/Members';
import RecycleBinPage from './pages/RecycleBinPage';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/spaces" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/spaces" />} />
      <Route path="/spaces" element={user ? <Spaces /> : <Navigate to="/login" />} />
      <Route path="/spaces/:id" element={user ? <SpaceDetail /> : <Navigate to="/login" />} />
      <Route path="/documents/:id" element={user ? <DocumentEditor /> : <Navigate to="/login" />} />
      <Route path="/spaces/:id/members" element={user ? <Members /> : <Navigate to="/login" />} />
      <Route path="/spaces/:id/recycle-bin" element={user ? <RecycleBinPage /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? "/spaces" : "/login"} />} />
    </Routes>
  );
};

export default App;
