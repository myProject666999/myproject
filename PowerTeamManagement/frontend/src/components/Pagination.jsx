import React from 'react'

const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-gray-600">
        共 {total} 条记录，第 {page} / {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="input w-auto py-1"
        >
          <option value="10">10条/页</option>
          <option value="20">20条/页</option>
          <option value="50">50条/页</option>
        </select>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 ${page === 1 ? 'bg-blue-500 text-white' : ''}`}
            >
              1
            </button>
            {start > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded hover:bg-gray-100 ${
              page === p ? 'bg-blue-500 text-white border-blue-500' : ''
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                page === totalPages ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  )
}

export default Pagination
