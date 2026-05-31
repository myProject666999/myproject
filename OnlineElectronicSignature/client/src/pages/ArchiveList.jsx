import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractApi } from '../services/api.js';

function ArchiveList({ user }) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArchived();
    }, []);

    const loadArchived = async () => {
        setLoading(true);
        try {
            const data = await contractApi.archived();
            setContracts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>合同归档</h1>
            </div>

            {loading ? (
                <div className="empty-state"><p>加载中...</p></div>
            ) : contracts.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📁</div>
                    <p>暂无归档合同</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>
                        合同签署完成后，可由管理员进行归档
                    </p>
                </div>
            ) : (
                <div>
                    <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                        🔒 归档合同已固化保存，所有签署记录和操作日志均可查验
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>合同标题</th>
                                <th>归档时间</th>
                                <th>签署完成时间</th>
                                <th>签署方</th>
                                <th>文件哈希</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(c => (
                                <tr key={c.id}>
                                    <td>{c.title}</td>
                                    <td>{c.archived_at?.substring(0, 16).replace('T', ' ')}</td>
                                    <td>{c.signed_at?.substring(0, 16).replace('T', ' ')}</td>
                                    <td>{c.signers?.length || 0} 人</td>
                                    <td style={{ fontSize: '12px', color: '#999' }}>
                                        {c.file_hash?.substring(0, 16)}...
                                    </td>
                                    <td>
                                        <Link to={`/contracts/${c.id}`} className="btn btn-sm btn-default">
                                            查看详情
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ArchiveList;
