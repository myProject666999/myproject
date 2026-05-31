import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Card,
  message,
  Space,
  Switch,
  InputNumber
} from 'antd'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { materialApi, categoryApi, tagApi } from '../api'
import { useUserStore } from '../store/userStore'

const { TextArea } = Input
const { Option } = Select

const UploadPage = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    fetchCategories()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list()
      setCategories(res.data)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await tagApi.list()
      setTags(res.data)
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const handleTagSearch = async (value) => {
    if (value) {
      try {
        const res = await tagApi.search(value)
        setTags(res.data)
      } catch (error) {
        console.error('搜索标签失败:', error)
      }
    }
  }

  const handleUpload = async () => {
    try {
      const values = await form.validateFields()
      if (fileList.length === 0) {
        message.warning('请选择要上传的文件')
        return
      }

      setUploading(true)
      const formData = new FormData()
      formData.append('file', fileList[0].originFileObj)
      formData.append('data', JSON.stringify({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        isCopyright: values.isCopyright ? 1 : 0,
        downloadLimit: values.downloadLimit || 0,
        tagNames: selectedTags
      }))

      const res = await materialApi.upload(formData)
      message.success('上传成功')
      navigate(`/materials/${res.data.id}`)
    } catch (error) {
      if (error.errorFields) {
        return
      }
      message.error(error.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1))
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>选择图片</div>
    </div>
  )

  return (
    <div className="main-content">
      <div className="upload-container">
        <h2 style={{ marginBottom: 24 }}>上传素材</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="file"
            label="选择图片"
            rules={[{ required: true, message: '请选择图片' }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              onPreview={(file) => {
                setPreviewImage(file.url || file.thumbUrl)
                setPreviewVisible(true)
              }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入素材标题" maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入素材描述（可选）" maxLength={500} />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签后回车添加"
              value={selectedTags}
              onChange={setSelectedTags}
              onSearch={handleTagSearch}
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            >
              {tags.map(tag => (
                <Option key={tag.id} value={tag.name}>{tag.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isCopyright"
            label="版权声明"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="有版权" unCheckedChildren="无版权" />
          </Form.Item>

          <Form.Item
            name="downloadLimit"
            label="下载限制次数"
            help="0表示不限制"
          >
            <InputNumber min={0} style={{ width: 200 }} placeholder="0" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={uploading}>
                <UploadOutlined /> 上传
              </Button>
              <Button onClick={() => navigate(-1)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default UploadPage
