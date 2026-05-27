import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Layout, Menu, Input, Button, Space, Dropdown, Avatar, message } from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  FolderOutlined,
  FileTextOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import DocumentTree from './components/DocumentTree';
import HomePage from './pages/HomePage';
import DocumentView from './pages/DocumentView';
import DocumentEdit from './pages/DocumentEdit';
import SearchResults from './pages/SearchResults';
import RecycleBin from './pages/RecycleBin';
import { spaceApi } from './services/api';

const { Header, Sider, Content } = Layout;

function App() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (spaceId && spaces.length > 0) {
      const space = spaces.find(s => s.id === parseInt(spaceId));
      setCurrentSpace(space);
    }
  }, [spaceId, spaces]);

  const loadSpaces = async () => {
    try {
      const res = await spaceApi.getMySpaces();
      if (res.data.code === 200) {
        setSpaces(res.data.data);
        if (res.data.data.length > 0 && !spaceId) {
          navigate(`/space/${res.data.data[0].id}`);
        }
      }
    } catch (error) {
      message.error('加载空间列表失败');
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'recycle') {
      navigate(`/space/${spaceId}/recycle`);
    }
  };

  return (
    <Layout className="app-layout">
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
            <BookOutlined /> 知识库Wiki
          </div>
          <Input
            placeholder="搜索文档..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearch}
            allowClear
          />
        </div>
        <Space>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: '个人中心', icon: <UserOutlined /> },
                { key: 'settings', label: '系统设置' },
                { type: 'divider' },
                { key: 'logout', label: '退出登录' }
              ]
            }}
          >
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </Space>
      </Header>
      <Layout>
        <Sider
          width={280}
          className="sidebar"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
        >
          {!collapsed && currentSpace && (
            <DocumentTree spaceId={currentSpace.id} />
          )}
        </Sider>
        <Content className="main-content">
          <Routes>
            <Route path="/" element={<HomePage spaces={spaces} />} />
            <Route path="/space/:spaceId" element={<DocumentView />} />
            <Route path="/space/:spaceId/document/:docId" element={<DocumentView />} />
            <Route path="/space/:spaceId/edit/:docId" element={<DocumentEdit />} />
            <Route path="/space/:spaceId/new" element={<DocumentEdit />} />
            <Route path="/space/:spaceId/recycle" element={<RecycleBin />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
