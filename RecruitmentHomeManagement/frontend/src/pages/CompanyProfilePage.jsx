import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CompanyProfilePage() {
  const { company, fetchCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    scale: '',
    city: '',
    address: '',
    website: '',
    description: '',
  });
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        scale: company.scale || '',
        city: company.city || '',
        address: company.address || '',
        website: company.website || '',
        description: company.description || '',
      });
    } else {
      setIsNew(true);
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNew) {
        await api.post('/companies', formData);
      } else {
        await api.put('/companies', formData);
      }
      await fetchCurrentUser();
      setMessage({ success: true, text: '保存成功！' });
      setIsNew(false);
    } catch (err) {
      setMessage({ success: false, text: err.response?.data?.error || '保存失败' });
    } finally {
      setLoading(false);
    }
  };

  const scales = [
    '', '1-50人', '50-100人', '100-500人', '500-1000人', '1000-5000人', '5000-10000人', '10000人以上'
  ];

  return (
    <div className="user-page">
      <div className="container">
        <div className="page-header">
          <h2>{isNew ? '完善企业信息' : '企业信息'}</h2>
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
                <label>企业名称 *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>所属行业</label>
                <input
                  type="text"
                  name="industry"
                  className="form-control"
                  placeholder="例如：互联网"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>公司规模</label>
                <select
                  name="scale"
                  className="form-control"
                  value={formData.scale}
                  onChange={handleChange}
                >
                  {scales.map(s => (
                    <option key={s} value={s}>{s || '请选择'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>所在城市</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>公司地址</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>公司官网</label>
                <input
                  type="text"
                  name="website"
                  className="form-control"
                  placeholder="https://"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>企业简介</label>
              <textarea
                name="description"
                className="form-control"
                rows={5}
                placeholder="介绍一下公司文化、业务等..."
                value={formData.description}
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

export default CompanyProfilePage;
