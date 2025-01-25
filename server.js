const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const wordsRouter = require('./routes/words');
const listsRouter = require('./routes/lists');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://learningapp57.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes - ensure these are functions
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