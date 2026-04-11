const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  message: {
    type: String,
    maxlength: [300, 'Message cannot exceed 300 characters'],
    default: '',
  },
  completedAt: {
    type: Date,
  },
  rating: {
    requesterRating: { value: Number, comment: String, givenAt: Date },
    ownerRating: { value: Number, comment: String, givenAt: Date },
  },
}, { timestamps: true });

requestSchema.index({ requester: 1 });
requestSchema.index({ owner: 1 });
requestSchema.index({ book: 1 });
requestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', requestSchema);
