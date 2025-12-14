const express = require('express');
const Follow = require('../models/Follow');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get personalized feed
router.get('/', auth, async (req, res) => {
  try {
    // Get trainers user follows
    const follows = await Follow.find({ user: req.user._id });
    const trainerIds = follows.map(f => f.trainer);

    // Get plans from followed trainers
    const plans = await Plan.find({ trainer: { $in: trainerIds } })
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });

    // Get user's subscriptions
    const subscriptions = await Subscription.find({ user: req.user._id, status: 'active' });
    const subscribedPlanIds = subscriptions.map(s => s.plan.toString());

    // Add subscription status and access info
    const feedItems = plans.map(plan => {
      const isSubscribed = subscribedPlanIds.includes(plan._id.toString());
      
      return {
        _id: plan._id,
        title: plan.title,
        description: isSubscribed ? plan.description : undefined,
        price: plan.price,
        duration: plan.duration,
        trainer: plan.trainer,
        createdAt: plan.createdAt,
        isSubscribed,
        hasAccess: isSubscribed
      };
    });

    res.json(feedItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

