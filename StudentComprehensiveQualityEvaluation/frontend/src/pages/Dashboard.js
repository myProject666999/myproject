import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  TrophyOutlined,
  StarOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import api from '../utils/request';

function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    grades: 0,
    rewards: 0,
    ability: 0,
    messages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, teachers, grades, rewards, ability, messages] = await Promise.all([
        api.get('/students?page=1&pageSize=1'),
        api.get('/teachers?page=1&pageSize=1'),
        api.get('/grades?page=1&pageSize=1'),
        api.get('/rewards?page=1&pageSize=1'),
        api.get('/ability?page=1&pageSize=1'),
        api.get('/messages?page=1&pageSize=1'),
      ]);

      setStats({
        students: students.data.total || 0,
        teachers: teachers.data.total || 0,
        grades: grades.data.total || 0,
        rewards: rewards.data.total || 0,
        ability: ability.data.total || 0,
        messages: messages.data.total || 0,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h2 className="page-title">欢迎使用学生综合素质测评管理系统</h2>
      
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.students}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="教师总数"
              value={stats.teachers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成绩记录"
              value={stats.grades}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="奖惩记录"
              value={stats.rewards}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="能力加分"
              value={stats.ability}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="留言消息"
              value={stats.messages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <h3>系统说明</h3>
        <p>欢迎 {user.real_name} 使用学生综合素质测评管理系统！</p>
        <p>当前角色：{user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}</p>
        <p>系统提供以下功能模块：</p>
        <ul>
          <li>个人资料管理：查看和修改个人信息，修改密码</li>
          <li>学生信息管理：学生基本信息的增删改查</li>
          <li>教师信息管理：教师基本信息的增删改查</li>
          <li>学生成绩管理：学生成绩的录入和管理</li>
          <li>奖惩管理：学生奖惩信息管理</li>
          <li>能力加分管理：学生能力加分项目管理</li>
          <li>综合素质测评管理：学生综合素质测评</li>
          <li>留言板管理：系统留言和回复</li>
        </ul>
      </Card>
    </div>
  );
}

export default Dashboard;
