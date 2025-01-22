const express = require('express');
const router = express.Router();
const Word = require('../models/Word');

// Get words for a specific list
router.get('/list/:listId', async (req, res) => {
  try {
    const words = await Word.find({
      userId: req.user.sub,
      listId: req.params.listId
    });
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new word
router.post('/', async (req, res) => {
  const word = new Word({
    ...req.body,
    userId: req.user.sub,
    srs: {
      interval: 1,
      ease: 2.5,
      due: new Date(),
      reviews: 0
    }
  });
  try {
    const newWord = await word.save();
    res.status(201).json(newWord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update word
router.put('/:id', async (req, res) => {
  try {
    const word = await Word.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.sub
      },
      req.body,
      { new: true }
    );
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(word);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete word
router.delete('/:id', async (req, res) => {
  try {
    const result = await Word.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub
    });
    if (!result) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json({ message: 'Word deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});