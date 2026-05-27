import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { aboutAPI, skillAPI } from '../services/api'

export default function About() {
  const [about, setAbout] = useState({})
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, skillsRes] = await Promise.all([
          aboutAPI.getAbout(),
          skillAPI.getSkills(),
        ])
        setAbout(aboutRes.data)
        setSkills(skillsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const skillCategories = [...new Set(skills.map(s => s.category))]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>关于我 - 个人作品集</title>
        <meta name="description" content="了解更多关于我的背景、技能和经验" />
      </Helmet>

      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-pink-100 flex-shrink-0">
                {about.avatar_url ? (
                  <img src={about.avatar_url} alt={about.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👤
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-4">{about.name || '你的名字'}</h1>
                <p className="text-xl text-indigo-600 mb-4">{about.title || '你的职业'}</p>
                <p className="text-gray-600 text-lg leading-relaxed">{about.bio || '介绍一下你自己...'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div className="card p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  联系方式
                </h3>
                <div className="space-y-4">
                  {about.email && (
                    <p className="flex items-center gap-3 text-gray-600">
                      <span className="text-gray-400">邮箱:</span> {about.email}
                    </p>
                  )}
                  {about.phone && (
                    <p className="flex items-center gap-3 text-gray-600">
                      <span className="text-gray-400">电话:</span> {about.phone}
                    </p>
                  )}
                  {about.location && (
                    <p className="flex items-center gap-3 text-gray-600">
                      <span className="text-gray-400">位置:</span> {about.location}
                    </p>
                  )}
                </div>
              </div>
              <div className="card p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  社交媒体
                </h3>
                <div className="flex flex-wrap gap-4">
                  {about.social_links ? (
                    JSON.parse(about.social_links).map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        {link.name}
                      </a>
                    ))
                  ) : (
                    <p className="text-gray-500">暂无社交媒体链接</p>
                  )}
                </div>
                {about.resume_url && (
                  <a href={about.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6 w-full">
                    下载简历
                  </a>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-12 text-center">技能专长</h2>
              {skillCategories.map((category) => (
                <div key={category} className="mb-12">
                  <h3 className="text-xl font-bold mb-6 text-indigo-600">{category || '其他'}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {skills.filter(s => s.category === category).map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
