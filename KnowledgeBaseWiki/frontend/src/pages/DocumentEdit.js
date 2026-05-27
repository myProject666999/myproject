import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Input, message, Spin, Modal, Form, Input as AntInput } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { marked } from 'marked';
import { documentApi } from '../services/api';

const { TextArea } = Input;

const DocumentEdit = () => {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getDocument(docId);
      if (res.data.code === 200) {
        const doc = res.data.data;
        setTitle(doc.title);
        setContent(doc.content);
      }
    } catch (error) {
      message.error('加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (editSummary = '') => {
    setSaving(true);
    const data = {
      title,
      content
    };

    const request = docId
      ? documentApi.updateDocument(docId, data, editSummary)
      : documentApi.createDocument({ ...data, spaceId, isFolder: 0 });

    request.then(res => {
      if (res.data.code === 200) {
        message.success('保存成功');
        navigate(`/space/${spaceId}/document/${res.data.data.id}`);
      } else {
        message.error(res.data.message);
      }
    }).catch(() => {
      message.error('保存失败');
    }).finally(() => {
      setSaving(false);
    });
  };

  const handleSaveWithSummary = () => {
    setSummaryModalVisible(true);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: '确认取消',
      content: '未保存的内容将丢失，是否继续？',
      onOk: () => {
        if (docId) {
          navigate(`/space/${spaceId}/document/${docId}`);
        } else {
          navigate(`/space/${spaceId}`);
        }
      }
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="doc-toolbar">
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleSave()}
            loading={saving}
          >
            保存
          </Button>
          {docId && (
            <Button onClick={handleSaveWithSummary} loading={saving}>
              保存并备注
            </Button>
          )}
        </Space>
        <Space>
          <Button
            type={!showPreview ? 'primary' : 'default'}
            icon={<EditOutlined />}
            onClick={() => setShowPreview(false)}
          >
            编辑
          </Button>
          <Button
            type={showPreview ? 'primary' : 'default'}
            icon={<EyeOutlined />}
            onClick={() => setShowPreview(true)}
          >
            预览
          </Button>
        </Space>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <Input
          placeholder="请输入文档标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: 24, fontWeight: 600, border: 'none', padding: 0, marginBottom: 16 }}
        />
      </div>

      <div className="editor-container">
        {!showPreview && (
          <div className="editor-pane">
            <TextArea
              className="editor-textarea"
              placeholder="开始编写内容，支持 Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}
        {showPreview && (
          <div className="preview-pane markdown-content">
            <h1>{title || '无标题'}</h1>
            <div dangerouslySetInnerHTML={{ __html: marked.parse(content || '') }} />
          </div>
        )}
      </div>

      <Modal
        title="保存备注"
        open={summaryModalVisible}
        onCancel={() => setSummaryModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={({ summary }) => {
          handleSave(summary);
          setSummaryModalVisible(false);
        }}>
          <Form.Item name="summary" label="修改备注">
            <AntInput.TextArea rows={4} placeholder="请描述本次修改内容..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setSummaryModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default DocumentEdit;
