import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Upload, InputNumber, Image } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApi } from '../../api';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBanners();
      setBanners(res.data || []);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    form.setFieldsValue(banner);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBanner(id);
      message.success('删除成功');
      loadBanners();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createBanner(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadBanners();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const uploadProps = {
    name: 'file',
    action: 'http://localhost:8080/api/upload',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange(info) {
      if (info.file.status === 'done') {
        if (info.file.response?.code === 200) {
          form.setFieldValue('image', info.file.response.data.url);
          message.success('上传成功');
        } else {
          message.error(info.file.response?.message || '上传失败');
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败');
      }
    },
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'image',
      width: 200,
      render: (img) => (
        <Image src={img || 'https://picsum.photos/200/80'} width={120} height={50} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '标题', dataIndex: 'title' },
    { title: '链接', dataIndex: 'link' },
    { title: '排序', dataIndex: 'sort_order' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s) => (s === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加轮播图
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={banners}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingBanner ? '编辑轮播图' : '添加轮播图'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="image" label="轮播图片" rules={[{ required: true, message: '请上传图片' }]}>
            <Form.Item noStyle name="image">
              <Input style={{ display: 'none' }} />
            </Form.Item>
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="点击跳转的链接（可选）" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingBanner ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
