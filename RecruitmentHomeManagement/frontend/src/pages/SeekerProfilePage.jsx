import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/user.css';

function SeekerProfilePage() {
  const { user, updateUser, fetchCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    skills: user?.skills || '',
    experience: user?.experience || 0,
    education: user?.education || '',
    salary_min: user?.salary_min || 0,
    salary_max: user?.salary_max || 0,
    city: user?.city || '',
    profile: user?.profile || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills,
        experience: Number(formData.experience),
        education: formData.education,
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        city: formData.city,
        profile: formData.profile,
      });
      await fetchCurrentUser();
      setMessage({ success: true, text: '保存成功！' });
    } catch (err) {
      setMessage({ success: false, text: err.response?.data?.error || '保存失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-page">
      <div className="container">
        <div className="page-header">
          <h2>个人信息</h2>
        </div>

        <div className="card">
          {message && (
            <div className={message.success ? 'success-message' : 'error-message'}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>手机号</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>所在城市</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="例如：杭州"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>技能专长</label>
                <input
                  type="text"
                  name="skills"
                  className="form-control"
                  placeholder="用逗号分隔，如：Java,Go,Python"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>最高学历</label>
                <select
                  name="education"
                  className="form-control"
                  value={formData.education}
                  onChange={handleChange}
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

            <div className="form-row">
              <div className="form-group">
                <label>工作年限（年）</label>
                <input
                  type="number"
                  name="experience"
                  className="form-control"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
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
                    onChange={handleChange}
                  />
                  <span style={{ lineHeight: 3 }}>-</span>
                  <input
                    type="number"
                    name="salary_max"
                    className="form-control"
                    placeholder="最高"
                    value={formData.salary_max}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>个人简介</label>
              <textarea
                name="profile"
                className="form-control"
                rows={4}
                placeholder="介绍一下你的工作经历和特长..."
                value={formData.profile}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SeekerProfilePage;
