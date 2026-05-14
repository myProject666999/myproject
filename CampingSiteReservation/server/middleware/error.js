const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);
  
  if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ECONNREFUSED') {
    return res.status(500).json({
      success: false,
      message: '数据库连接失败，请检查数据库配置'
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    });
  }

  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
