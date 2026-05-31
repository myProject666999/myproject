import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SignaturePad from 'signature_pad';
import { contractApi } from '../services/api.js';
import FilePreview from '../components/FilePreview.jsx';

function ContractSign({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [signType, setSignType] = useState('handwritten');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const canvasRef = useRef(null);
    const signaturePadRef = useRef(null);

    useEffect(() => {
        loadContract();
    }, [id]);

    useEffect(() => {
        if (canvasRef.current && signType === 'handwritten') {
            signaturePadRef.current = new SignaturePad(canvasRef.current, {
                backgroundColor: 'rgb(255, 255, 255)'
            });
        }
        return () => {
            if (signaturePadRef.current) {
                signaturePadRef.current.off();
            }
        };
    }, [contract, signType]);

    const loadContract = async () => {
        try {
            const data = await contractApi.detail(id);
            setContract(data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: '加载合同失败' });
        }
    };

    const clearSignature = () => {
        if (signaturePadRef.current) {
            signaturePadRef.current.clear();
        }
    };

    const generateSealSignature = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff4d4f';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(user.name, 100, 40);
        ctx.font = '14px sans-serif';
        ctx.fillText('电子印章', 100, 70);
        return canvas.toDataURL('image/png');
    };

    const handleSign = async () => {
        let signatureImage = '';
        if (signType === 'handwritten') {
            if (signaturePadRef.current.isEmpty()) {
                setMessage({ type: 'error', text: '请先在签名区域手写签名' });
                return;
            }
            signatureImage = signaturePadRef.current.toDataURL('image/png');
        } else {
            signatureImage = generateSealSignature();
        }

        setLoading(true);
        try {
            await contractApi.sign(id, {
                signature_image: signatureImage,
                signature_type: signType,
                comment
            });
            setMessage({ type: 'success', text: '签署成功！' });
            setTimeout(() => navigate('/contracts'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || '签署失败' });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!comment) {
            setMessage({ type: 'error', text: '请填写拒绝理由' });
            return;
        }
        setLoading(true);
        try {
            await contractApi.reject(id, { comment });
            setMessage({ type: 'success', text: '已拒绝合同' });
            setTimeout(() => navigate('/contracts'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || '操作失败' });
        } finally {
            setLoading(false);
        }
    };

    if (!contract) {
        return <div className="empty-state"><p>加载中...</p></div>;
    }

    const currentSigner = contract.signers?.find(s => s.sign_order === contract.current_sign_order);
    const isMyTurn = currentSigner && currentSigner.user_id === user.id;

    if (!isMyTurn) {
        return (
            <div className="card">
                <h2>{contract.title}</h2>
                <div className="alert alert-info">当前不是您的签署轮次，请等待前面的签署方完成签署。</div>
                <Link to="/contracts" className="btn btn-default">返回列表</Link>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>签署合同 - {contract.title}</h1>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="grid-2">
                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>签署信息</h3>
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                        <p style={{ fontSize: '13px', color: '#52c41a' }}>
                            当前轮次：第 {contract.current_sign_order} 轮 / 共 {contract.signers.length} 轮
                        </p>
                        <p style={{ fontSize: '13px', color: '#52c41a', marginTop: '4px' }}>
                            签署人：{currentSigner?.user_name}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>签署方式</label>
                        <div className="signature-tools">
                            <button
                                type="button"
                                className={`tool-btn ${signType === 'handwritten' ? 'active' : ''}`}
                                onClick={() => setSignType('handwritten')}
                            >
                                ✍️ 手写签名
                            </button>
                            <button
                                type="button"
                                className={`tool-btn ${signType === 'seal' ? 'active' : ''}`}
                                onClick={() => setSignType('seal')}
                            >
                                🔴 印章签名
                            </button>
                        </div>
                    </div>

                    {signType === 'handwritten' && (
                        <div className="signature-pad-container">
                            <canvas
                                ref={canvasRef}
                                className="signature-pad"
                            />
                        </div>
                    )}

                    {signType === 'seal' && (
                        <div className="signature-pad-container">
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ display: 'inline-block', background: '#ff4d4f', color: '#fff', padding: '20px 40px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.name}</div>
                                    <div style={{ fontSize: '14px' }}>电子印章</div>
                                </div>
                                <p style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>
                                    点击"确认签署"将使用此印章
                                </p>
                            </div>
                        </div>
                    )}

                    {signType === 'handwritten' && (
                        <button type="button" className="btn btn-default btn-sm" onClick={clearSignature} style={{ marginBottom: '16px' }}>
                            清除重签
                        </button>
                    )}

                    <div className="form-group">
                        <label>签署意见（可选）</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="请输入签署意见..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleSign}
                            disabled={loading}
                        >
                            {loading ? '签署中...' : '✓ 确认签署'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleReject}
                            disabled={loading}
                        >
                            ✗ 拒绝签署
                        </button>
                        <Link to="/contracts" className="btn btn-default">取消</Link>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>合同内容</h3>
                    {contract.file_url ? (
                        <FilePreview
                            fileUrl={contract.file_url}
                            fileName={contract.file_name}
                            fileHash={contract.file_hash}
                        />
                    ) : (
                        <div className="no-file">暂无文件</div>
                    )}

                    <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px' }}>签署流程</h3>
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
            </div>
        </div>
    );
}

export default ContractSign;
