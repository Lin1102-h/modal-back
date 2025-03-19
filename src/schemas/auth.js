const Joi = require('joi')

const authSchema = {
  register: {
    body: Joi.object({
      username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.min': '用户名至少3个字符',
          'string.max': '用户名最多30个字符',
          'any.required': '用户名不能为空'
        }),
      password: Joi.string()
        .min(6)
        .required()
        .messages({
          'string.min': '密码至少6个字符',
          'any.required': '密码不能为空'
        })
    })
  },
  login: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  }
}

module.exports = {
  authSchema
} 