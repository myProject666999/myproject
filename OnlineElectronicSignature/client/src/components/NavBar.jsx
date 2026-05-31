import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <nav className="navbar">
            <div className="logo">📝 电子签名系统</div>
            <div className="nav-links">
                <Link to="/contracts" className={isActive('/contracts') ? 'active' : ''}>合同列表</Link>
                <Link to="/contracts/create" className={isActive('/contracts/create') ? 'active' : ''}>发起合同</Link>
                <Link to="/archive" className={isActive('/archive') ? 'active' : ''}>合同归档</Link>
            </div>
            <div className="user-info">
                <span>{user?.name} ({user?.role === 'admin' ? '管理员' : '用户'})</span>
                <button className="logout-btn" onClick={onLogout}>退出</button>
            </div>
        </nav>
    );
}

export default NavBar;
