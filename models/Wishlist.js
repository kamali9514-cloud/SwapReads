const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  author: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: ['Programming', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Self-Help', 'Mathematics', 'Literature', 'Business', 'Children', 'Other'],
    default: 'Other',
  },
  isFulfilled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ title: 'text' });

module.exports = mongoose.model('Wishlist', wishlistSchema);
