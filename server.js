// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const wordsRouter = require('./routes/words');
const listsRouter = require('./routes/lists');
require('dotenv').config();

const app = express();

// Auth0 middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,
  tokenSigningAlg: 'RS256'
});

// Middleware
app.use(cors({
  origin: 'https://learningapp57.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(jwtCheck);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/words', wordsRouter);
app.use('/api/lists', listsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});