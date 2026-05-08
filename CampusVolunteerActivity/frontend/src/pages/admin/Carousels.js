import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Switch,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { carouselApi, uploadApi } from '../../utils/api';
import dayjs from 'dayjs';

const Carousels = () => {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [form] = Form.useForm();

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const res = await carouselApi.getAll();
      setCarousels(res.data || []);
    } catch (error) {
      console.error('Failed to fetch carousels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleAdd = () => {
    setEditingCarousel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCarousel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await carouselApi.delete(id);
      message.success('删除成功！');
      fetchCarousels();
    } catch (error) {
      console.error('Failed to delete carousel:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await carouselApi.toggleStatus(id);
      message.success('状态更新成功！');
      fetchCarousels();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCarousel) {
        await carouselApi.update(editingCarousel.id, values);
        message.success('更新成功！');
      } else {
        await carouselApi.create(values);
        message.success('创建成功！');
      }

      setModalVisible(false);
      fetchCarousels();
    } catch (error) {
      console.error('Failed to submit carousel:', error);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const res = await uploadApi.uploadImage(file);
      form.setFieldsValue({ image_url: res.data.url });
      message.success('上传成功！');
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
    return false;
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '图片',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 150,
      render: (url) => (
        url ? (
          <img
            src={url}
            alt="carousel"
            style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : '-'
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Space>
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '启用' : '禁用'}
          </Tag>
          <Switch
            checked={status === 'active'}
            onChange={() => handleToggleStatus(record.id)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个轮播图吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="轮播图管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加轮播图
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={carousels}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />

      <Modal
        title={editingCarousel ? '编辑轮播图' : '添加轮播图'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="modal-form"
        >
          <Form.Item
            name="title"
            label="标题"
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="image_url"
            label="图片URL"
            rules={[{ required: true, message: '请上传或输入图片URL' }]}
          >
            <Input placeholder="请上传或输入图片URL" />
            <Form.Item noStyle>
              <Upload
                name="file"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="link"
            label="跳转链接"
          >
            <Input placeholder="请输入跳转链接（可选）" />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCarousel ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Carousels;
