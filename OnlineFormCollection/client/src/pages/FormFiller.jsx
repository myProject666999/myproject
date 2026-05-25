import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formApi, submissionApi } from '../api/index.js';

export default function FormFiller() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    try {
      const res = await formApi.get(id);
      setForm(res.data);
    } catch (err) {
      alert('加载表单失败: ' + (err.response?.data?.error || err.message));
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setFormData({ ...formData, [`field_${fieldId}`]: value });
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    const key = `field_${fieldId}`;
    let current = formData[key];
    if (!Array.isArray(current)) current = [];
    if (checked) {
      current = [...current, option];
    } else {
      current = current.filter(v => v !== option);
    }
    setFormData({ ...formData, [key]: current });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const dataToSubmit = {};
      for (const [key, value] of Object.entries(formData)) {
        dataToSubmit[key] = value;
      }
      await submissionApi.submit(id, dataToSubmit);
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert('提交失败: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (fieldId) => {
    return errors.find(e => String(e.field) === String(fieldId));
  };

  if (loading) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>;
  }

  if (submitted) {
    return (
      <div className="form-fill-page">
        <div className="success-page">
          <div className="success-icon">✅</div>
          <div className="success-title">提交成功！</div>
          <div className="success-desc">感谢您的参与，您的数据已成功提交。</div>
          <Link to="/forms" className="btn btn-primary">返回首页</Link>
        </div>
      </div>
    );
  }

  if (!form) {
    return <div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-text">表单不存在</div></div>;
  }

  return (
    <div className="form-fill-page">
      <h1 className="form-fill-title">{form.title}</h1>
      {form.description && <p className="form-fill-desc">{form.description}</p>}

      <form onSubmit={handleSubmit}>
        {form.fields?.map(field => (
          <div key={field.id} className="fill-field">
            <label className="fill-field-label">
              {field.label}
              {field.required && <span className="field-required">*</span>}
            </label>

            {field.field_type === 'text' && (
              <input
                type="text"
                className={`fill-field-input ${getFieldError(field.id) ? 'error' : ''}`}
                placeholder={field.placeholder || `请输入${field.label}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.field_type === 'textarea' && (
              <textarea
                className={`fill-field-input field-textarea ${getFieldError(field.id) ? 'error' : ''}`}
                placeholder={field.placeholder || `请输入${field.label}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.field_type === 'number' && (
              <input
                type="number"
                className={`fill-field-input ${getFieldError(field.id) ? 'error' : ''}`}
                placeholder={field.placeholder || `请输入${field.label}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.field_type === 'email' && (
              <input
                type="email"
                className={`fill-field-input ${getFieldError(field.id) ? 'error' : ''}`}
                placeholder={field.placeholder || `请输入${field.label}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.field_type === 'date' && (
              <input
                type="date"
                className={`fill-field-input ${getFieldError(field.id) ? 'error' : ''}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.field_type === 'select' && (
              <select
                className={`fill-field-input ${getFieldError(field.id) ? 'error' : ''}`}
                value={formData[`field_${field.id}`] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                <option value="">请选择</option>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.field_type === 'radio' && (
              <div className="field-options">
                {field.options?.map((opt, i) => (
                  <label key={i} className="field-option">
                    <input
                      type="radio"
                      name={`field_${field.id}`}
                      value={opt}
                      checked={formData[`field_${field.id}`] === opt}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.field_type === 'checkbox' && (
              <div className="field-options">
                {field.options?.map((opt, i) => (
                  <label key={i} className="field-option">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={(formData[`field_${field.id}`] || []).includes(opt)}
                      onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {getFieldError(field.id) && (
              <div className="fill-field-error">{getFieldError(field.id).message}</div>
            )}
          </div>
        ))}

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  );
}
