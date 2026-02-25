const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, librarianOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, genre, available } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) filter.genre = genre;
    if (available === 'true') filter.availableCopies = { $gt: 0 };

    // lean() évite la création d'objets Mongoose lourds
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/isbn/:isbn — Récupérer les infos d'un livre via Google Books
router.get('/isbn/:isbn', protect, librarianOnly, async (req, res) => {
  try {
    const { isbn } = req.params;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ message: 'Livre non trouvé sur Google Books' });
    }

    const info = data.items[0].volumeInfo;
    res.json({
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Auteur inconnu',
      description: info.description || '',
      genre: info.categories ? info.categories[0] : 'Inconnu',
      coverImage: info.imageLinks ? info.imageLinks.thumbnail : '',
      isbn: isbn
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des infos ISBN' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, librarianOnly, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, librarianOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, librarianOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;