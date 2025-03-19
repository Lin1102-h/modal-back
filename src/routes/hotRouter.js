const Router = require('@koa/router')
const HotController = require('../controllers/hotController')

const router = new Router({
  prefix: '/hot'
})

router.get('/list', HotController.getHotData)



module.exports = router 