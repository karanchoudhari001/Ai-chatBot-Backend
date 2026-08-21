const express = require('express');
const router = express.Router();
const {
  createUser,
  sendMessage,
  getHistory,
  deleteMessage
} = require('../controllers/chat.controller');
const {
  validateUser,
  validateMessage
} = require('../middleware/validate');

// User creation route
router.post('/users', validateUser, createUser);

// Chat messaging routes
router.post('/chat', validateMessage, sendMessage);
router.get('/chat/history/:userId', getHistory);
router.delete('/chat/history/:id', deleteMessage);

module.exports = router;
