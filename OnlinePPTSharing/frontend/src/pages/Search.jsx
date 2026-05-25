import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Input,
  Row,
  Col,
  Spin,
  Empty,
  Pagination,
  Select,
  Tag,
  Typography,
  Button
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { documentApi } from '../api/document'
import DocumentCard from '../components/DocumentCard'

const { Title } = Typography

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchParams({ keyword: keyword.trim() })
      setPage(1)
      searchDocuments(keyword.trim(), 1)
    }
  }

  const searchDocuments = async (kw, pageNum) => {
    if (!kw) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await documentApi.search({
        keyword: kw,
        page: pageNum,
        limit: pageSize
      })
      setDocuments(res.data.list)
      setTotal(res.data.total)
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    searchDocuments(keyword, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    if (searchParams.get('keyword')) {
      searchDocuments(searchParams.get('keyword'), 1)
    }
  }, [])

  return (
    <div className="container page-container">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3}>搜索PPT文档</Title>
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            display: 'flex',
            gap: 8
          }}
        >
          <Input
            size="large"
            placeholder="输入关键词搜索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button
            size="large"
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
        </div>
      </div>

      {hasSearched && (
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">
            搜索: "{keyword}" - 找到 {total} 个结果
          </Tag>
        </div>
      )}

      <Spin spinning={loading}>
        {hasSearched ? (
          documents.length > 0 ? (
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
            !loading && (
              <Empty
                description={`没有找到与 "${keyword}" 相关的文档`}
                style={{ marginTop: 80 }}
              />
            )
          )
        ) : (
          <Empty description="输入关键词开始搜索" style={{ marginTop: 80 }} />
        )}
      </Spin>
    </div>
  )
}

export default Search
