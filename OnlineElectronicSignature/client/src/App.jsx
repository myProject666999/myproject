import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import ContractList from './pages/ContractList.jsx';
import ContractCreate from './pages/ContractCreate.jsx';
import ContractSign from './pages/ContractSign.jsx';
import ContractDetail from './pages/ContractDetail.jsx';
import ArchiveList from './pages/ArchiveList.jsx';
import NavBar from './components/NavBar.jsx';

function App() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogin = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/contracts');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const ProtectedRoute = ({ children }) => {
        if (!user) return <Navigate to="/login" />;
        return children;
    };

    return (
        <div className="app">
            {user && <NavBar user={user} onLogout={handleLogout} />}
            <div className="main-content">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/" element={<Navigate to="/contracts" />} />
                    <Route path="/contracts" element={
                        <ProtectedRoute><ContractList user={user} /></ProtectedRoute>
                    } />
                    <Route path="/contracts/create" element={
                        <ProtectedRoute><ContractCreate user={user} /></ProtectedRoute>
                    } />
                    <Route path="/contracts/:id/sign" element={
                        <ProtectedRoute><ContractSign user={user} /></ProtectedRoute>
                    } />
                    <Route path="/contracts/:id" element={
                        <ProtectedRoute><ContractDetail user={user} /></ProtectedRoute>
                    } />
                    <Route path="/archive" element={
                        <ProtectedRoute><ArchiveList user={user} /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}

export default App;
