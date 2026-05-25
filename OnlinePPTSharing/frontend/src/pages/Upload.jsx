import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Progress,
  Switch,
  Space,
  Typography
} from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { documentApi } from '../api/document'
import { categoryApi } from '../api/category'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const Upload = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getList()
      setCategories(res.data.list)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const handleFileChange = (info) => {
    const selectedFile = info.file
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase()
      const allowedTypes = ['ppt', 'pptx', 'pdf']
      if (!allowedTypes.includes(ext)) {
        message.error('仅支持 PPT、PPTX、PDF 格式的文件')
        return
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        message.error('文件大小不能超过 100MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop().toLowerCase()
      const allowedTypes = ['ppt', 'pptx', 'pdf']
      if (!allowedTypes.includes(ext)) {
        message.error('仅支持 PPT、PPTX、PDF 格式的文件')
        return
      }
      if (droppedFile.size > 100 * 1024 * 1024) {
        message.error('文件大小不能超过 100MB')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleSubmit = async (values) => {
    if (!file) {
      message.warning('请选择要上传的文件')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', values.title || file.name)
      formData.append('description', values.description || '')
      formData.append('categoryId', values.categoryId || '')
      formData.append('tags', values.tags || '')
      formData.append('isPublic', values.isPublic ? 1 : 0)
      formData.append('allowDownload', values.allowDownload ? 1 : 0)

      const res = await documentApi.upload(formData, (progress) => {
        setProgress(progress)
      })

      message.success('上传成功！文档正在转换中，请稍后查看')
      navigate(`/view/${res.data.document_id}`)
    } catch (error) {
      message.error(error.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFileRemove = () => {
    setFile(null)
    setProgress(0)
  }

  return (
    <div className="container page-container">
      <Card title="上传文档" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div
          className={`upload-area ${dragOver ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
          style={{ marginBottom: 24 }}
        >
          <input
            id="file-input"
            type="file"
            accept=".ppt,.pptx,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) handleFileChange({ file })
              e.target.value = ''
            }}
          />
          {file ? (
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                {file.name}
              </div>
              <div style={{ color: '#999', marginBottom: 16 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              {uploading && (
                <Progress percent={progress} status="active" style={{ maxWidth: 300, margin: '0 auto 16px' }} />
              )}
              <Button danger onClick={(e) => { e.stopPropagation(); handleFileRemove() }}>
                移除文件
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <InboxOutlined />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                点击或拖拽文件到此区域上传
              </div>
              <div style={{ color: '#999' }}>
                支持 PPT、PPTX、PDF 格式，最大 100MB
              </div>
            </div>
          )}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isPublic: true,
            allowDownload: true
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入文档标题" maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea
              placeholder="请输入文档描述"
              rows={4}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item name="categoryId" label="分类">
            <Select placeholder="请选择分类" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔，如：工作,总结,汇报" />
          </Form.Item>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Form.Item name="isPublic" label="公开设置" valuePropName="checked">
              <Switch checkedChildren="公开" unCheckedChildren="私有" />
            </Form.Item>

            <Form.Item name="allowDownload" label="下载权限" valuePropName="checked">
              <Switch checkedChildren="允许下载" unCheckedChildren="禁止下载" />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={uploading}
              icon={<UploadOutlined />}
            >
              {uploading ? '上传中...' : '开始上传'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Upload
