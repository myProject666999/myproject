import { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'
import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link to={`/projects/${project.slug}`} className="card group">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {project.image_url ? (
          <>
            <img
              src={project.image_url}
              alt={project.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
            <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {project.featured && (
          <span className="absolute top-3 right-3 badge bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            精选
          </span>
        )}
      </div>
      <div className="p-6">
        {project.category && (
          <span className="badge mb-3">{project.category.name}</span>
        )}
        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {project.description}
        </p>
        {project.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.split(',').slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
