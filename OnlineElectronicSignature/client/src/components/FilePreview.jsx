import React, { useState } from 'react';

function FilePreview({ fileUrl, fileName, fileHash }) {
    const [previewMode, setPreviewMode] = useState('embed');

    if (!fileUrl) {
        return (
            <div className="no-file">
                <p>暂无合同文件</p>
            </div>
        );
    }

    const fileExt = fileName?.split('.').pop()?.toLowerCase() || fileUrl.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt);
    const isPdf = fileExt === 'pdf';
    const displayName = fileName || '合同文件';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', color: '#666' }}>
                    <span>📄 {displayName}</span>
                    {fileHash && (
                        <span style={{ marginLeft: '12px', color: '#999' }}>
                            SHA256: {fileHash.substring(0, 16)}...
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isPdf && (
                        <>
                            <button
                                type="button"
                                className={`btn btn-sm ${previewMode === 'embed' ? 'btn-primary' : 'btn-default'}`}
                                onClick={() => setPreviewMode('embed')}
                            >
                                预览
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${previewMode === 'newtab' ? 'btn-primary' : 'btn-default'}`}
                                onClick={() => window.open(fileUrl, '_blank')}
                            >
                                新窗口打开
                            </button>
                        </>
                    )}
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="btn btn-sm btn-success"
                        onClick={(e) => e.stopPropagation()}
                    >
                        ⬇ 下载
                    </a>
                </div>
            </div>

            <div className="file-preview-inner" style={{ width: '100%', height: '500px', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                {isImage ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                        <img
                            src={fileUrl}
                            alt={displayName}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </div>
                ) : isPdf && previewMode === 'embed' ? (
                    <embed
                        src={fileUrl + '#toolbar=1&navpanes=1&scrollbar=1'}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        title={displayName}
                    />
                ) : isPdf && previewMode === 'newtab' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa', color: '#888' }}>
                        <p style={{ marginBottom: '16px', fontSize: '14px' }}>PDF 文件预览</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.open(fileUrl, '_blank')}
                        >
                            📖 在新窗口中打开 PDF
                        </button>
                        <p style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                            或点击上方"下载"按钮保存到本地
                        </p>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa', color: '#888' }}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📄</p>
                        <p style={{ marginBottom: '8px', fontSize: '14px' }}>{displayName}</p>
                        <p style={{ fontSize: '13px', marginBottom: '16px' }}>该文件类型暂不支持在线预览</p>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="btn btn-primary"
                        >
                            ⬇ 下载文件查看
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilePreview;
