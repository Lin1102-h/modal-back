const Joi = require('joi')

const validate = (schema) => {
  return async (ctx, next) => {
    try {
      if (schema.params) {
        ctx.params = await schema.params.validateAsync(ctx.params)
      }
      if (schema.query) {
        ctx.query = await schema.query.validateAsync(ctx.query)
      }
      if (schema.body) {
        ctx.request.body = await schema.body.validateAsync(ctx.request.body)
      }
      await next()
    } catch (err) {
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: err.message
      }
    }
  }
}

module.exports = validate 