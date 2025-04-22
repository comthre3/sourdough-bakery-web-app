const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  remainingSeconds: { type: Number },
  status: { type: String, default: 'stopped' }, // running, paused, stopped, completed
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timer', TimerSchema);
