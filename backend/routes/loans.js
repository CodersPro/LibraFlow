/*const express = require('express');
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

module.exports = router;*/
const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const Loan = require("../models/Loan");
const Book = require("../models/Book");
const { protect, librarianOnly } = require("../middleware/auth");

// ── GET /api/loans — Liste des emprunts ──
// Librarian : tous | Student : les siens uniquement
router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "librarian" ? {} : { user: req.user._id };
    const loans = await Loan.find(filter)
      .populate("user", "name email studentId")
      .populate("book", "title author genre")
      .sort({ createdAt: -1 });

    // Mise à jour automatique des retards
    const now = new Date();
    for (const loan of loans) {
      if (loan.status === "active" && loan.dueDate < now) {
        loan.status = "late";
        await loan.save();
      }
    }
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/loans/:id — Détail d'un emprunt (utilisé par le scanner) ──
router.get("/:id", protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "name email studentId")
      .populate("book", "title author genre");
    if (!loan) return res.status(404).json({ message: "Emprunt introuvable" });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/loans — Créer une demande d'emprunt (étudiant) ──
// Status "pending" — le livre N'EST PAS décrémenté ici
// La décrémentation se fait à la confirmation (PUT /:id/confirm)
router.post("/", protect, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id; // toujours l'utilisateur connecté

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });
    if (book.availableCopies <= 0)
      return res.status(400).json({ message: "Aucune copie disponible" });

    // Vérifier qu'il n'a pas déjà ce livre en cours
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["pending", "active", "late"] },
    });
    if (existingLoan)
      return res
        .status(400)
        .json({ message: "Vous avez déjà une demande pour ce livre" });

    const loan = await Loan.create({ user: userId, book: bookId });
    await loan.populate("user", "name email");
    await loan.populate("book", "title author genre");

    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── GET /api/loans/:id/qrcode — Générer le QR code d'un emprunt ──
// Retourne le QR code en base64 PNG
router.get("/:id/qrcode", protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Emprunt introuvable" });

    // Le QR code encode l'URL de scan (contient l'ID de l'emprunt)
    const qrData = `LIBRAFLOW_LOAN:${loan._id}`;
    const qrBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#0F0E0C", light: "#FFFFFF" },
    });

    res.json({ qrCode: qrBase64, loanId: loan._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/loans/:id/confirm — Confirmer un emprunt après scan (bibliothécaire) ──
// C'est ici que le livre est décrémenté
router.put("/:id/confirm", protect, librarianOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "name email studentId")
      .populate("book", "title author genre");

    if (!loan) return res.status(404).json({ message: "Emprunt introuvable" });
    if (loan.status !== "pending")
      return res
        .status(400)
        .json({ message: `Cet emprunt est déjà "${loan.status}"` });

    // Vérifier encore la disponibilité au moment de la confirmation
    const book = await Book.findById(loan.book._id);
    if (book.availableCopies <= 0)
      return res
        .status(400)
        .json({
          message: "Plus aucune copie disponible au moment de la confirmation",
        });

    // Confirmer l'emprunt
    loan.status = "active";
    loan.borrowedAt = new Date();
    await loan.save();

    // Décrémenter seulement maintenant
    book.availableCopies -= 1;
    await book.save();

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/loans/:id/return — Retourner un livre après scan (bibliothécaire) ──
router.put("/:id/return", protect, librarianOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "name email studentId")
      .populate("book", "title author genre");

    if (!loan) return res.status(404).json({ message: "Emprunt introuvable" });
    if (loan.status === "returned")
      return res.status(400).json({ message: "Livre déjà retourné" });
    if (loan.status === "pending")
      return res
        .status(400)
        .json({
          message: "Emprunt pas encore confirmé — impossible de retourner",
        });

    loan.status = "returned";
    loan.returnedAt = new Date();
    await loan.save();

    await Book.findByIdAndUpdate(loan.book._id, {
      $inc: { availableCopies: 1 },
    });

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
