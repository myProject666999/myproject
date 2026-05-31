import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractApi } from '../services/api.js';

function ContractList({ user }) {
    const [tab, setTab] = useState('all');
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContracts();
    }, [tab]);

    const loadContracts = async () => {
        setLoading(true);
        try {
            let data;
            if (tab === 'pending') {
                data = await contractApi.pending();
            } else if (tab === 'signed') {
                data = await contractApi.signed();
            } else if (tab === 'mine') {
                data = await contractApi.myContracts();
            } else {
                data = await contractApi.list();
            }
            setContracts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        const map = {
            draft: '草稿',
            pending_signing: '签署中',
            completed: '已完成',
            archived: '已归档',
            rejected: '已拒绝'
        };
        return map[status] || status;
    };

    return (
        <div>
            <div className="page-header">
                <h1>合同列表</h1>
                <Link to="/contracts/create" className="btn btn-primary">+ 发起合同</Link>
            </div>

            <div className="tabs">
                <div className={`tab-item ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>全部合同</div>
                <div className={`tab-item ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>我发起的</div>
                <div className={`tab-item ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>待我签署</div>
                <div className={`tab-item ${tab === 'signed' ? 'active' : ''}`} onClick={() => setTab('signed')}>我已签署</div>
            </div>

            {loading ? (
                <div className="empty-state"><p>加载中...</p></div>
            ) : contracts.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📄</div>
                    <p>暂无合同数据</p>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>合同标题</th>
                            <th>状态</th>
                            <th>发起时间</th>
                            <th>签署进度</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map(c => {
                            const signedCount = c.signers?.filter(s => s.status === 'signed').length || 0;
                            const totalCount = c.signers?.length || 0;
                            return (
                                <tr key={c.id}>
                                    <td>{c.title}</td>
                                    <td>
                                        <span className={`status-badge status-${c.status}`}>
                                            {getStatusText(c.status)}
                                        </span>
                                    </td>
                                    <td>{c.created_at?.substring(0, 16).replace('T', ' ')}</td>
                                    <td>{signedCount}/{totalCount}</td>
                                    <td>
                                        {c.status === 'pending_signing' && c.current_sign_order > 0 && (() => {
                                            const curSigner = c.signers?.find(s => s.sign_order === c.current_sign_order);
                                            if (curSigner && curSigner.user_id === user.id) {
                                                return (
                                                    <Link to={`/contracts/${c.id}/sign`} className="btn btn-sm btn-success">立即签署</Link>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <Link to={`/contracts/${c.id}`} className="btn btn-sm btn-default" style={{ marginLeft: '8px' }}>查看详情</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ContractList;
