const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalBalance: {
    type: Number,
    required: true,
    default: 0
  },
  grantedBalance: {
    type: Number,
    required: true,
    default: 0
  },
  toppedUpBalance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['grant', 'topup', 'consume'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 计算总余额
balanceSchema.pre('save', function(next) {
  this.totalBalance = this.grantedBalance + this.toppedUpBalance;
  next();
});

const Balance = mongoose.model('Balance', balanceSchema);

module.exports = Balance; 