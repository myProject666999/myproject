import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contractApi } from '../services/api.js';
import FilePreview from '../components/FilePreview.jsx';

function ContractDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => {
        loadContract();
    }, [id]);

    const loadContract = async () => {
        setLoading(true);
        try {
            const data = await contractApi.detail(id);
            setContract(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            await contractApi.submit(id);
            alert('合同已提交，进入签署流程');
            loadContract();
        } catch (err) {
            alert(err.response?.data?.error || '提交失败');
        }
    };

    const handleArchive = async () => {
        try {
            await contractApi.archive(id);
            alert('合同已归档');
            navigate('/archive');
        } catch (err) {
            alert(err.response?.data?.error || '归档失败');
        }
    };

    const handleVerify = async () => {
        try {
            const result = await contractApi.verify(id);
            setVerifyResult(result);
        } catch (err) {
            alert('验证失败');
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

    const getActionText = (action) => {
        const map = {
            create: '创建合同',
            submit: '提交审批',
            sign: '签署合同',
            reject: '拒绝合同',
            complete: '签署完成',
            archive: '归档合同'
        };
        return map[action] || action;
    };

    if (loading) {
        return <div className="empty-state"><p>加载中...</p></div>;
    }

    if (!contract) {
        return <div className="empty-state"><p>合同不存在</p></div>;
    }

    const isInitiator = contract.initiator_id === user.id;
    const signedCount = contract.signers?.filter(s => s.status === 'signed').length || 0;

    return (
        <div>
            <div className="page-header">
                <h1>合同详情</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-default btn-sm" onClick={handleVerify}>
                        🔍 验签
                    </button>
                    {contract.status === 'draft' && isInitiator && (
                        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
                            提交审批
                        </button>
                    )}
                    {contract.status === 'completed' && user.role === 'admin' && (
                        <button className="btn btn-success btn-sm" onClick={handleArchive}>
                            归档合同
                        </button>
                    )}
                    <Link to="/contracts" className="btn btn-default btn-sm">返回列表</Link>
                </div>
            </div>

            {verifyResult && (
                <div className={`alert ${verifyResult.valid ? 'alert-success' : 'alert-error'}`}>
                    {verifyResult.valid ? '✓ 数据完整性验证通过，所有操作记录哈希链一致' : '✗ 数据可能被篡改，哈希链验证失败'}
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        合同文件哈希: {verifyResult.contract_hash?.substring(0, 16)}...
                    </div>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>{contract.title}</h2>
                        <p style={{ color: '#888', fontSize: '13px' }}>
                            合同ID: #{contract.id} | 发起时间: {contract.created_at?.substring(0, 16).replace('T', ' ')}
                        </p>
                    </div>
                    <span className={`status-badge status-${contract.status}`}>
                        {getStatusText(contract.status)}
                    </span>
                </div>

                {contract.description && (
                    <p style={{ color: '#555', marginBottom: '16px' }}>{contract.description}</p>
                )}

                <div style={{ marginBottom: '16px' }}>
                    {contract.file_url ? (
                        <FilePreview
                            fileUrl={contract.file_url}
                            fileName={contract.file_name}
                            fileHash={contract.file_hash}
                        />
                    ) : (
                        <div className="no-file">暂无文件</div>
                    )}
                </div>

                <div style={{ fontSize: '12px', color: '#888' }}>
                    文件哈希: {contract.file_hash?.substring(0, 32)}...
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>签署流程 ({signedCount}/{contract.signers?.length || 0})</h3>
                    <div className="signer-list">
                        {contract.signers?.map((signer, i) => (
                            <div
                                key={signer.id}
                                className={`signer-item ${signer.status}`}
                            >
                                <div className="order">{i + 1}</div>
                                <div className="info">
                                    <div className="name">{signer.user_name}</div>
                                    <div className="email">{signer.user_email}</div>
                                    {signer.signed_at && (
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                            {signer.signed_at?.substring(0, 16).replace('T', ' ')}
                                        </div>
                                    )}
                                    {signer.comment && (
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                                            意见: {signer.comment}
                                        </div>
                                    )}
                                </div>
                                {signer.status === 'signed' && signer.signature_image && (
                                    <img src={signer.signature_image} alt="签名" className="signature-preview" />
                                )}
                                <span className={`sig-status ${signer.status}`}>
                                    {signer.status === 'signed' ? '已签署' : signer.status === 'rejected' ? '已拒绝' : '待签署'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>操作日志</h3>
                    <div className="timeline">
                        {contract.logs?.length === 0 && (
                            <div style={{ color: '#999', fontSize: '13px' }}>暂无操作记录</div>
                        )}
                        {contract.logs?.map((log) => (
                            <div key={log.id} className={`timeline-item ${log.action === 'sign' ? 'completed' : log.action === 'reject' ? 'rejected' : log.action === 'complete' ? 'completed' : ''}`}>
                                <div className="time">{log.action_time?.substring(0, 19).replace('T', ' ')}</div>
                                <div className="action">{getActionText(log.action)}</div>
                                <div className="detail">{log.detail}</div>
                                <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                                    {log.user_name || '系统'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContractDetail;
