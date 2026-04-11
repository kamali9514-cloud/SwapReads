const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── GET /api/requests ── Get requests for current user
router.get('/', protect, async (req, res) => {
  try {
    const { status, role } = req.query; // role: 'requester' | 'owner' | 'all'
    let filter = {};

    if (role === 'requester') filter.requester = req.user._id;
    else if (role === 'owner') filter.owner = req.user._id;
    else filter.$or = [{ requester: req.user._id }, { owner: req.user._id }];

    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate('book', 'title author category condition image')
      .populate('requester', 'name avatar location rating')
      .populate('owner', 'name avatar location rating')
      .sort('-createdAt');

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/requests ── Send a book request
router.post('/', protect, [
  body('bookId').notEmpty().withMessage('Book ID is required'),
  body('message').optional().isLength({ max: 300 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { bookId, message } = req.body;
    const book = await Book.findById(bookId).populate('owner', 'name');

    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (!book.isAvailable) return res.status(400).json({ success: false, message: 'Book is no longer available' });
    if (book.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own book' });
    }

    // Check for existing active request
    const existingRequest = await Request.findOne({
      book: bookId,
      requester: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have an active request for this book' });
    }

    const request = await Request.create({
      book: bookId,
      requester: req.user._id,
      owner: book.owner._id,
      message: message || '',
    });

    // Notify the book owner
    await Notification.create({
      recipient: book.owner._id,
      type: 'request_received',
      title: 'New Book Request 📩',
      message: `${req.user.name} wants to exchange for your "${book.title}"`,
      data: { requestId: request._id, bookId: book._id, userId: req.user._id },
    });

    const populated = await Request.findById(request._id)
      .populate('book', 'title author category condition image')
      .populate('requester', 'name avatar location rating')
      .populate('owner', 'name avatar location rating');

    res.status(201).json({ success: true, message: 'Request sent successfully!', request: populated });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/requests/:id/accept ── Accept a request
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('book', 'title')
      .populate('requester', 'name');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is no longer pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Reject all other pending requests for this book
    await Request.updateMany(
      { book: request.book._id, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Notify requester
    await Notification.create({
      recipient: request.requester._id,
      type: 'request_accepted',
      title: 'Request Accepted! ✅',
      message: `${req.user.name} accepted your request for "${request.book.title}". Arrange your exchange!`,
      data: { requestId: request._id, bookId: request.book._id },
    });

    res.json({ success: true, message: 'Request accepted!', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/requests/:id/reject ── Reject a request
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('book', 'title').populate('requester', 'name');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is no longer pending' });
    }

    request.status = 'rejected';
    await request.save();

    await Notification.create({
      recipient: request.requester._id,
      type: 'request_rejected',
      title: 'Request Declined ❌',
      message: `Your request for "${request.book.title}" was declined.`,
      data: { requestId: request._id },
    });

    res.json({ success: true, message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/requests/:id/complete ── Mark exchange as completed
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('book', 'title')
      .populate('requester', 'name')
      .populate('owner', 'name');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const isParticipant =
      request.requester._id.toString() === req.user._id.toString() ||
      request.owner._id.toString() === req.user._id.toString();

    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Request must be accepted before completing' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Mark book as unavailable
    await Book.findByIdAndUpdate(request.book._id, { isAvailable: false });

    // Award 10 points to both users
    await User.findByIdAndUpdate(request.owner._id, { $inc: { points: 10 } });
    await User.findByIdAndUpdate(request.requester._id, { $inc: { points: 10 } });

    // Notify both
    const otherUserId = req.user._id.toString() === request.owner._id.toString()
      ? request.requester._id
      : request.owner._id;

    await Notification.create({
      recipient: otherUserId,
      type: 'exchange_completed',
      title: 'Exchange Completed! 🎉',
      message: `Your exchange of "${request.book.title}" is marked complete. You earned 10 points!`,
      data: { requestId: request._id },
    });

    res.json({ success: true, message: 'Exchange completed! +10 points awarded to both users.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/requests/:id/rate ── Rate after exchange
router.post('/:id/rate', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { rating, comment } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed exchanges' });
    }

    const isRequester = request.requester.toString() === req.user._id.toString();
    const isOwner = request.owner.toString() === req.user._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const ratedUserId = isRequester ? request.owner : request.requester;
    const ratingField = isRequester ? 'rating.requesterRating' : 'rating.ownerRating';

    await Request.findByIdAndUpdate(req.params.id, {
      [ratingField]: { value: rating, comment: comment || '', givenAt: new Date() },
    });

    // Update user's average rating
    const ratedUser = await User.findById(ratedUserId);
    const newCount = ratedUser.rating.count + 1;
    const newAverage = ((ratedUser.rating.average * ratedUser.rating.count) + rating) / newCount;
    await User.findByIdAndUpdate(ratedUserId, { 'rating.average': newAverage, 'rating.count': newCount });

    await Notification.create({
      recipient: ratedUserId,
      type: 'rating_received',
      title: 'New Rating ⭐',
      message: `You received a ${rating}-star rating!`,
      data: { requestId: request._id },
    });

    res.json({ success: true, message: 'Rating submitted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
