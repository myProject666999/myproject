import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, Form, InputNumber, message, Space, Popconfirm, Tag, Upload, Image } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApi, uploadApi, publicApi } from '../../api';

const { Option } = Select;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (keyword) params.keyword = keyword;
      if (categoryId) params.category_id = categoryId;

      const res = await adminApi.getProducts(params);
      setProducts(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await publicApi.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteProduct(id);
      message.success('删除成功');
      loadProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOnShelf = async (id) => {
    try {
      await adminApi.onShelfProduct(id);
      message.success('上架成功');
      loadProducts();
    } catch (error) {
      message.error('上架失败');
    }
  };

  const handleOffShelf = async (id) => {
    try {
      await adminApi.offShelfProduct(id);
      message.success('下架成功');
      loadProducts();
    } catch (error) {
      message.error('下架失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createProduct(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error(error.message || '操作失败');
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
      width: 80,
      render: (img) => (
        <Image src={img || 'https://picsum.photos/50/50'} width={50} height={50} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '商品名称', dataIndex: 'name' },
    {
      title: '价格',
      dataIndex: 'price',
      render: (p) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{p}</span>,
    },
    { title: '库存', dataIndex: 'stock' },
    { title: '销量', dataIndex: 'sales' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s) => (s === 1 ? <Tag color="green">上架中</Tag> : <Tag color="default">已下架</Tag>),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          {record.status === 1 ? (
            <Button type="link" onClick={() => handleOffShelf(record.id)}>下架</Button>
          ) : (
            <Button type="link" onClick={() => handleOnShelf(record.id)}>上架</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          placeholder="搜索商品"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200 }}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="选择分类"
          style={{ width: 200 }}
          allowClear
          value={categoryId}
          onChange={(v) => { setCategoryId(v); setPage(1); loadProducts(); }}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加商品
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
        }}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="category_id" label="分类">
            <Select>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="original_price" label="原价">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="库存">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="image" label="商品图片">
            <Form.Item noStyle name="image">
              <Input style={{ display: 'none' }} />
            </Form.Item>
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
