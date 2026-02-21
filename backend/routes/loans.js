const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const { protect, librarianOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'librarian' ? {} : { user: req.user._id };
    const loans = await Loan.find(filter)
      .populate('user', 'name email studentId')
      .populate('book', 'title author genre')
      .sort({ createdAt: -1 });
    const now = new Date();
    for (const loan of loans) {
      if (loan.status === 'active' && loan.dueDate < now) {
        loan.status = 'late';
        await loan.save();
      }
    }
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, librarianOnly, async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'Aucune copie disponible' });
    const existingLoan = await Loan.findOne({ user: userId, book: bookId, status: { $in: ['active', 'late'] } });
    if (existingLoan) return res.status(400).json({ message: 'Cet étudiant a déjà ce livre' });
    const loan = await Loan.create({ user: userId, book: bookId });
    book.availableCopies -= 1;
    await book.save();
    await loan.populate('user', 'name email');
    await loan.populate('book', 'title author');
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/return', protect, librarianOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('book');
    if (!loan) return res.status(404).json({ message: 'Emprunt introuvable' });
    if (loan.status === 'returned') return res.status(400).json({ message: 'Livre déjà retourné' });
    loan.status = 'returned';
    loan.returnedAt = new Date();
    await loan.save();
    await Book.findByIdAndUpdate(loan.book._id, { $inc: { availableCopies: 1 } });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;