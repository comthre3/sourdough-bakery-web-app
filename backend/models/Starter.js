const mongoose = require('mongoose');

const StarterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdDate: { type: Date, required: true },
  lastFed: { type: Date },
  feedings: [{
    date: { type: Date, required: true },
    flourType: { type: String, required: true },
    flourAmount: { type: Number, required: true },
    waterAmount: { type: Number, required: true },
    notes: { type: String }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Starter', StarterSchema);
