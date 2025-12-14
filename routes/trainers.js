const express = require('express');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Follow = require('../models/Follow');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('name email createdAt');
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trainer profile with plans
router.get('/:id', async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).select('name email createdAt');
    
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const plans = await Plan.find({ trainer: trainer._id }).sort({ createdAt: -1 });

    let isFollowing = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId);
        
        if (user) {
          const follow = await Follow.findOne({ user: user._id, trainer: trainer._id });
          isFollowing = !!follow;
        }
      } catch (err) {
        // Not logged in
      }
    }

    res.json({
      trainer,
      plans,
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow a trainer
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id);
    
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    if (trainer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existing = await Follow.findOne({
      user: req.user._id,
      trainer: trainer._id
    });

    if (existing) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }

    const follow = new Follow({
      user: req.user._id,
      trainer: trainer._id
    });

    await follow.save();
    res.json({ message: 'Followed successfully', follow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a trainer
router.delete('/:id/follow', auth, async (req, res) => {
  try {
    const follow = await Follow.findOne({
      user: req.user._id,
      trainer: req.params.id
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this trainer' });
    }

    await Follow.findByIdAndDelete(follow._id);
    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trainers user follows
router.get('/following/list', auth, async (req, res) => {
  try {
    const follows = await Follow.find({ user: req.user._id })
      .populate('trainer', 'name email')
      .sort({ followedAt: -1 });

    res.json(follows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

