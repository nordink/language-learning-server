const express = require('express');
const router = express.Router();
const List = require('../models/list');
const Word = require('../models/word');

// Get user's lists
router.get('/', async (req, res) => {
  try {
    console.log('Lists Route Debug:', {
      hasUser: !!req.user,
      userSub: req.user?.sub,
      fullUser: JSON.stringify(req.user)
    });
    
    const lists = await List.find({ userId: req.user?.sub });
    console.log('Lists Query Result:', {
      count: lists.length,
      lists: JSON.stringify(lists)
    });
    
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
    console.log('Delete list request:', {
      listId: req.params.id,
      userId: req.user?.sub
    });
    
    const list = await List.findOne({ 
      _id: req.params.id,
      userId: req.user.sub 
    });
    
    if (!list) {
      console.log('List not found:', req.params.id);
      return res.status(404).json({ message: 'List not found' });
    }

    console.log('Found list to delete:', list._id);
    // Delete words first
    await Word.deleteMany({
      listId: req.params.id,
      userId: req.user.sub
    });

    // Added missing: Delete the list and send response
    await list.deleteOne();
    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    console.error('Delete list error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update list name
router.put('/:id', async (req, res) => {
  try {
    const list = await List.findOne({ 
      _id: req.params.id,
      userId: req.user.sub 
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    list.name = req.body.name;
    await list.save();
    
    res.json(list);
  } catch (err) {
    console.error('Error updating list:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;