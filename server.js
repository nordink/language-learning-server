const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const wordsRouter = require('./routes/words');
const listsRouter = require('./routes/lists');
require('dotenv').config();

console.log('SERVER STARTING WITH CORS DOMAINS:', [
  'https://aquamarine-shortbread-a36146.netlify.app',
  'http://localhost:5173'
]);

const app = express();

// Store CORS config so we can access it later
const corsOptions = {
  origin: [
    'https://aquamarine-shortbread-a36146.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// CORS configuration
app.use(cors(corsOptions));
app.use(express.json());

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Health check with error handling
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'healthy',
      corsOrigins: corsOptions.origin,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add debug middleware before protected routes
app.use('/api/*', (req, res, next) => {
  console.log('Incoming request debug:', {
    path: req.path,
    method: req.method,
    headers: {
      auth: req.headers.authorization?.substring(0, 30) + '...',
      contentType: req.headers['content-type']
    }
  });
  next();
});

const jwtCheck = auth({
  audience: 'https://dev-5giozvplijcqa2pc.us.auth0.com',  // Removed /api/v2/
  issuerBaseURL: 'https://dev-5giozvplijcqa2pc.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Protected routes
app.use('/api/words', jwtCheck, wordsRouter);
app.use('/api/lists', jwtCheck, listsRouter);

// MongoDB connection with enhanced error logging
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('MongoDB connection error details:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
  });

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('CORS configured with origins:', corsOptions.origin);
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});