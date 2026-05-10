import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import AppLayout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import ListPage from './pages/ListPage';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Admin from './pages/Admin';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin/*" element={<Admin />} />
          
          <Route path="/" element={
            <AppLayout>
              <Home />
            </AppLayout>
          } />
          
          <Route path="/notices" element={
            <AppLayout>
              <ListPage type="notices" />
            </AppLayout>
          } />
          <Route path="/notices/:id" element={
            <AppLayout>
              <ListPage type="notices" />
            </AppLayout>
          } />
          
          <Route path="/materials" element={
            <AppLayout>
              <ListPage type="materials" />
            </AppLayout>
          } />
          <Route path="/materials/:id" element={
            <AppLayout>
              <ListPage type="materials" />
            </AppLayout>
          } />
          
          <Route path="/knowledge" element={
            <AppLayout>
              <ListPage type="knowledge" />
            </AppLayout>
          } />
          <Route path="/knowledge/:id" element={
            <AppLayout>
              <ListPage type="knowledge" />
            </AppLayout>
          } />
          
          <Route path="/rumors" element={
            <AppLayout>
              <ListPage type="rumors" />
            </AppLayout>
          } />
          <Route path="/rumors/:id" element={
            <AppLayout>
              <ListPage type="rumors" />
            </AppLayout>
          } />
          
          <Route path="/recruitments" element={
            <AppLayout>
              <ListPage type="recruitments" />
            </AppLayout>
          } />
          <Route path="/recruitments/:id" element={
            <AppLayout>
              <ListPage type="recruitments" />
            </AppLayout>
          } />
          
          <Route path="/profile" element={
            <AppLayout>
              <Profile />
            </AppLayout>
          } />
          
          <Route path="/favorites" element={
            <AppLayout>
              <Favorites />
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
