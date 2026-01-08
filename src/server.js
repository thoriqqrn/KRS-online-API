require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const config = require('./config/config');

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
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, keep server running
});

// Start server only in non-serverless environment
if (!process.env.VERCEL) {
  const PORT = config.port;
  const HOST = '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════╗
║   KRS Online Backend Server Running    ║
║   Port: ${PORT}                           ║
║   Host: ${HOST}                        ║
║   Environment: ${config.nodeEnv}      ║
║   Local URL: http://localhost:${PORT}  ║
║   Network URL: http://0.0.0.0:${PORT}  ║
╚════════════════════════════════════════╝
    `);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} is already in use!`);
      console.error('Run this to kill the process:');
      console.error(`   netstat -ano | findstr :${PORT}`);
      console.error('   taskkill /PID <PID> /F\n`);
      process.exit(1);
    }
  });
}

// Export for Vercel serverless
module.exports = app;
