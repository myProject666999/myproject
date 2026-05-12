const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json(error(err.message, 400));
  }

  if (err.name === 'UniqueConstraintError') {
    return res.status(400).json(error('数据已存在', 400));
  }

  res.status(500).json(error(err.message || '服务器内部错误', 500));
}

function notFound(req, res) {
  res.status(404).json(error('接口不存在', 404));
}

module.exports = {
  errorHandler,
  notFound,
};
