function success(data = null, message = 'success') {
  return {
    code: 0,
    message,
    data,
  };
}

function error(message = 'error', code = 1, data = null) {
  return {
    code,
    message,
    data,
  };
}

function pagination(list, total, page, pageSize) {
  return {
    list,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(total / pageSize),
  };
}

module.exports = {
  success,
  error,
  pagination,
};
