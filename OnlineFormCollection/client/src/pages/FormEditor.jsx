import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formApi } from '../api/index.js';

const FIELD_TYPES = [
  { type: 'text', label: '单行文本', icon: '📝' },
  { type: 'textarea', label: '多行文本', icon: '📄' },
  { type: 'number', label: '数字', icon: '🔢' },
  { type: 'email', label: '邮箱', icon: '📧' },
  { type: 'date', label: '日期', icon: '📅' },
  { type: 'select', label: '下拉选择', icon: '▼' },
  { type: 'radio', label: '单选', icon: '🔘' },
  { type: 'checkbox', label: '多选', icon: '☑️' }
];

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [draggedType, setDraggedType] = useState(null);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);

  const isNew = !id;

  useEffect(() => {
    if (!isNew) {
      loadForm();
    } else {
      setForm({ title: '未命名表单', description: '', status: 'draft', max_submissions: 0 });
      setFields([]);
    }
  }, [id]);

  const loadForm = async () => {
    try {
      const res = await formApi.get(id);
      setForm(res.data);
      setFields(res.data.fields || []);
    } catch (err) {
      alert('加载表单失败: ' + (err.response?.data?.error || err.message));
      navigate('/forms');
    }
  };

  const handlePaletteDragStart = (e, fieldType) => {
    setDraggedType(fieldType);
    setDraggedFieldId(null);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', fieldType.type);
  };

  const handleFieldDragStart = (e, fieldId) => {
    setDraggedFieldId(fieldId);
    setDraggedType(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(fieldId));
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedFieldId ? 'move' : 'copy';
  };

  const handleFieldDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = draggedFieldId ? 'move' : 'copy';
  };

  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedFieldId) {
      setDraggedFieldId(null);
      return;
    }

    if (draggedType) {
      await addFieldToForm(fields.length);
      setDraggedType(null);
    }
  };

  const handleFieldDrop = async (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedFieldId) {
      const fromIndex = fields.findIndex(f => f.id === draggedFieldId);
      if (fromIndex === targetIndex) {
        setDraggedFieldId(null);
        return;
      }
      const newFields = [...fields];
      const [moved] = newFields.splice(fromIndex, 1);
      const insertIndex = fromIndex < targetIndex ? targetIndex : targetIndex;
      newFields.splice(insertIndex, 0, moved);
      const orders = newFields.map((f, i) => ({ id: f.id, sort_order: i }));
      setFields(newFields);
      setDraggedFieldId(null);
      if (form && form.id) {
        try {
          await formApi.reorderFields(form.id, orders);
        } catch (err) {
          console.error('排序保存失败:', err);
        }
      }
    } else if (draggedType) {
      await addFieldToForm(targetIndex);
      setDraggedType(null);
    }
  };

  const addFieldToForm = async (index) => {
    if (!draggedType) return;

    const newField = {
      id: Date.now(),
      form_id: form?.id,
      field_type: draggedType.type,
      label: draggedType.label,
      placeholder: '',
      required: false,
      options: ['选项1', '选项2'],
      validation: {},
      sort_order: index,
      isNew: true
    };

    const newFields = [...fields];
    newFields.splice(index, 0, newField);
    setFields(newFields);
    setSelectedFieldId(newField.id);

    if (form && form.id) {
      try {
        const res = await formApi.addField(form.id, {
          field_type: draggedType.type,
          label: draggedType.label,
          placeholder: '',
          required: false,
          options: ['选项1', '选项2'],
          validation: {},
          sort_order: index
        });
        newField.id = res.data.id;
        newField.isNew = false;
        setFields([...newFields]);
      } catch (err) {
        console.error('添加字段失败:', err);
      }
    }
  };

  const handleSelectField = (fieldId) => {
    setSelectedFieldId(fieldId);
  };

  const handleDeleteField = async (fieldId, e) => {
    e.stopPropagation();
    if (form && form.id) {
      try {
        await formApi.deleteField(fieldId);
      } catch (err) {
        console.error('删除字段失败:', err);
      }
    }
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleUpdateField = async (fieldId, updates) => {
    const newFields = fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    setFields(newFields);

    const field = fields.find(f => f.id === fieldId);
    if (form && form.id && !field?.isNew) {
      try {
        await formApi.updateField(fieldId, updates);
      } catch (err) {
        console.error('更新字段失败:', err);
      }
    }
  };

  const handleFormUpdate = (updates) => {
    setForm({ ...form, ...updates });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await formApi.create({
          title: form.title,
          description: form.description,
          status: form.status,
          max_submissions: form.max_submissions
        });
        const savedForm = res.data;
        for (const field of fields) {
          await formApi.addField(savedForm.id, {
            field_type: field.field_type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            validation: field.validation,
            sort_order: field.sort_order
          });
        }
        navigate(`/forms/${savedForm.id}/edit`);
      } else {
        await formApi.update(form.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          max_submissions: form.max_submissions
        });
      }
      alert('保存成功');
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form) {
      alert('表单未初始化');
      return;
    }
    if (fields.length === 0) {
      alert('请至少添加一个字段');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await formApi.create({
          title: form.title,
          description: form.description,
          status: 'published',
          max_submissions: form.max_submissions
        });
        const savedForm = res.data;
        for (const field of fields) {
          await formApi.addField(savedForm.id, {
            field_type: field.field_type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            validation: field.validation,
            sort_order: field.sort_order
          });
        }
        setForm({ ...savedForm, status: 'published' });
        alert('发布成功！');
        navigate(`/forms/${savedForm.id}/edit`);
      } else {
        await formApi.update(form.id, {
          title: form.title,
          description: form.description,
          status: 'published',
          max_submissions: form.max_submissions
        });
        setForm({ ...form, status: 'published' });
        alert('发布成功！');
      }
    } catch (err) {
      alert('发布失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const renderFieldPreview = (field) => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return <input type={field.field_type} className="field-input" placeholder={field.placeholder || `请输入${field.label}`} disabled />;
      case 'textarea':
        return <textarea className="field-textarea" placeholder={field.placeholder || `请输入${field.label}`} disabled />;
      case 'select':
        return (
          <select className="field-input" disabled>
            <option value="">请选择</option>
            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className="field-options">
            {field.options?.map((opt, i) => (
              <label key={i} className="field-option">
                <input type="radio" disabled /> {opt}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="field-options">
            {field.options?.map((opt, i) => (
              <label key={i} className="field-option">
                <input type="checkbox" disabled /> {opt}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleOptionChange = (fieldId, index, value) => {
    const field = fields.find(f => f.id === fieldId);
    const newOptions = [...field.options];
    newOptions[index] = value;
    handleUpdateField(fieldId, { options: newOptions });
  };

  const handleAddOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    handleUpdateField(fieldId, { options: [...field.options, `选项${field.options.length + 1}`] });
  };

  const handleDeleteOption = (fieldId, index) => {
    const field = fields.find(f => f.id === fieldId);
    if (field.options.length <= 1) return;
    const newOptions = field.options.filter((_, i) => i !== index);
    handleUpdateField(fieldId, { options: newOptions });
  };

  if (!form) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isNew ? '新建表单' : '编辑表单'}</h1>
        <div className="toolbar">
          <button className="btn btn-default" onClick={() => navigate('/forms')}>返回</button>
          <button className="btn btn-default" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button className="btn btn-primary" onClick={handlePublish} disabled={saving}>
            {form.status === 'published' ? '更新发布' : '发布'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="field-palette">
          <div className="palette-title">字段类型</div>
          {FIELD_TYPES.map(ft => (
            <div
              key={ft.type}
              className="palette-item"
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, ft)}
              onDragEnd={() => setDraggedType(null)}
            >
              <span className="palette-icon">{ft.icon}</span>
              <span>{ft.label}</span>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '12px', background: '#f5f7fa', borderRadius: '4px', fontSize: '12px', color: '#909399' }}>
            💡 拖拽左侧字段到中间画布添加字段
          </div>
        </div>

        <div
          className="editor-canvas"
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <input
            type="text"
            className="canvas-title-input"
            value={form.title}
            onChange={(e) => handleFormUpdate({ title: e.target.value })}
            placeholder="请输入表单标题"
          />
          <textarea
            className="canvas-desc-input"
            value={form.description}
            onChange={(e) => handleFormUpdate({ description: e.target.value })}
            placeholder="请输入表单描述（可选）"
          />

          {fields.length === 0 && (
            <div className="canvas-empty">
              <div className="canvas-empty-icon">📋</div>
              <div>从左侧拖拽字段到此处开始创建表单</div>
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`field-item ${selectedFieldId === field.id ? 'selected' : ''} ${draggedFieldId === field.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleFieldDragStart(e, field.id)}
              onDragOver={handleFieldDragOver}
              onDrop={(e) => handleFieldDrop(e, index)}
              onClick={() => handleSelectField(field.id)}
            >
              <div className="field-actions">
                <button
                  className="field-action-btn delete"
                  onClick={(e) => handleDeleteField(field.id, e)}
                >✕</button>
              </div>
              <div className="field-label">
                {field.label}
                {field.required && <span className="field-required">*</span>}
              </div>
              {renderFieldPreview(field)}
            </div>
          ))}
        </div>

        <div className="field-properties">
          <div className="palette-title">属性设置</div>

          {!selectedField && (
            <div style={{ color: '#909399', fontSize: '13px', marginTop: '12px' }}>
              请选择一个字段进行属性设置
            </div>
          )}

          {selectedField && (
            <>
              <div className="prop-group">
                <label className="prop-label">字段标签</label>
                <input
                  type="text"
                  className="prop-input"
                  value={selectedField.label}
                  onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                />
              </div>

              {(selectedField.field_type === 'text' || selectedField.field_type === 'textarea' || selectedField.field_type === 'email' || selectedField.field_type === 'number') && (
                <div className="prop-group">
                  <label className="prop-label">占位文本</label>
                  <input
                    type="text"
                    className="prop-input"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                  />
                </div>
              )}

              <div className="prop-group">
                <label className="prop-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                  />
                  必填字段
                </label>
              </div>

              {(selectedField.field_type === 'select' || selectedField.field_type === 'radio' || selectedField.field_type === 'checkbox') && (
                <div className="prop-group">
                  <label className="prop-label">选项</label>
                  <div className="option-editor">
                    {selectedField.options?.map((opt, i) => (
                      <div key={i} className="option-item">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(selectedField.id, i, e.target.value)}
                        />
                        <button
                          className="option-delete"
                          onClick={() => handleDeleteOption(selectedField.id, i)}
                        >✕</button>
                      </div>
                    ))}
                    <button className="add-option-btn" onClick={() => handleAddOption(selectedField.id)}>
                      + 添加选项
                    </button>
                  </div>
                </div>
              )}

              {(selectedField.field_type === 'text' || selectedField.field_type === 'textarea') && (
                <>
                  <div className="prop-group">
                    <label className="prop-label">最小长度</label>
                    <input
                      type="number"
                      className="prop-input"
                      value={selectedField.validation?.minLength || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                    />
                  </div>
                  <div className="prop-group">
                    <label className="prop-label">最大长度</label>
                    <input
                      type="number"
                      className="prop-input"
                      value={selectedField.validation?.maxLength || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                    />
                  </div>
                  <div className="prop-group">
                    <label className="prop-label">正则表达式</label>
                    <input
                      type="text"
                      className="prop-input"
                      value={selectedField.validation?.pattern || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, pattern: e.target.value || undefined }
                      })}
                      placeholder="例如: ^[a-zA-Z]+$"
                    />
                  </div>
                </>
              )}

              {selectedField.field_type === 'number' && (
                <>
                  <div className="prop-group">
                    <label className="prop-label">最小值</label>
                    <input
                      type="number"
                      className="prop-input"
                      value={selectedField.validation?.min ?? ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, min: e.target.value !== '' ? Number(e.target.value) : undefined }
                      })}
                    />
                  </div>
                  <div className="prop-group">
                    <label className="prop-label">最大值</label>
                    <input
                      type="number"
                      className="prop-input"
                      value={selectedField.validation?.max ?? ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, max: e.target.value !== '' ? Number(e.target.value) : undefined }
                      })}
                    />
                  </div>
                </>
              )}

              {selectedField.field_type === 'date' && (
                <>
                  <div className="prop-group">
                    <label className="prop-label">最早日期</label>
                    <input
                      type="date"
                      className="prop-input"
                      value={selectedField.validation?.minDate || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, minDate: e.target.value || undefined }
                      })}
                    />
                  </div>
                  <div className="prop-group">
                    <label className="prop-label">最晚日期</label>
                    <input
                      type="date"
                      className="prop-input"
                      value={selectedField.validation?.maxDate || ''}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        validation: { ...selectedField.validation, maxDate: e.target.value || undefined }
                      })}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #ebeef5' }}>
            <div className="palette-title">表单设置</div>
            <div className="prop-group" style={{ marginTop: '12px' }}>
              <label className="prop-label">最大提交次数 (0 为不限)</label>
              <input
                type="number"
                className="prop-input"
                value={form.max_submissions || 0}
                onChange={(e) => handleFormUpdate({ max_submissions: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
