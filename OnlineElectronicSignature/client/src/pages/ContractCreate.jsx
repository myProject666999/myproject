import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, contractApi } from '../services/api.js';

function ContractCreate({ user }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileInfo, setFileInfo] = useState(null);
    const [signers, setSigners] = useState([{ user_id: '' }]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const list = await authApi.getUsers();
            setUsers(list.filter(u => u.id !== user.id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await contractApi.upload(formData);
            setFileInfo(res);
            setMessage({ type: 'success', text: '文件上传成功' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || '文件上传失败' });
        }
    };

    const addSigner = () => {
        setSigners([...signers, { user_id: '' }]);
    };

    const removeSigner = (index) => {
        if (signers.length > 1) {
            setSigners(signers.filter((_, i) => i !== index));
        }
    };

    const updateSigner = (index, userId) => {
        const newSigners = [...signers];
        newSigners[index].user_id = parseInt(userId);
        setSigners(newSigners);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setMessage({ type: 'error', text: '请填写合同标题' });
            return;
        }
        if (!fileInfo) {
            setMessage({ type: 'error', text: '请上传合同文件' });
            return;
        }
        const validSigners = signers.filter(s => s.user_id);
        if (validSigners.length === 0) {
            setMessage({ type: 'error', text: '请至少选择一位签署方' });
            return;
        }

        setLoading(true);
        try {
            await contractApi.create({
                title,
                description,
                file_url: fileInfo.file_url,
                file_hash: fileInfo.file_hash,
                file_name: fileInfo.file_name,
                signers: validSigners
            });
            setMessage({ type: 'success', text: '合同创建成功，已保存为草稿' });
            setTimeout(() => navigate('/contracts'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || '创建失败' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>发起合同</h1>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="grid-2">
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>合同标题 *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="请输入合同标题"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>合同描述</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="请输入合同描述（可选）"
                            />
                        </div>
                        <div className="form-group">
                            <label>合同文件 *</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                style={{ marginBottom: '8px' }}
                            />
                            {fileInfo && (
                                <div className="alert alert-info" style={{ margin: 0 }}>
                                    ✓ 文件已上传，哈希: {fileInfo.file_hash.substring(0, 16)}...
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>签署方（按顺序签署）*</label>
                            {signers.map((signer, index) => (
                                <div className="add-signer-row" key={index}>
                                    <span style={{ minWidth: '40px', fontWeight: 600, color: '#1890ff' }}>第{index + 1}轮</span>
                                    <select
                                        value={signer.user_id}
                                        onChange={(e) => updateSigner(index, e.target.value)}
                                        required
                                    >
                                        <option value="">请选择签署方</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id} disabled={signers.some((s, si) => si !== index && s.user_id === u.id)}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeSigner(index)}
                                        disabled={signers.length === 1}
                                    >×</button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-default btn-sm" onClick={addSigner}>
                                + 添加签署方
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '创建中...' : '创建合同（保存为草稿）'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📌 操作指南</h3>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
                        <p><strong>1.</strong> 填写合同标题和描述</p>
                        <p><strong>2.</strong> 上传合同文件（支持PDF、Word、图片）</p>
                        <p><strong>3.</strong> 添加签署方并设置签署顺序</p>
                        <p><strong>4.</strong> 创建合同后进入"合同列表"可提交进入签署流程</p>
                        <p><strong>5.</strong> 签署方将按顺序依次签署，全部签署完成后合同生效</p>
                        <p style={{ marginTop: '12px', color: '#1890ff' }}>
                            🔒 系统使用SHA-256哈希确保文件防篡改，并通过哈希链保证操作日志不可追溯修改
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContractCreate;
