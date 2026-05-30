import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, message, Spin, Empty, Breadcrumb, Tooltip, Tag, Modal, List, Descriptions } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { marked } from 'marked';
import { documentApi } from '../services/api';

const DocumentView = () => {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getDocument(docId);
      if (res.data.code === 200) {
        setDocData(res.data.data);
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
    if (!docData) return;
    const content = `# ${docData.title}\n\n${docData.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${docData.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const loadVersions = useCallback(async () => {
    if (!docId) return;
    setVersionsLoading(true);
    try {
      const res = await documentApi.getVersions(docId);
      if (res.data.code === 200) {
        setVersions(res.data.data);
      }
    } catch (error) {
      message.error('加载版本历史失败');
    } finally {
      setVersionsLoading(false);
    }
  }, [docId]);

  const handleShowVersions = () => {
    setVersionModalVisible(true);
    loadVersions();
  };

  const renderBreadcrumb = () => {
    if (!docData) return null;
    const paths = docData.path.split('/').filter(Boolean);
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
            <Button icon={<HistoryOutlined />} onClick={handleShowVersions} />
          </Tooltip>
          <Tooltip title="导出">
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
          </Tooltip>
          <Tooltip title="删除">
            <Button icon={<DeleteOutlined />} danger onClick={handleDelete} />
          </Tooltip>
        </Space>
        <Space>
          <Tag color="blue">v{docData?.version}</Tag>
        </Space>
      </div>
      <div style={{ padding: '24px 48px' }}>
        {renderBreadcrumb()}
        <h1 className="doc-title">{docData?.title}</h1>
        <div className="doc-meta">
          创建于 {docData?.createdAt} · 最后更新于 {docData?.updatedAt}
        </div>
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: docData?.contentHtml || marked.parse(docData?.content || '') }}
        />
      </div>
      <Modal
        title="版本历史"
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={800}
      >
        <List
          loading={versionsLoading}
          dataSource={versions}
          renderItem={(version) => (
            <List.Item key={version.id}>
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={<span>v{version.version} - {version.title}</span>}
                description={
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="编辑说明">{version.editSummary || '无'}</Descriptions.Item>
                    <Descriptions.Item label="编辑时间">{version.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="编辑人">用户{version.editorId}</Descriptions.Item>
                  </Descriptions>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Spin>
  );
};

export default DocumentView;
