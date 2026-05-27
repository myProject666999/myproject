import React, { useState, useEffect } from 'react';
import { Tree, Button, message, Dropdown, Modal, Input, Form, Select } from 'antd';
import {
  PlusOutlined,
  FolderOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { documentApi } from '../services/api';

const DocumentTree = ({ spaceId }) => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (spaceId) {
      loadTree();
    }
  }, [spaceId]);

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getTree(spaceId);
      if (res.data.code === 200) {
        const tree = buildTree(res.data.data);
        setTreeData(tree);
      }
    } catch (error) {
      message.error('加载文档树失败');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (documents) => {
    const map = {};
    const roots = [];
    
    documents.forEach(doc => {
      map[doc.id] = { ...doc, key: doc.id, title: doc.title, children: [] };
    });

    documents.forEach(doc => {
      if (doc.parentId && map[doc.parentId]) {
        map[doc.parentId].children.push(map[doc.id]);
      } else if (!doc.parentId) {
        roots.push(map[doc.id]);
      }
    });

    return roots;
  };

  const handleSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      navigate(`/space/${spaceId}/document/${selectedKeys[0]}`);
    }
  };

  const handleCreate = (parentId = null) => {
    setSelectedParent(parentId);
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleSubmitCreate = async (values) => {
    try {
      const data = {
        spaceId: spaceId,
        parentId: selectedParent,
        title: values.title,
        content: values.content || '',
        isFolder: values.type === 'folder' ? 1 : 0
      };
      const res = await documentApi.createDocument(data);
      if (res.data.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        loadTree();
        if (values.type === 'document') {
          navigate(`/space/${spaceId}/document/${res.data.data.id}`);
        }
      }
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后文档将移入回收站，是否继续？',
      onOk: async () => {
        try {
          const res = await documentApi.deleteDocument(id);
          if (res.data.code === 200) {
            message.success('删除成功');
            loadTree();
            if (docId && parseInt(docId) === id) {
              navigate(`/space/${spaceId}`);
            }
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const titleRender = (nodeData) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{nodeData.title}</span>
        <Dropdown
          menu={{
            items: [
              { key: 'create', label: '新建子文档', icon: <PlusOutlined /> },
              { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true }
            ],
            onClick: ({ key }) => {
              if (key === 'create') handleCreate(nodeData.id);
              if (key === 'delete') handleDelete(nodeData.id);
            }
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      </div>
    );
  };

  const switcherIcon = ({ expanded }) => {
    return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>文档目录</span>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleCreate(null)}>
          新建
        </Button>
      </div>
      <Tree
        showLine
        showIcon
        treeData={treeData}
        onSelect={handleSelect}
        selectedKeys={docId ? [docId] : []}
        loading={loading}
        titleRender={titleRender}
        icon={(nodeData) => {
          return nodeData.isFolder ? <FolderOutlined /> : <FileTextOutlined />;
        }}
      />
      <Modal
        title="新建文档"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCreate}>
          <Form.Item name="type" label="类型" initialValue="document">
            <Select>
              <Select.Option value="document">文档</Select.Option>
              <Select.Option value="folder">文件夹</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentTree;
