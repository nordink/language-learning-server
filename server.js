const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
console.log('SERVER STARTING WITH CORS DOMAINS:', [
  'https://aquamarine-shortbread-a36146.netlify.app',
  'http://localhost:5173']);
const { auth } = require('express-oauth2-jwt-bearer');
const wordsRouter = require('./routes/words');
const listsRouter = require('./routes/lists');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://aquamarine-shortbread-a36146.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add a test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    corsOrigins: app.get('cors').origin,
    timestamp: new Date().toISOString()
  });
});
app.use(express.json());

// Health check (before auth middleware)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Auth middleware
const jwtCheck = auth({
  audience: 'https://dev-5giozvplijcqa2pc.us.auth0.com',
  issuerBaseURL: 'https://dev-5giozvplijcqa2pc.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Protected routes
app.use('/api/words', jwtCheck, wordsRouter);
app.use('/api/lists', jwtCheck, listsRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});