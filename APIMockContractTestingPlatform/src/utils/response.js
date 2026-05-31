function success(res, data, message = 'success', statusCode = 200) {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
}

function paginate(res, data, total, page, pageSize, message = 'success') {
  res.status(200).json({
    status: 'success',
    message,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}

module.exports = {
  success,
  paginate
};
