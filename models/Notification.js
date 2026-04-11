const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['request_received', 'request_accepted', 'request_rejected', 'exchange_completed', 'match_found', 'book_added', 'rating_received'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
