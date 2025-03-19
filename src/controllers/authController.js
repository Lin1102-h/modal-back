const jwt = require('jsonwebtoken')
const User = require('../models/user')

class AuthController {
  // 用户注册
  async register(ctx) {
    const { username, password } = ctx.request.body

    try {
      // 检查用户是否已存在
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        ctx.throw(400, '用户名已存在')
      }

      // 创建新用户
      const user = await User.create({
        username,
        password
      })

      // 生成token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      )

      ctx.body = {
        code: 200,
        data: {
          token,
          user: {
            id: user._id,
            username: user.username
          }
        },
        message: '注册成功'
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  // 用户登录
  async login(ctx) {
    const { username, password } = ctx.request.body
    try {
      // 查找用户
      const user = await User.findOne({ username })
      if (!user) {
        ctx.throw(401, '用户名或密码错误')
      }

      // 验证密码
      const isMatch = await user.comparePassword(password)
     
      if (!isMatch) {
        ctx.throw(401, '用户名或密码错误')
      }
      
      // 生成token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      )
      ctx.body = {
        code: 200,
        data: {
          token,
          user: {
            id: user._id,
            username: user.username
          }
        },
        message: '登录成功'
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  // 获取当前用户信息
  async getCurrentUser(ctx) {
    try {
      const user = await User.findById(ctx.state.user.id).select('-password')
      
      ctx.body = {
        code: 200,
        data: user,
        message: 'success'
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }
}

module.exports = new AuthController() 