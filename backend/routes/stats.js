const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const User = require('../models/User');
const { protect, librarianOnly } = require('../middleware/auth');

router.get('/', protect, librarianOnly, async (req, res) => {
  try {
    const [totalBooks, activeLoans, lateLoans, totalStudents] = await Promise.all([
      Book.countDocuments(),
      Loan.countDocuments({ status: 'active' }),
      Loan.countDocuments({ status: 'late' }),
      User.countDocuments({ role: 'student' })
    ]);
    const availableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$availableCopies' } } }
    ]);
    const topBooks = await Loan.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', author: '$book.author', count: 1 } }
    ]);
    const byGenre = await Book.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ totalBooks, availableBooks: availableBooks[0]?.total || 0, activeLoans, lateLoans, totalStudents, topBooks, byGenre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;