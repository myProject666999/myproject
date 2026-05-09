import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MySeekersPage() {
  const navigate = useNavigate();
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    expected_position: '',
    salary_min: '',
    salary_max: '',
    city: '',
    experience: '',
    education: '',
    skills: '',
    description: '',
    resume: '',
  });

  const fetchSeekers = async () => {
    try {
      const response = await api.get('/seekers/my');
      setSeekers(response.data.seekers || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekers();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/seekers/${editId}`, formData);
      } else {
        await api.post('/seekers', formData);
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchSeekers();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleEdit = (seeker) => {
    setEditId(seeker.id);
    setFormData({
      title: seeker.title,
      expected_position: seeker.expected_position,
      salary_min: seeker.salary_min,
      salary_max: seeker.salary_max,
      city: seeker.city,
      experience: seeker.experience,
      education: seeker.education,
      skills: seeker.skills,
      description: seeker.description,
      resume: seeker.resume,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除吗？')) {
      try {
        await api.delete(`/seekers/${id}`);
        fetchSeekers();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      expected_position: '',
      salary_min: '',
      salary_max: '',
      city: '',
      experience: '',
      education: '',
      skills: '',
      description: '',
      resume: '',
    });
  };

  const getStatusText = (status) => {
    const map = { 0: '已下架', 1: '发布中' };
    return map[status] || '未知';
  };

  const getStatusClass = (status) => {
    return status === 1 ? 'tag-success' : 'tag-danger';
  };

  return (
    <div className="user-page">
      <div className="container">
        <div className="page-header">
          <h2>我的求职信息</h2>
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
          >
            {showForm ? '取消' : '发布求职'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h3 className="card-title">{editId ? '编辑求职信息' : '发布求职信息'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>简历标题 *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="例如：3年前端开发工程师求职"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>期望职位 *</label>
                  <input
                    type="text"
                    name="expected_position"
                    className="form-control"
                    placeholder="例如：前端开发工程师"
                    value={formData.expected_position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>期望城市</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="例如：杭州"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>期望薪资（K）</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      name="salary_min"
                      className="form-control"
                      placeholder="最低"
                      value={formData.salary_min}
                      onChange={handleInputChange}
                    />
                    <span style={{ lineHeight: 3 }}>-</span>
                    <input
                      type="number"
                      name="salary_max"
                      className="form-control"
                      placeholder="最高"
                      value={formData.salary_max}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>工作经验</label>
                  <select
                    name="experience"
                    className="form-control"
                    value={formData.experience}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="无经验">无经验</option>
                    <option value="1-3年">1-3年</option>
                    <option value="3-5年">3-5年</option>
                    <option value="5-10年">5-10年</option>
                    <option value="10年以上">10年以上</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>最高学历</label>
                  <select
                    name="education"
                    className="form-control"
                    value={formData.education}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="高中">高中</option>
                    <option value="大专">大专</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>技能专长</label>
                <input
                  type="text"
                  name="skills"
                  className="form-control"
                  placeholder="用逗号分隔，如：React,TypeScript,Node.js"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>简历内容</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={5}
                  placeholder="详细描述你的工作经历、项目经验等..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>简历链接（可选）</label>
                <input
                  type="text"
                  name="resume"
                  className="form-control"
                  placeholder="可填写在线简历或下载链接"
                  value={formData.resume}
                  onChange={handleInputChange}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editId ? '保存修改' : '发布'}
              </button>
              <button
                type="button"
                className="btn btn-default"
                style={{ marginLeft: 12 }}
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                取消
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">加载中...</div>
        ) : seekers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            <p>还没有求职信息</p>
            <p>点击上方按钮发布你的第一份求职信息</p>
          </div>
        ) : (
          <div className="job-list">
            {seekers.map((seeker) => (
              <div key={seeker.id} className="card">
                <div className="seeker-item">
                  <div className="seeker-main">
                    <h3>{seeker.title}</h3>
                    <span className={`tag ${getStatusClass(seeker.status)}`}>
                      {getStatusText(seeker.status)}
                    </span>
                  </div>
                  <div className="job-tags">
                    <span className="job-tag">{seeker.expected_position}</span>
                    <span className="job-tag">{seeker.city}</span>
                    {seeker.salary_min > 0 && (
                      <span className="job-tag">
                        {seeker.salary_min}-{seeker.salary_max}K
                      </span>
                    )}
                    <span className="job-tag">{seeker.experience}</span>
                    <span className="job-tag">{seeker.education}</span>
                  </div>
                  <div className="seeker-footer">
                    <span>浏览 {seeker.views} 次</span>
                    <div>
                      <button
                        className="btn btn-default"
                        onClick={() => handleEdit(seeker)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDelete(seeker.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySeekersPage;
