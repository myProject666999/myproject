import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Checkbox, Tabs, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '../utils/request';

const { Title } = Typography;
const { TabPane } = Tabs;

const modules = [
  { key: 'personal', label: '个人资料管理' },
  { key: 'rewards', label: '奖惩管理' },
  { key: 'messages', label: '留言板管理' },
  { key: 'ability', label: '能力加分管理' },
  { key: 'evaluation', label: '综合素质测评管理' },
  { key: 'grades', label: '学生成绩管理' },
  { key: 'teachers', label: '教师信息管理' },
  { key: 'students', label: '学生信息管理' },
];

const roles = [
  { key: 'admin', label: '管理员' },
  { key: 'teacher', label: '教师' },
  { key: 'student', label: '学生' },
];

function PermissionList() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('teacher');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const res = await api.get('/permissions');
      setPermissions(res.data || {});
    } catch (error) {
      console.error('Load permissions error:', error);
    }
  };

  const handlePermissionChange = (role, module, field, checked) => {
    setPermissions((prev) => {
      const rolePermissions = prev[role] || [];
      const updated = rolePermissions.map((p) => {
        if (p.module === module) {
          return { ...p, [field]: checked };
        }
        return p;
      });
      
      if (!updated.some((p) => p.module === module)) {
        updated.push({
          role,
          module,
          can_view: field === 'can_view' ? checked : false,
          can_create: field === 'can_create' ? checked : false,
          can_update: field === 'can_update' ? checked : false,
          can_delete: field === 'can_delete' ? checked : false,
        });
      }
      
      return { ...prev, [role]: updated };
    });
  };

  const handleSave = async (role) => {
    setLoading(true);
    try {
      const rolePermissions = permissions[role] || [];
      await api.post('/permissions/batch', {
        role,
        permissions: rolePermissions.map((p) => ({
          module: p.module,
          can_view: p.can_view,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete,
        })),
      });
      message.success('权限保存成功');
    } catch (error) {
      console.error('Save permissions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermission = (role, module) => {
    const rolePermissions = permissions[role] || [];
    return rolePermissions.find((p) => p.module === module) || {};
  };

  const renderPermissionTable = (role) => {
    const columns = [
      {
        title: '模块名称',
        dataIndex: 'label',
        key: 'label',
        width: 200,
      },
      {
        title: '查看',
        key: 'can_view',
        render: (_, record) => (
          <Checkbox
            checked={getPermission(role, record.key).can_view}
            onChange={(e) => handlePermissionChange(role, record.key, 'can_view', e.target.checked)}
          />
        ),
      },
      {
        title: '新增',
        key: 'can_create',
        render: (_, record) => (
          <Checkbox
            checked={getPermission(role, record.key).can_create}
            onChange={(e) => handlePermissionChange(role, record.key, 'can_create', e.target.checked)}
          />
        ),
      },
      {
        title: '修改',
        key: 'can_update',
        render: (_, record) => (
          <Checkbox
            checked={getPermission(role, record.key).can_update}
            onChange={(e) => handlePermissionChange(role, record.key, 'can_update', e.target.checked)}
          />
        ),
      },
      {
        title: '删除',
        key: 'can_delete',
        render: (_, record) => (
          <Checkbox
            checked={getPermission(role, record.key).can_delete}
            onChange={(e) => handlePermissionChange(role, record.key, 'can_delete', e.target.checked)}
          />
        ),
      },
    ];

    return (
      <div>
        <Table
          columns={columns}
          dataSource={modules}
          rowKey="key"
          pagination={false}
          bordered
          size="middle"
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleSave(role)}
            loading={loading}
          >
            保存权限配置
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="page-title">权限管理</h2>
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          动态权限配置
        </Title>
        <p style={{ color: '#666', marginBottom: 24 }}>
          配置不同角色的模块权限。管理员默认拥有所有权限。
        </p>
        
        <Tabs defaultActiveKey={activeRole} onChange={setActiveRole}>
          {roles.map((role) => (
            <TabPane tab={role.label} key={role.key}>
              {renderPermissionTable(role.key)}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}

export default PermissionList;
