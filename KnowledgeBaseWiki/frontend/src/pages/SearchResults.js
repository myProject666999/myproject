import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, Empty, Spin, Tag, message, Input } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { documentApi } from '../services/api';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const doSearch = useCallback(async (kw) => {
    setLoading(true);
    try {
      const res = await documentApi.search(kw);
      if (res.data.code === 200) {
        setResults(res.data.data);
      }
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get('keyword') || '';
    setKeyword(kw);
    if (kw) {
      doSearch(kw);
    }
  }, [location.search, doSearch]);

  const highlightKeyword = (text, keyword) => {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark style="background: #fff2a8; padding: 0 2px;">$1</mark>');
  };

  const getPreviewText = (content) => {
    if (!content) return '';
    const plainText = content.replace(/[#*`_[\]()]/g, '');
    return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  };

  return (
    <div style={{ padding: 48, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>
          <SearchOutlined /> 搜索结果
        </h1>
        <Input
          placeholder="搜索文档..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={(e) => navigate(`/search?keyword=${encodeURIComponent(e.target.value)}`)}
          size="large"
          style={{ maxWidth: 600 }}
        />
        <p style={{ color: '#999', marginTop: 8 }}>
          找到 {results.length} 个相关结果
        </p>
      </div>

      <Spin spinning={loading}>
        {results.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={results}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{ cursor: 'pointer', padding: 16, borderRadius: 8 }}
                onClick={() => navigate(`/space/${item.spaceId}/document/${item.id}`)}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <h3
                      style={{ margin: 0 }}
                      dangerouslySetInnerHTML={{ __html: highlightKeyword(item.title, keyword) }}
                    />
                  }
                  description={
                    <div>
                      <Tag color="blue">v{item.version}</Tag>
                      <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                        更新于 {item.updatedAt}
                      </span>
                    </div>
                  }
                />
                <p
                  style={{ color: '#666', margin: 0 }}
                  dangerouslySetInnerHTML={{
                    __html: highlightKeyword(getPreviewText(item.content), keyword)
                  }}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="未找到相关文档" />
        )}
      </Spin>
    </div>
  );
};

export default SearchResults;
