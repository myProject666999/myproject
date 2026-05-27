import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { projectAPI, skillAPI, aboutAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [about, setAbout] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, skillsRes, aboutRes] = await Promise.all([
          projectAPI.getProjects({ featured: 'true', limit: 6 }),
          skillAPI.getSkills(),
          aboutAPI.getAbout(),
        ])
        setFeaturedProjects(projectsRes.data.data || projectsRes.data)
        setSkills(skillsRes.data)
        setAbout(aboutRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>首页 - 个人作品集</title>
        <meta name="description" content="欢迎来到我的个人作品集网站，展示我的项目作品和技能" />
      </Helmet>

      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              你好，我是 <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">{about.name || '设计师'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {about.title || '全栈开发者 / UI设计师'}
            </p>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {about.bio || '热爱创造美好的数字体验，专注于用户界面设计与前端开发。'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Link to="/projects" className="btn btn-primary">
                查看作品
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                联系我
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section className="section">
        <div className="container mx-auto px-4">
          <h2 className="section-title">精选作品</h2>
          <p className="section-subtitle">我最引以为豪的项目展示</p>
          <div className="grid grid-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/projects" className="btn btn-secondary">
              查看全部作品
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">技能专长</h2>
          <p className="section-subtitle">我掌握的技术栈和工具</p>
          <div className="grid grid-2 md:grid-cols-4 gap-6">
            {skills.slice(0, 8).map((skill) => (
              <div key={skill.id} className="card p-6 text-center">
                {skill.icon && (
                  <div className="text-4xl mb-4">{skill.icon}</div>
                )}
                <h3 className="font-bold mb-2">{skill.name}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 mt-2 block">{skill.level}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
