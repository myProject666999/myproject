import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [applicantsJobId, setApplicantsJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    salary_min: '',
    salary_max: '',
    city: '',
    experience: '',
    education: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  const fetchJobs = async () => {
    try {
      const response = await api.get('/company/jobs');
      setJobs(response.data.jobs || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [navigate]);

  const loadApplicants = async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(response.data.applications || []);
      setApplicantsJobId(jobId);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        salary_min: Number(formData.salary_min) || 0,
        salary_max: Number(formData.salary_max) || 0,
      };

      if (editId) {
        await api.put(`/jobs/${editId}`, submitData);
      } else {
        await api.post('/jobs', submitData);
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleEdit = (job) => {
    setEditId(job.id);
    setFormData({
      title: job.title,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      city: job.city,
      experience: job.experience,
      education: job.education,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除吗？')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await api.put(`/company/applications/${appId}/status`, { status });
      loadApplicants(applicantsJobId);
    } catch (err) {
      alert('更新失败');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      salary_min: '',
      salary_max: '',
      city: '',
      experience: '',
      education: '',
      description: '',
      requirements: '',
      benefits: '',
    });
  };

  const getStatusText = (status) => {
    const map = { 0: '待处理', 1: '已查看', 2: '面试邀请', 3: '已录用' };
    return map[status] || '待处理';
  };

  const getStatusClass = (status) => {
    const map = { 0: 'tag-warning', 1: 'tag-info', 2: 'tag-success', 3: 'tag-success' };
    return map[status] || 'tag-warning';
  };

  const experiences = ['', '无经验', '1-3年', '3-5年', '5-10年', '10年以上'];
  const educations = ['', '高中', '大专', '本科', '硕士', '博士'];

  return (
    <div className="user-page">
      <div className="container">
        <div className="page-header">
          <h2>我的职位</h2>
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
          >
            {showForm ? '取消' : '发布职位'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h3 className="card-title">{editId ? '编辑职位' : '发布新职位'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>职位名称 *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>工作城市</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>薪资范围（K）*</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      name="salary_min"
                      className="form-control"
                      placeholder="最低"
                      value={formData.salary_min}
                      onChange={handleInputChange}
                      required
                    />
                    <span style={{ lineHeight: 3 }}>-</span>
                    <input
                      type="number"
                      name="salary_max"
                      className="form-control"
                      placeholder="最高"
                      value={formData.salary_max}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>工作经验</label>
                  <select
                    name="experience"
                    className="form-control"
                    value={formData.experience}
                    onChange={handleInputChange}
                  >
                    {experiences.map(e => (
                      <option key={e} value={e}>{e || '不限'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>学历要求</label>
                <select
                  name="education"
                  className="form-control"
                  value={formData.education}
                  onChange={handleInputChange}
                >
                  {educations.map(e => (
                    <option key={e} value={e}>{e || '不限'}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>职位描述</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>任职要求</label>
                <textarea
                  name="requirements"
                  className="form-control"
                  rows={4}
                  value={formData.requirements}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>福利待遇</label>
                <textarea
                  name="benefits"
                  className="form-control"
                  rows={3}
                  value={formData.benefits}
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
        ) : jobs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💼</div>
            <p>还没有发布职位</p>
            <p>点击上方按钮发布第一个职位</p>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <div key={job.id} className="card">
                <div className="seeker-item">
                  <div className="seeker-main">
                    <h3>{job.title}</h3>
                    <span className="job-salary">{job.salary_min}-{job.salary_max}K</span>
                  </div>
                  <div className="job-tags">
                    <span className="job-tag">{job.city}</span>
                    <span className="job-tag">{job.experience}</span>
                    <span className="job-tag">{job.education}</span>
                    <span className="job-tag">浏览 {job.views} 次</span>
                  </div>
                  <div className="seeker-footer">
                    <div />
                    <div>
                      <button
                        className="btn btn-default"
                        onClick={() => loadApplicants(job.id)}
                      >
                        查看应聘人员
                      </button>
                      <button
                        className="btn btn-default"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleEdit(job)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDelete(job.id)}
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

        {applicantsJobId && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <h3>应聘人员列表</h3>
              <button
                className="btn btn-default"
                onClick={() => { setApplicantsJobId(null); setApplicants([]); }}
              >
                关闭
              </button>
            </div>
            {applicants.length === 0 ? (
              <div className="empty" style={{ padding: '40px 20px' }}>
                暂无应聘人员
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>求职者</th>
                    <th>应聘时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app) => (
                    <tr key={app.id}>
                      <td>
                        {app.seeker?.user?.name || '未知'}
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {app.seeker?.title}
                        </div>
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`tag ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: 120, display: 'inline-block' }}
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, Number(e.target.value))}
                        >
                          <option value={0}>待处理</option>
                          <option value={1}>已查看</option>
                          <option value={2}>面试邀请</option>
                          <option value={3}>已录用</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyJobsPage;
