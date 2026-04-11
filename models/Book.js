const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Programming', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Self-Help', 'Mathematics', 'Literature', 'Business', 'Children', 'Other'],
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['Like New', 'Good', 'Fair', 'Worn'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isbn: {
    type: String,
    trim: true,
    default: '',
  },
  language: {
    type: String,
    default: 'English',
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Text index for search
bookSchema.index({ title: 'text', author: 'text', category: 'text' });
bookSchema.index({ owner: 1 });
bookSchema.index({ isAvailable: 1 });
bookSchema.index({ category: 1 });

module.exports = mongoose.model('Book', bookSchema);
