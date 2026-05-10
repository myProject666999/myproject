import React from 'react'

const Table = ({ columns, data, loading = false, emptyText = '暂无数据' }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                style={{ width: col.width }}
                className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-50">
              {columns.map((col, colIndex) => (
                <td
                  key={col.key || colIndex}
                  className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
