const jwt = require('jsonwebtoken')

const auth = async (ctx, next) => {
  try {
    const token = ctx.header.authorization?.split(' ')[1]
    if (!token) {
      ctx.throw(401, '未提供token')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    ctx.state.user = decoded
    await next()
  } catch (err) {
    ctx.throw(401, 'token无效')
  }
}

module.exports = auth 