import { useState } from 'react';
import { Layout, Tabs } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import StudentManagement from './components/StudentManagement';
import CourseManagement from './components/CourseManagement';
import GradeManagement from './components/GradeManagement';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [activeKey, setActiveKey] = useState('students');

  const items = [
    {
      key: 'students',
      label: (
        <span>
          <UserOutlined />
          学生管理
        </span>
      ),
      children: <StudentManagement />,
    },
    {
      key: 'courses',
      label: (
        <span>
          <BookOutlined />
          课程管理
        </span>
      ),
      children: <CourseManagement />,
    },
    {
      key: 'grades',
      label: (
        <span>
          <TrophyOutlined />
          成绩管理
        </span>
      ),
      children: <GradeManagement />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          学生成绩管理系统
        </div>
      </Header>
      <Content style={{ padding: '24px', background: '#fff' }}>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={items}
          size="large"
        />
      </Content>
    </Layout>
  );
}

export default App;
