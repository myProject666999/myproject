import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import FormList from './pages/FormList.jsx';
import FormEditor from './pages/FormEditor.jsx';
import FormFiller from './pages/FormFiller.jsx';
import DataList from './pages/DataList.jsx';
import Settings from './pages/Settings.jsx';
import { settingsApi } from './api/index.js';

export default function App() {
  const [siteName, setSiteName] = useState('在线表单收集工具');

  useEffect(() => {
    settingsApi.get().then(res => {
      if (res.data.site_name) {
        setSiteName(res.data.site_name);
        document.title = res.data.site_name;
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <Navbar siteName={siteName} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/forms" replace />} />
          <Route path="/forms" element={<FormList />} />
          <Route path="/forms/new" element={<FormEditor />} />
          <Route path="/forms/:id/edit" element={<FormEditor />} />
          <Route path="/forms/:id/fill" element={<FormFiller />} />
          <Route path="/forms/:id/data" element={<DataList />} />
          <Route path="/settings" element={<Settings siteName={siteName} onSiteNameChange={setSiteName} />} />
        </Routes>
      </div>
    </div>
  );
}
