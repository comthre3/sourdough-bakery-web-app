const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Starter = require('../models/Starter');

// @route   GET api/starters
// @desc    Get all starters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const starters = await Starter.find({ createdBy: req.user.id }).sort({ name: 1 });
    res.json(starters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/starters/:id
// @desc    Get starter by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const starter = await Starter.findById(req.params.id);
    
    if (!starter) {
      return res.status(404).json({ msg: 'Starter not found' });
    }
    
    // Check if starter belongs to user
    if (starter.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(starter);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Starter not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/starters
// @desc    Create a starter
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description, createdDate, lastFed, feedings } = req.body;

  try {
    const newStarter = new Starter({
      name,
      description,
      createdDate,
      lastFed,
      feedings: feedings || [],
      createdBy: req.user.id
    });

    const starter = await newStarter.save();
    res.json(starter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/starters/:id
// @desc    Update a starter
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description, createdDate, lastFed, feedings } = req.body;

  try {
    let starter = await Starter.findById(req.params.id);
    
    if (!starter) {
      return res.status(404).json({ msg: 'Starter not found' });
    }

    // Check if starter belongs to user
    if (starter.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update fields
    starter.name = name;
    starter.description = description;
    starter.createdDate = createdDate;
    starter.lastFed = lastFed;
    starter.feedings = feedings;

    await starter.save();
    res.json(starter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/starters/:id/feeding
// @desc    Add a feeding to a starter
// @access  Private
router.post('/:id/feeding', auth, async (req, res) => {
  const { date, flourType, flourAmount, waterAmount, notes } = req.body;

  try {
    const starter = await Starter.findById(req.params.id);
    
    if (!starter) {
      return res.status(404).json({ msg: 'Starter not found' });
    }

    // Check if starter belongs to user
    if (starter.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newFeeding = {
      date,
      flourType,
      flourAmount,
      waterAmount,
      notes
    };

    starter.feedings.unshift(newFeeding);
    starter.lastFed = date;

    await starter.save();
    res.json(starter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/starters/:id
// @desc    Delete a starter
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const starter = await Starter.findById(req.params.id);
    
    if (!starter) {
      return res.status(404).json({ msg: 'Starter not found' });
    }

    // Check if starter belongs to user
    if (starter.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await starter.remove();
    res.json({ msg: 'Starter removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
