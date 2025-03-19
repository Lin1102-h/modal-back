const Router = require('@koa/router')
const chatController = require('../controllers/chatController')

const router = new Router({
  prefix: '/chat'
})

router.post('/send', chatController.sendMessage)
router.get('/history', chatController.getHistory)
router.post('/create', chatController.createChat)
router.get('/balance', chatController.searchBalance)
router.post('/viodeSend', chatController.sendVideoMessage)



module.exports = router 