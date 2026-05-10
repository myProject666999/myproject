import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message, Space, Popconfirm, InputNumber, Image } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApi, publicApi } from '../../api';

const { Option } = Select;

export default function ProductConfig({ type, title }) {
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const apiMap = {
    hot: {
      get: adminApi.getHotProducts,
      create: adminApi.createHotProduct,
      delete: adminApi.deleteHotProduct,
    },
    new: {
      get: adminApi.getNewProducts,
      create: adminApi.createNewProduct,
      delete: adminApi.deleteNewProduct,
    },
    recommend: {
      get: adminApi.getRecommendProducts,
      create: adminApi.createRecommendProduct,
      delete: adminApi.deleteRecommendProduct,
    },
  };

  const api = apiMap[type];

  useEffect(() => {
    loadData();
    loadProducts();
  }, [type]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get();
      setList(res.data || []);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await publicApi.getProducts({ page_size: 100 });
      setProducts(res.data?.list || []);
    } catch (error) {
      console.error('加载商品失败', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await api.create(values);
      message.success('添加成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: '商品图片',
      dataIndex: ['product', 'image'],
      width: 80,
      render: (img) => (
        <Image src={img || 'https://picsum.photos/50/50'} width={50} height={50} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '商品名称', dataIndex: ['product', 'name'] },
    {
      title: '商品价格',
      dataIndex: ['product', 'price'],
      render: (p) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{p}</span>,
    },
    { title: '排序', dataIndex: 'sort_order' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
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
          添加{title}
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={`添加${title}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="product_id" label="选择商品" rules={[{ required: true }]}>
            <Select placeholder="请选择商品" showSearch optionFilterProp="children">
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name} - ¥{product.price}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>添加</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
