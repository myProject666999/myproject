import React, { useState, useEffect, useCallback } from 'react'
import { Input, Select, Tag, Button, Space, Spin, Empty, message } from 'antd'
import { SearchOutlined, DownloadOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { materialApi, categoryApi, tagApi } from '../api'
import InfiniteScroll from 'react-infinite-scroll-component'

const { Option } = Select

const HomePage = () => {
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState()
  const [selectedTag, setSelectedTag] = useState()
  const [sort, setSort] = useState('create_time')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  useEffect(() => {
    refreshList()
  }, [keyword, selectedCategory, selectedTag, sort])

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

  const refreshList = async () => {
    setRefreshing(true)
    setPage(1)
    setMaterials([])
    setHasMore(true)
    await loadMaterials(1, true)
    setRefreshing(false)
  }

  const loadMaterials = async (pageNum, isRefresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await materialApi.list({
        current: pageNum,
        size: 20,
        keyword: keyword || undefined,
        categoryId: selectedCategory,
        tagId: selectedTag,
        sort
      })
      const newMaterials = res.data.records
      if (isRefresh) {
        setMaterials(newMaterials)
      } else {
        setMaterials(prev => [...prev, ...newMaterials])
      }
      if (newMaterials.length < 20) {
        setHasMore(false)
      }
      setPage(pageNum + 1)
    } catch (error) {
      message.error('加载素材失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (id) => {
    navigate(`/materials/${id}`)
  }

  const handleSearch = () => {
    refreshList()
  }

  return (
    <div className="main-content">
      <div className="search-bar">
        <Input
          placeholder="搜索表情包或素材..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
          style={{ flex: 1 }}
          allowClear
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <div className="filter-bar">
        <Space wrap>
          <span>分类:</span>
          <Select
            placeholder="全部分类"
            style={{ width: 150 }}
            allowClear
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
          
          <span>标签:</span>
          <Select
            placeholder="全部标签"
            style={{ width: 150 }}
            allowClear
            value={selectedTag}
            onChange={(value) => setSelectedTag(value)}
            showSearch
            optionFilterProp="label"
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id} label={tag.name}>{tag.name}</Option>
            ))}
          </Select>

          <span>排序:</span>
          <Select
            value={sort}
            style={{ width: 120 }}
            onChange={(value) => setSort(value)}
          >
            <Option value="create_time">最新</Option>
            <Option value="download">下载最多</Option>
            <Option value="favorite">收藏最多</Option>
            <Option value="view">浏览最多</Option>
          </Select>
        </Space>
      </div>

      {refreshing ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : materials.length === 0 ? (
        <div className="empty-container">
          <Empty description="暂无素材" />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={materials.length}
          next={() => loadMaterials(page)}
          hasMore={hasMore}
          loader={
            <div className="loading-container" key="loader">
              <Spin />
            </div>
          }
        >
          <div className="waterfall-container">
            {materials.map(material => (
              <div
                key={material.id}
                className="material-card"
                onClick={() => handleCardClick(material.id)}
              >
                <img
                  src={material.thumbnailUrl}
                  alt={material.title}
                  className="material-thumbnail"
                />
                <div className="material-info">
                  <div className="material-title">{material.title}</div>
                  <div className="material-meta">
                    <div className="material-stats">
                      <span><EyeOutlined /> {material.viewCount}</span>
                      <span><DownloadOutlined /> {material.downloadCount}</span>
                      <span><HeartOutlined /> {material.favoriteCount}</span>
                    </div>
                  </div>
                  {material.tags && material.tags.length > 0 && (
                    <div className="tag-list">
                      {material.tags.slice(0, 3).map(tag => (
                        <Tag key={tag.id} color="blue">{tag.name}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}

export default HomePage
