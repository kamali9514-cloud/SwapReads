const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

// ── GET /api/users ── Get all users (people page)
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .select('name location avatar rating points createdAt')
      .sort('-points')
      .skip(skip)
      .limit(parseInt(limit));

    // Attach book count
    const usersWithBooks = await Promise.all(users.map(async (u) => {
      const bookCount = await Book.countDocuments({ owner: u._id, isAvailable: true });
      return { ...u.toObject(), bookCount };
    }));

    res.json({ success: true, users: usersWithBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/users/:id ── Get public profile of a user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const books = await Book.find({ owner: user._id, isAvailable: true }).limit(10);
    const completedExchanges = await Request.countDocuments({
      $or: [{ owner: user._id }, { requester: user._id }],
      status: 'completed',
    });

    res.json({ success: true, user: user.toPublicJSON(), books, completedExchanges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/users/:id/books ── Get books of a specific user
router.get('/:id/books', async (req, res) => {
  try {
    const books = await Book.find({ owner: req.params.id, isAvailable: true })
      .populate('owner', 'name location avatar rating')
      .sort('-createdAt');
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
