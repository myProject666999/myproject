class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(message, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "未授权访问") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "无权访问") {
    super(message, 403, "FORBIDDEN");
  }
}

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  console.error("[未处理错误]", err);

  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "服务器内部错误",
  });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
};
