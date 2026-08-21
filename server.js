const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Core Middleware (Dynamic CORS for Netlify Frontend & Localhost)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'https://kiaaraa.netlify.app',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI Customer Support Assistant API'
  });
});

// API Routes
app.use('/api', chatRoutes);

// Fallback 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found - ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error] ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
