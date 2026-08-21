const mongoose = require('mongoose');

/**
 * Middleware to validate user creation request body
 */
const validateUser = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name is required and must be a non-empty string.'
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Name must be at least 2 characters long.'
    });
  }

  next();
};

/**
 * Middleware to validate send message request body
 */
const validateMessage = (req, res, next) => {
  const { userId, message } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId is required.'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid userId format.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message content is required and cannot be empty.'
    });
  }

  next();
};

module.exports = {
  validateUser,
  validateMessage
};
