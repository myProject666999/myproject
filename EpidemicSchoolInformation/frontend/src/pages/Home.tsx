import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const cards = [
    { 
      path: '/students', 
      title: '学生登记', 
      description: '管理学校学生的疫情信息登记',
      icon: '👨‍🎓',
      color: 'from-blue-500 to-blue-600',
      stats: '学生信息录入、查询、删除和模糊查询'
    },
    { 
      path: '/teachers', 
      title: '教职工登记', 
      description: '管理学校教职工的疫情信息登记',
      icon: '👩‍🏫',
      color: 'from-green-500 to-green-600',
      stats: '教职工信息录入、查询、删除和模糊查询'
    },
    { 
      path: '/visitors', 
      title: '外来人员登记', 
      description: '管理来访人员的疫情信息登记',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      stats: '外来人员信息录入、查询、删除和模糊查询'
    },
    { 
      path: '/blacklist', 
      title: '黑名单管理', 
      description: '管理禁止进入学校的人员名单',
      icon: '⚠️',
      color: 'from-red-500 to-red-600',
      stats: '黑名单新增、查看和删除'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎使用疫情学校信息登记管理系统
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            本系统用于学校疫情期间的人员信息登记管理，支持学生、教职工、外来人员的信息录入、查询和管理，
            并提供黑名单功能以确保校园安全。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <Link
              key={card.path}
              to={card.path}
              className="group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                  <span className="text-4xl">{card.icon}</span>
                  <h3 className="text-2xl font-bold mt-3">{card.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{card.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>进入管理</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">{card.stats}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">系统功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📝</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">信息登记</h4>
                <p className="text-gray-600 mt-1">支持各类人员的详细信息录入，包括基本信息和健康状况</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🔍</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">信息查询</h4>
                <p className="text-gray-600 mt-1">支持精确查询和模糊查询，快速定位所需信息</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-lg">🗑️</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">信息管理</h4>
                <p className="text-gray-600 mt-1">支持信息的删除和更新操作，保持数据准确性</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⚠️</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">黑名单管理</h4>
                <p className="text-gray-600 mt-1">管理禁止进入校园的人员名单，确保校园安全</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
