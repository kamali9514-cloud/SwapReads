const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Book = require('../models/Book');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── GET /api/books ── List all available books (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, condition, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const books = await Book.find(filter)
      .populate('owner', 'name location avatar rating points')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + books.length < total,
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/books/my-books ── Get current user's books (protected)
router.get('/my-books', protect, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/books/matches ── Smart match: books others have that I need (protected)
router.get('/matches', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id, isFulfilled: false });
    const matches = [];

    for (const wish of wishlist) {
      const found = await Book.find({
        $or: [
          { title: { $regex: wish.title, $options: 'i' } },
          { author: wish.author ? { $regex: wish.author, $options: 'i' } : undefined },
        ].filter(Boolean),
        owner: { $ne: req.user._id },
        isAvailable: true,
      }).populate('owner', 'name location avatar rating points').limit(3);

      if (found.length > 0) {
        matches.push({ wishlistItem: wish, foundBooks: found });
      }
    }

    res.json({ success: true, matches });
  } catch (error) {
    console.error('Matches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/books/:id ── Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name location avatar rating points bio');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Increment views
    await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/books ── Add a new book (protected)
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('author').trim().notEmpty().withMessage('Author is required').isLength({ max: 100 }),
  body('category').isIn(['Programming', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Self-Help', 'Mathematics', 'Literature', 'Business', 'Children', 'Other']),
  body('condition').isIn(['Like New', 'Good', 'Fair', 'Worn']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, author, category, condition, description, isbn, language } = req.body;

    const book = await Book.create({
      title, author, category, condition,
      description: description || '',
      isbn: isbn || '',
      language: language || 'English',
      owner: req.user._id,
    });

    // Award 5 points for adding a book
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

    // Check if anyone on wishlist needs this book — notify them
    const wishers = await Wishlist.find({
      title: { $regex: title, $options: 'i' },
      user: { $ne: req.user._id },
      isFulfilled: false,
    }).populate('user', 'name');

    for (const wisher of wishers) {
      await Notification.create({
        recipient: wisher.user._id,
        type: 'match_found',
        title: 'Match Found! 🔥',
        message: `Someone just added "${title}" which you need!`,
        data: { bookId: book._id, userId: req.user._id },
      });
    }

    const populated = await Book.findById(book._id).populate('owner', 'name location avatar rating points');
    res.status(201).json({
      success: true,
      message: 'Book added successfully! You earned 5 points.',
      book: populated,
      pointsEarned: 5,
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/books/:id ── Update a book (protected, owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, author, category, condition, description, isAvailable } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (author) updates.author = author;
    if (category) updates.category = category;
    if (condition) updates.condition = condition;
    if (description !== undefined) updates.description = description;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('owner', 'name location avatar rating points');

    res.json({ success: true, book: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/books/:id ── Delete a book (protected, owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
