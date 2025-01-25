const express = require('express');
const router = express.Router();
const List = require('../models/list');
const Word = require('../models/word');

// Get user's lists
router.get('/', async (req, res) => {
  try {
    console.log('User ID:', req.user?.sub);
    const lists = await List.find({ userId: req.user?.sub });
    console.log('Found lists:', lists);
    res.json(lists);
  } catch (err) {
    console.error('Error fetching lists:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new list
router.post('/', async (req, res) => {
  const list = new List({
    name: req.body.name,
    userId: req.user.sub
  });
  try {
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete list and its words
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findOne({ 
      _id: req.params.id,
      userId: req.user.sub 
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Delete all words in the list
    await Word.deleteMany({
      listId: req.params.id,
      userId: req.user.sub
    });

    // Delete the list
    await list.remove();
    
    res.json({ message: 'List and associated words deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;