module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      code: err.code || 1,
      message: err.message || '服务器内部错误',
    };
  }
};
