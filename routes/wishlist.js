const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// ── GET /api/wishlist ── Get current user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id, isFulfilled: false }).sort('-createdAt');
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/wishlist/all ── Get all users' wishlists (for stream)
router.get('/all', async (req, res) => {
  try {
    const items = await Wishlist.find({ isFulfilled: false })
      .populate('user', 'name location avatar')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/wishlist ── Add item to wishlist
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Book title is required').isLength({ max: 150 }),
  body('category').optional().isIn(['Programming', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Self-Help', 'Mathematics', 'Literature', 'Business', 'Children', 'Other']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, author, category } = req.body;

    // Check for duplicate
    const existing = await Wishlist.findOne({ user: req.user._id, title: { $regex: `^${title}$`, $options: 'i' }, isFulfilled: false });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This book is already in your wishlist' });
    }

    const item = await Wishlist.create({
      user: req.user._id,
      title,
      author: author || '',
      category: category || 'Other',
    });

    res.status(201).json({ success: true, message: 'Added to wishlist!', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/wishlist/:id ── Remove from wishlist
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
