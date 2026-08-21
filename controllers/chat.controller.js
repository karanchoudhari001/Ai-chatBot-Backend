const User = require('../models/User');
const Message = require('../models/Message');
const { generateSupportResponse } = require('../services/ai.service');

/**
 * @desc    Create a new user document
 * @route   POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.create({ name: name.trim() });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message & receive AI response
 * @route   POST /api/chat
 */
const sendMessage = async (req, res, next) => {
  try {
    const { userId, message } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    // 1. Save user message to MongoDB
    const userMessageDoc = await Message.create({
      userId,
      role: 'user',
      content: message.trim()
    });

    // 2. Retrieve recent message history context for Gemini (last 10 messages before this new one)
    const historyDocs = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    // Exclude current message from history passed into generateSupportResponse context array
    const previousHistory = historyDocs.filter(
      (doc) => doc._id.toString() !== userMessageDoc._id.toString()
    );

    // 3. Call Gemini AI Service
    const aiResponseText = await generateSupportResponse(previousHistory, message.trim());

    // 4. Save AI response message to MongoDB
    const assistantMessageDoc = await Message.create({
      userId,
      role: 'assistant',
      content: aiResponseText
    });

    // 5. Return success response
    return res.status(200).json({
      success: true,
      data: {
        userMessage: userMessageDoc,
        assistantMessage: assistantMessageDoc
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history for a specific user
 * @route   GET /api/chat/history/:userId
 */
const getHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a message by ID
 * @route   DELETE /api/chat/history/:id
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  sendMessage,
  getHistory,
  deleteMessage
};
