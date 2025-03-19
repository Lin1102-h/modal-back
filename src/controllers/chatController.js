const Chat = require("../models/chat")
const VideoTask = require("../models/videoTask")
const OpenAI = require("openai")
const https = require("follow-redirects").https
const { PassThrough } = require("stream")
const { ZhipuAI } = require("zhipuai-sdk-nodejs-v4")
const apiKey = "sk-7abfea356a854694b9010d604c4ed9cb"
const zhipuApiKey = "sk-tkicftodvdvjjjxrrufktxugyifqzsanmhnkqsnogrujbegh"
const mongoose = require('mongoose')

let options = {
  method: "GET",
  hostname: "api.deepseek.com",
  path: "/user/balance",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  maxRedirects: 20,
}
const errorCode = [400, 401, 404, 429, 503, 504]
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com", // https://api.deepseek.com
  apiKey,
})
const saveChat = async (ctx, userId, message, newChat) => {
  try {
    let chat = null

    if (newChat) {
      // 创建新对话
      chat = new Chat({
        userId,
        messages: [],
        title: message[0].content, // 使用消息前50个字符作为标题
        status: "active",
        createdAt: new Date(),
      })
    } else {
      // 查找最近的活跃对话
      chat = await Chat.findOne({
        userId,
        status: "active",
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内的对话
        },
      })

      // 如果没找到活跃对话，创建新对话
      if (!chat) {
        chat = new Chat({
          userId,
          messages: [],
          title: message[0].content,
          status: "active",
          createdAt: new Date(),
        })
      }
    }

    // 添加用户消息
    chat.messages.push({
      type: "user",
      content: message[0].content,
      timestamp: new Date(),
    })

    // 保存对话记录
    await chat.save()

    return chat
  } catch (error) {
    console.error("Save chat error:", error)
    throw error
  }
}

const generateUniqueId = () => {
  return new mongoose.Types.ObjectId().toString();
};
class ChatController {
  //保存聊天记录

  // 发送消息
  async sendMessage(ctx) {
    const { message, id: userId, newChat } = ctx.request.body
    let stream = new PassThrough()
    // 设置 SSE 响应头
    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    })

    // 立即发送响应头
    ctx.status = 200
    ctx.body = stream

    try {
      await saveChat(ctx, userId, message, newChat)
      
      const completion = await openai.chat.completions.create({
        messages: message,
        model: "deepseek-reasoner",
        stream: true,
      })
      // reasoner
      for await (const chunk of completion) {
        const content = chunk.choices[0].delta?.content
        const reasoning = chunk.choices[0].delta?.reasoning_content

        if (content || reasoning) {
          // 立即刷新数据到客户端
          const data = JSON.stringify({ reasoning, content })
          ctx.res.write(`data: ${data}\n\n`)
        }
      }

      // 发送结束标记并立即刷新
      ctx.res.write("data: [DONE]\n\n")
      ctx.res.end()
      stream.end()

    } catch (error) {
      console.error('Stream error:', error)
      if (!ctx.headerSent && ctx.res.writable) {
        const errorMessage = error instanceof OpenAI.APIError
          ? `API Error: ${error.status} - ${error.message}`
          : 'Internal Server Error'
        ctx.res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        ctx.res.end()
      }
    } finally {
      if (stream) {
        stream.destroy()
      }
    }
  }

  // 获取历史记录
  async getHistory(ctx) {
    const { userId } = ctx.request.query
    const { page = 1, limit = 10 } = ctx.request.query

    try {
      const chats = await Chat.find({ userId })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("title messages.timestamp messages.type messages.content updatedAt")

      const total = await Chat.countDocuments({ userId })

      ctx.body = {
        code: 200,
        data: {
          chats,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
        message: "success",
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  // 创建新对话
  async createChat(ctx) {
    // const userId = ctx.state.user.id

    try {
      // const chat = await Chat.create({
      //   userId,
      //   messages: [{
      //     type: 'bot',
      //     content: '你好！我是AI助手，有什么可以帮你的吗？'
      //   }]
      // })

      ctx.body = {
        code: 200,
        data: {
          id: Date.now(),
          time: new Date().toISOString(),
        },
        message: "success",
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  // 查询余额
  async searchBalance(ctx) {
    const { message } = ctx.request.body
    try {
      let res1 = {}
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
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

  async sendVideoMessage(ctx) {
    const { message, id } = ctx.request.body
    const zhipu = new ZhipuAI({api_key:zhipuApiKey})
    try {
      const response = await zhipu.videos.generations({
        model: "cogvideox-flash",
        prompt: message,
        quality: "quality",
        stream: true,
        fps: 60,
        size: "1920x1080",
      })
      console.log(response)
      const taskRecord = new VideoTask({
        id: generateUniqueId(),
        request_id: response.request_id,
        user_id: response.id,
        model: response.model,
        task_status: 'PENDING',
        prompt_text: message,
        script_content: message,
        created_at: new Date(),
        updated_at: new Date()
      });
      await taskRecord.save()
      ctx.body = {
        code: 200,
        data: {
          id: response.id,
          request_id: response.request_id,
          status: response.task_status
        },
        message: "success",
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }
}

module.exports = new ChatController()
