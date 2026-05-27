import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { projectAPI, categoryAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          projectAPI.getProjects({ category: selectedCategory, search: searchQuery }),
          categoryAPI.getCategories(),
        ])
        setProjects(projectsRes.data.data || projectsRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCategory, searchQuery])

  return (
    <>
      <Helmet>
        <title>作品列表 - 个人作品集</title>
        <meta name="description" content="浏览我的所有项目作品" />
      </Helmet>

      <section className="section pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">作品集</h1>
          <p className="text-gray-600 text-center mb-12">探索我创造的项目</p>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索项目..."
                className="form-input pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('')}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500">暂无项目</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
