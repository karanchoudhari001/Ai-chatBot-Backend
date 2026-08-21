const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Role must be either user or assistant']
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for fast querying of history by user sorted by createdAt ascending
messageSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
