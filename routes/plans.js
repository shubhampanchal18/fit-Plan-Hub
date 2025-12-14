const express = require('express');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');
const { isTrainer } = require('../middleware/auth');

const router = express.Router();

// Get all plans (public - shows preview for non-subscribers)
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().populate('trainer', 'name email').sort({ createdAt: -1 });
    
    // If user is logged in, check subscriptions
    let userSubscriptions = [];
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);
        
        if (user) {
          const subs = await Subscription.find({ user: user._id, status: 'active' });
          userSubscriptions = subs.map(s => s.plan.toString());
        }
      } catch (err) {
        // Token invalid or no user, continue with preview
      }
    }

    const plansWithAccess = plans.map(plan => {
      const hasAccess = userSubscriptions.includes(plan._id.toString());
      
      if (hasAccess) {
        return {
          _id: plan._id,
          title: plan.title,
          description: plan.description,
          price: plan.price,
          duration: plan.duration,
          trainer: plan.trainer,
          createdAt: plan.createdAt,
          hasAccess: true
        };
      } else {
        return {
          _id: plan._id,
          title: plan.title,
          price: plan.price,
          trainer: plan.trainer,
          hasAccess: false
        };
      }
    });

    res.json(plansWithAccess);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single plan (with access control)
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('trainer', 'name email');
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    let hasAccess = false;
    
    // Check if user has subscription
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);
        
        if (user) {
          const subscription = await Subscription.findOne({
            user: user._id,
            plan: plan._id,
            status: 'active'
          });
          hasAccess = !!subscription;
        }
      } catch (err) {
        // No access
      }
    }

    if (hasAccess) {
      res.json({
        _id: plan._id,
        title: plan.title,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        trainer: plan.trainer,
        createdAt: plan.createdAt,
        hasAccess: true
      });
    } else {
      res.json({
        _id: plan._id,
        title: plan.title,
        price: plan.price,
        trainer: plan.trainer,
        hasAccess: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create plan (trainer only)
router.post('/', auth, isTrainer, async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;

    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const plan = new Plan({
      title,
      description,
      price,
      duration,
      trainer: req.user._id
    });

    await plan.save();
    await plan.populate('trainer', 'name email');

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update plan (trainer only, own plans)
router.put('/:id', auth, isTrainer, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this plan' });
    }

    const { title, description, price, duration } = req.body;

    if (title) plan.title = title;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (duration) plan.duration = duration;

    await plan.save();
    await plan.populate('trainer', 'name email');

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete plan (trainer only, own plans)
router.delete('/:id', auth, isTrainer, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await Plan.findByIdAndDelete(req.params.id);
    await Subscription.deleteMany({ plan: req.params.id });

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

