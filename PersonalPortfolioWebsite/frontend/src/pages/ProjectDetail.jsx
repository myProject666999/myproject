import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { projectAPI } from '../services/api'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectAPI.getProject(slug)
        setProject(res.data)
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">项目不存在</h1>
        <Link to="/projects" className="btn btn-primary">返回作品列表</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{project.title} - 个人作品集</title>
        <meta name="description" content={project.description} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={project.description} />
        {project.image_url && <meta property="og:image" content={project.image_url} />}
      </Helmet>

      <article className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回作品列表
          </Link>

          <header className="max-w-4xl mx-auto mb-12">
            {project.category && (
              <span className="badge mb-4">{project.category.name}</span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{project.description}</p>
            <div className="flex flex-wrap gap-3">
              {project.tags && project.tags.split(',').map((tag, i) => (
                <span key={i} className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </header>

          {project.image_url && (
            <div className="max-w-5xl mx-auto mb-12">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full rounded-xl shadow-xl"
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4 mb-12">
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  访问项目
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  GitHub 仓库
                </a>
              )}
            </div>

            {project.content && (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{project.content}</ReactMarkdown>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
              <p>发布于 {new Date(project.created_at).toLocaleDateString('zh-CN')}</p>
              <p>浏览次数：{project.views}</p>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
