const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Timer = require('../models/Timer');

// @route   GET api/timers
// @desc    Get all timers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const timers = await Timer.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(timers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/timers
// @desc    Create a timer
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, duration } = req.body;

  try {
    const newTimer = new Timer({
      name,
      duration,
      remainingSeconds: duration,
      status: 'stopped',
      createdBy: req.user.id
    });

    const timer = await newTimer.save();
    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/timers/:id
// @desc    Update a timer
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, duration, remainingSeconds, status } = req.body;

  try {
    let timer = await Timer.findById(req.params.id);
    
    if (!timer) {
      return res.status(404).json({ msg: 'Timer not found' });
    }

    // Check if timer belongs to user
    if (timer.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update fields
    if (name) timer.name = name;
    if (duration) timer.duration = duration;
    if (remainingSeconds !== undefined) timer.remainingSeconds = remainingSeconds;
    if (status) timer.status = status;

    await timer.save();
    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/timers/:id
// @desc    Delete a timer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);
    
    if (!timer) {
      return res.status(404).json({ msg: 'Timer not found' });
    }

    // Check if timer belongs to user
    if (timer.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await timer.remove();
    res.json({ msg: 'Timer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
