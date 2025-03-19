async function errorHandler(ctx, next) {
  try {
    // 检查是否是 SSE 请求
    const isSSE = ctx.get('accept') === 'text/event-stream';
    await next()
    // 如果是 SSE 请求，不要处理响应
    if (isSSE) {
      return;
    }
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      code: err.status || 500,
      message: err.message || '服务器内部错误'
    }
    ctx.app.emit('error', err, ctx)
  }
}

module.exports = errorHandler 