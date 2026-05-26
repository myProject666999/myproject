import type { Response } from 'express';
import type { ApiResponse } from '../../shared/types.js';

export function success<T>(res: Response, data?: T, message = 'success'): Response<ApiResponse<T>> {
  return res.json({
    code: 0,
    message,
    data,
  });
}

export function error(res: Response, message: string, code = 1, status = 400): Response<ApiResponse> {
  return res.status(status).json({
    code,
    message,
  });
}

export function unauthorized(res: Response, message = '未授权访问'): Response<ApiResponse> {
  return error(res, message, 401, 401);
}

export function forbidden(res: Response, message = '禁止访问'): Response<ApiResponse> {
  return error(res, message, 403, 403);
}

export function notFound(res: Response, message = '资源不存在'): Response<ApiResponse> {
  return error(res, message, 404, 404);
}
