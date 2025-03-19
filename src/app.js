const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const logger = require('koa-logger')
const jwt = require('koa-jwt')
const path = require('path')
const static = require('koa-static')
require('dotenv').config()

const connectDB = require('./config/db')
const { chatRouter, authRouter, hotRouter } = require('./routes')
const errorHandler = require('./middleware/errorHandler')

// 连接数据库
connectDB()

const app = new Koa()
const router = new Router()

// 使用中间件
app.use(logger())
app.use(cors())
app.use(bodyParser())
app.use(errorHandler)

// JWT中间件
// app.use(jwt({ secret: process.env.JWT_SECRET }).unless({
//   path: [/^\/api\/auth\/(login|register)$/]
// }))

// 配置静态资源目录
app.use(static(path.join(__dirname, '../public')))
// 配置前端打包后的目录
app.use(static(path.join(__dirname, '../dist')))

// 处理前端路由
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/api')) {
    await next()
  } else {
    ctx.type = 'html'
    ctx.body = require('fs').createReadStream(path.join(__dirname, '../dist/index.html'))
  }
})

// 注册路由
router.use('/api', authRouter.routes())
router.use('/api', chatRouter.routes())
router.use('/api', hotRouter.routes())
app.use(router.routes())
app.use(router.allowedMethods())

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

module.exports = app 