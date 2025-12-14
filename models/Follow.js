const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
});

followSchema.index({ user: 1, trainer: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);

