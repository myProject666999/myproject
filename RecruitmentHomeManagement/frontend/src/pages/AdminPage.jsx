import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ role: '', keyword: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user?.role, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stats':
          const statsRes = await api.get('/admin/stats');
          setStats(statsRes.data.stats);
          break;
        case 'users':
          const usersRes = await api.get('/admin/users', { params: filters });
          setUsers(usersRes.data.users);
          break;
        case 'companies':
          const companiesRes = await api.get('/admin/companies');
          setCompanies(companiesRes.data.companies);
          break;
        case 'jobs':
          const jobsRes = await api.get('/admin/jobs');
          setJobs(jobsRes.data.jobs);
          break;
        case 'blogs':
          const blogsRes = await api.get('/admin/blogs');
          setBlogs(blogsRes.data.blogs);
          break;
        case 'seekers':
          const seekersRes = await api.get('/admin/seekers');
          setSeekers(seekersRes.data.seekers);
          break;
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('确定要删除该用户吗？')) {
      await api.delete(`/admin/users/${id}`);
      loadData();
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('确定要删除该企业吗？')) {
      await api.delete(`/admin/companies/${id}`);
      loadData();
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('确定要删除该职位吗？')) {
      await api.delete(`/admin/jobs/${id}`);
      loadData();
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm('确定要删除该文章吗？')) {
      await api.delete(`/admin/blogs/${id}`);
      loadData();
    }
  };

  const handleDeleteSeeker = async (id) => {
    if (window.confirm('确定要删除该求职信息吗？')) {
      await api.delete(`/admin/seekers/${id}`);
      loadData();
    }
  };

  const handleReviewBlog = async (id, status) => {
    const reviewMsg = status === 2 ? '' : window.prompt('请输入审核不通过原因：', '内容不符合规范');
    if (status === 3 && !reviewMsg) return;
    
    await api.put(`/admin/blogs/${id}/review`, {
      status,
      review_msg: reviewMsg || '',
    });
    loadData();
  };

  const getBlogStatusText = (status) => {
    const map = { 1: '待审核', 2: '已通过', 3: '已驳回' };
    return map[status] || '未知';
  };

  const getBlogStatusClass = (status) => {
    const map = { 1: 'tag-warning', 2: 'tag-success', 3: 'tag-danger' };
    return map[status] || '';
  };

  const menuItems = [
    { key: 'stats', label: '📊 数据统计' },
    { key: 'users', label: '👤 用户管理' },
    { key: 'companies', label: '🏢 企业管理' },
    { key: 'jobs', label: '💼 职位管理' },
    { key: 'seekers', label: '📝 求职信息管理' },
    { key: 'blogs', label: '📚 论坛监督' },
  ];

  const renderContent = () => {
    if (loading) return <div className="loading">加载中...</div>;

    switch (activeTab) {
      case 'stats':
        return (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.user_count || 0}</div>
              <div className="stat-label">求职者数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.company_count || 0}</div>
              <div className="stat-label">企业数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.job_count || 0}</div>
              <div className="stat-label">职位数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.seeker_count || 0}</div>
              <div className="stat-label">求职信息数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.blog_count || 0}</div>
              <div className="stat-label">博客文章数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#ff4d4f' }}>
                {stats.pending_blog_count || 0}
              </div>
              <div className="stat-label">待审核文章</div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <div className="search-card" style={{ marginBottom: 20 }}>
              <div className="search-row">
                <select
                  className="form-control"
                  value={filters.role}
                  onChange={(e) => { setFilters(f => ({ ...f, role: e.target.value })); }}
                >
                  <option value="">全部角色</option>
                  <option value="user">求职者</option>
                  <option value="company">企业</option>
                  <option value="admin">管理员</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="搜索用户名/姓名/邮箱"
                  value={filters.keyword}
                  onChange={(e) => { setFilters(f => ({ ...f, keyword: e.target.value })); }}
                />
                <button className="btn btn-primary" onClick={loadData}>
                  搜索
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>姓名</th>
                  <th>邮箱</th>
                  <th>角色</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className={`tag ${u.role === 'admin' ? 'tag-danger' : u.role === 'company' ? 'tag-info' : 'tag-success'}`}>
                        {u.role === 'admin' ? '管理员' : u.role === 'company' ? '企业' : '求职者'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'companies':
        return (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>企业名称</th>
                <th>行业</th>
                <th>城市</th>
                <th>规模</th>
                <th>知名企业</th>
                <th>认证状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.industry || '-'}</td>
                  <td>{c.city || '-'}</td>
                  <td>{c.scale || '-'}</td>
                  <td>
                    <span className={`tag ${c.is_famous ? 'tag-success' : 'tag-warning'}`}>
                      {c.is_famous ? '是' : '否'}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${c.verified ? 'tag-success' : 'tag-warning'}`}>
                      {c.verified ? '已认证' : '未认证'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCompany(c.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'jobs':
        return (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>职位名称</th>
                <th>企业</th>
                <th>城市</th>
                <th>薪资</th>
                <th>浏览量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.id}</td>
                  <td>{j.title}</td>
                  <td>{j.company?.name || '-'}</td>
                  <td>{j.city}</td>
                  <td>{j.salary_min}-{j.salary_max}K</td>
                  <td>{j.views}</td>
                  <td>
                    <span className={`tag ${j.status === 1 ? 'tag-success' : 'tag-danger'}`}>
                      {j.status === 1 ? '正常' : '下架'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'seekers':
        return (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>简历标题</th>
                <th>求职者</th>
                <th>期望职位</th>
                <th>城市</th>
                <th>浏览量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {seekers.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.title}</td>
                  <td>{s.user?.name || '-'}</td>
                  <td>{s.expected_position || '-'}</td>
                  <td>{s.city || '-'}</td>
                  <td>{s.views}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSeeker(s.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'blogs':
        return (
          <div>
            {blogs.map((b) => (
              <div key={b.id} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: 8 }}>{b.title}</h3>
                    <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 12 }}>
                      作者：{b.user?.name || '匿名'} | 发布于：{new Date(b.createdAt).toLocaleDateString()}
                      | 浏览：{b.views} | 点赞：{b.likes}
                    </div>
                    <p style={{ color: '#595959', marginBottom: 12 }}>
                      {b.content.length > 200 ? b.content.substring(0, 200) + '...' : b.content}
                    </p>
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <span className={`tag ${getBlogStatusClass(b.status)}`} style={{ marginBottom: 12, display: 'block' }}>
                      {getBlogStatusText(b.status)}
                    </span>
                    {b.status === 1 && (
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleReviewBlog(b.id, 2)}>
                          通过
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReviewBlog(b.id, 3)}>
                          驳回
                        </button>
                      </div>
                    )}
                    {b.review_msg && (
                      <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 8 }}>
                        审核意见：{b.review_msg}
                      </div>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => handleDeleteBlog(b.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h2>管理后台</h2>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            <ul className="admin-menu">
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  className={`admin-menu-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
