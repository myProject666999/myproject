import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, message, Spin, Empty, Breadcrumb, Tooltip, Tag, Modal } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  DownloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { marked } from 'marked';
import { documentApi } from '../services/api';

const DocumentView = () => {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getDocument(docId);
      if (res.data.code === 200) {
        setDocument(res.data.data);
      }
    } catch (error) {
      message.error('加载文档失败');
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId, loadDocument]);

  const handleEdit = () => {
    navigate(`/space/${spaceId}/edit/${docId}`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后文档将移入回收站，是否继续？',
      onOk: async () => {
        try {
          const res = await documentApi.deleteDocument(docId);
          if (res.data.code === 200) {
            message.success('删除成功');
            navigate(`/space/${spaceId}`);
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleExport = () => {
    if (!document) return;
    const content = `# ${document.title}\n\n${document.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const renderBreadcrumb = () => {
    if (!document) return null;
    const paths = document.path.split('/').filter(Boolean);
    return (
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        {paths.map((p, i) => (
          <Breadcrumb.Item key={i}>{p}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  if (!docId) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: '#ccc' }} />}
          description="请从左侧选择一个文档"
        />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="doc-toolbar">
        <Space>
          <Button icon={<EditOutlined />} type="primary" onClick={handleEdit}>
            编辑
          </Button>
          <Tooltip title="版本历史">
            <Button icon={<HistoryOutlined />} />
          </Tooltip>
          <Tooltip title="导出">
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
          </Tooltip>
          <Tooltip title="删除">
            <Button icon={<DeleteOutlined />} danger onClick={handleDelete} />
          </Tooltip>
        </Space>
        <Space>
          <Tag color="blue">v{document?.version}</Tag>
        </Space>
      </div>
      <div style={{ padding: '24px 48px' }}>
        {renderBreadcrumb()}
        <h1 className="doc-title">{document?.title}</h1>
        <div className="doc-meta">
          创建于 {document?.createdAt} · 最后更新于 {document?.updatedAt}
        </div>
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: document?.contentHtml || marked.parse(document?.content || '') }}
        />
      </div>
    </Spin>
  );
};

export default DocumentView;
