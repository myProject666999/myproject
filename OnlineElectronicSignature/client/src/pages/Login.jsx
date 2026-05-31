import React, { useState } from 'react';
import { authApi } from '../services/api.js';

function Login({ onLogin }) {
    const [email, setEmail] = useState('zhangsan@example.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            onLogin(res.token, res.user);
        } catch (err) {
            setError(err.response?.data?.error || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>在线电子签名</h1>
                <p className="subtitle">企业合同签署与管理平台</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>邮箱</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>
                <p className="footer">默认账号: zhangsan@example.com / 123456</p>
            </div>
        </div>
    );
}

export default Login;
