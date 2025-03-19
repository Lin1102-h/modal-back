const mongoose = require('mongoose');


// 定义 VideoTask Schema
const VideoTaskSchema = new mongoose.Schema({
  id: String,
  request_id: String,
  user_id: String,
  model: String,
  task_status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  prompt_text: String,
  script_content: String,
  video_url: String,
  error_message: String,
  completion_time: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// 创建 model
const VideoTask = mongoose.model('VideoTask', VideoTaskSchema);
module.exports = VideoTask 