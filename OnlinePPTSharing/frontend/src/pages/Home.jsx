import { useState, useEffect } from 'react'
import { Row, Col, Typography, Select, Spin, Empty, Pagination, Tag } from 'antd'
import { documentApi } from '../api/document'
import { categoryApi } from '../api/category'
import DocumentCard from '../components/DocumentCard'

const { Title } = Typography

const Home = () => {
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [categoryId, setCategoryId] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    fetchCategories()
    fetchDocuments()
  }, [page, categoryId, sortBy])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getList()
      setCategories(res.data.list)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize,
        categoryId,
        sortBy,
        sortOrder: 'DESC'
      }
      const res = await documentApi.getList(params)
      setDocuments(res.data.list)
      setTotal(res.data.total)
    } catch (error) {
      console.error('获取文档列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container page-container">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          热门PPT
        </Title>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag.CheckableTag
              checked={!categoryId}
              onChange={() => {
                setCategoryId(null)
                setPage(1)
              }}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              全部
            </Tag.CheckableTag>
            {categories.map((cat) => (
              <Tag.CheckableTag
                key={cat.id}
                checked={categoryId === cat.id}
                onChange={() => {
                  setCategoryId(cat.id)
                  setPage(1)
                }}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {cat.icon} {cat.name}
              </Tag.CheckableTag>
            ))}
          </div>
          <Select
            value={sortBy}
            onChange={(value) => {
              setSortBy(value)
              setPage(1)
            }}
            style={{ width: 120 }}
            options={[
              { value: 'created_at', label: '最新上传' },
              { value: 'view_count', label: '最多浏览' },
              { value: 'like_count', label: '最多点赞' },
              { value: 'download_count', label: '最多下载' }
            ]}
          />
        </div>
      </div>

      <Spin spinning={loading}>
        {documents.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {documents.map((doc) => (
                <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                  <DocumentCard document={doc} />
                </Col>
              ))}
            </Row>
            {total > pageSize && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          !loading && <Empty description="暂无文档" style={{ marginTop: 80 }} />
        )}
      </Spin>
    </div>
  )
}

export default Home
