const Router = require('@koa/router')
const authController = require('../controllers/authController')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')
const { authSchema } = require('../schemas/auth')

const router = new Router({
  prefix: '/user'
})

router.post('/register', validate(authSchema.register), authController.register)
router.post('/login', validate(authSchema.login), authController.login)
router.get('/me', auth, authController.getCurrentUser)

module.exports = router 