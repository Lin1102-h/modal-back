const https = require("follow-redirects").https

class HotController {
  async getHotData(ctx) {
    try {
      let res1 = {}
      return new Promise((resolve, reject) => {
        const req = https.get("https://weibo.com/ajax/side/hotSearch", (res) => {
          let chunks = []
          res.on("data", (chunk) => {
            chunks.push(chunk)
          })

          res.on("end", (chunk) => {
            let body = Buffer.concat(chunks)
            res1 = body.toString()
            resolve(
              (ctx.body = {
                code: 200,
                data: JSON.parse(res1),
                message: "success",
              })
            )
          })

          res.on("error", (error) => {})
        })
        req.end()
      })

    } catch (error) {
      ctx.throw(500, error.message)
    }
  }
}

module.exports = new HotController()
