const express = require('express');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Subscribe to a plan
router.post('/:planId', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if already subscribed
    const existing = await Subscription.findOne({
      user: req.user._id,
      plan: req.params.planId
    });

    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ message: 'Already subscribed to this plan' });
      } else {
        // Reactivate expired subscription
        existing.status = 'active';
        existing.purchasedAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration);
        existing.expiresAt = expiresAt;
        await existing.save();
        await existing.populate('plan');
        return res.json(existing);
      }
    }

    // Create new subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    const subscription = new Subscription({
      user: req.user._id,
      plan: req.params.planId,
      expiresAt
    });

    await subscription.save();
    await subscription.populate('plan');

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's subscriptions
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('plan')
      .populate('plan.trainer', 'name email')
      .sort({ purchasedAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

