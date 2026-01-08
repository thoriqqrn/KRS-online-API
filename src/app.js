require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} ${res.statusCode} (${durationMs}ms)`
    );
  });

  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Global error handlers to prevent server crash
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export app untuk Netlify Functions
module.exports = app;
