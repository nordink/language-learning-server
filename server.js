const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth, claimCheck } = require('express-oauth2-jwt-bearer');
const jwt = require('jsonwebtoken');
const wordsRouter = require('./routes/words');
const listsRouter = require('./routes/lists');
const dbName = 'spanish-learning';


const app = express();

// CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://steepy.org');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Store CORS config so we can access it later
const corsOptions = {
  origin: [
    'https://steepy.org',
    'http://localhost:5173'
  ].map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors({
  origin: 'https://steepy.org',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Token debug middleware
app.use('/api/*', (req, res, next) => {
  console.log('Auth Debug:', {
    hasAuth: !!req.headers.authorization,
    authHeader: req.headers.authorization?.substring(0, 30) + '...'
  });

  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.decode(token);
      console.log('Decoded token payload:', decoded);
      req.user = decoded;
    } catch (err) {
      console.error('Token decode error:', err);
    }
  }
  next();
});

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

const jwtCheck = auth({
  audience: 'https://spanish-learning-api',
  issuerBaseURL: 'https://dev-5giozvplijcqa2pc.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Protected routes
app.use('/api/words', jwtCheck, wordsRouter);
app.use('/api/lists', jwtCheck, listsRouter);

// MongoDB connection with enhanced error logging
mongoose.connect(process.env.MONGODB_URI, {
  dbName: dbName,  // Explicitly set database name
  serverSelectionTimeoutMS: 30000,  // Increased timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  keepAlive: true,
  maxPoolSize: 5,
  minPoolSize: 1,
  useNewUrlParser: true
}).then(() => {
  console.log(`Connected to MongoDB Database: ${dbName}`);
  console.log('Connection Details:', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models)
  });
}).catch(err => {
  console.error('MongoDB Connection Error:', {
    message: err.message,
    code: err.code,
    stack: err.stack
  });
});

// Add connection event listeners
mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
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