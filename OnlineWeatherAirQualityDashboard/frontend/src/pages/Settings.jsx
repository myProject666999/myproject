import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, message, Space } from 'antd'
import { EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { settingAPI } from '../services/api.js'

function Settings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSetting, setEditingSetting] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await settingAPI.getAllSettings()
      setSettings(res.data.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      message.error('加载设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditingSetting(record)
    form.setFieldsValue({
      key: record.setting_key,
      value: record.setting_value,
      description: record.description,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await settingAPI.updateSetting(values.key, values.value, values.description)
      message.success('设置更新成功')
      setModalVisible(false)
      loadSettings()
    } catch (error) {
      console.error('Failed to update setting:', error)
      message.error('更新设置失败')
    }
  }

  const columns = [
    {
      title: '配置项',
      dataIndex: 'setting_key',
      key: 'setting_key',
      width: 220,
      render: (text) => <code>{text}</code>,
    },
    {
      title: '配置值',
      dataIndex: 'setting_value',
      key: 'setting_value',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text) => text?.replace('T', ' ').substring(0, 19) || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="系统设置"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadSettings} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={settings}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered
        />

        <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px' }}>设置说明</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li><strong>aqi_warning_threshold</strong>: AQI 超过此值触发黄色预警</li>
            <li><strong>aqi_danger_threshold</strong>: AQI 超过此值触发红色预警</li>
            <li><strong>pm25_warning_threshold</strong>: PM2.5 浓度预警阈值 (μg/m³)</li>
            <li><strong>collection_interval_minutes</strong>: 数据自动采集间隔（分钟）</li>
            <li><strong>cache_ttl_seconds</strong>: Redis 缓存过期时间（秒）</li>
            <li><strong>alert_check_interval_minutes</strong>: 预警检查间隔（分钟）</li>
          </ul>
        </div>
      </Card>

      <Modal
        title="编辑设置"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="配置项"
            rules={[{ required: true, message: '请输入配置项' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="value"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Settings
