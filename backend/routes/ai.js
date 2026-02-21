const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Book = require("../models/Book");
const Loan = require("../models/Loan");
const { protect } = require("../middleware/auth");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Modèle utilisé ──
const MODEL = "llama-3.3-70b-versatile";

// ── Helper : appel Groq simplifié ──
const askGroq = async (prompt) => {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0].message.content;
};

// ── Fallbacks en cas d'erreur ──
const FALLBACK_RECOMMENDATIONS = [
  {
    title: "The Pragmatic Programmer",
    author: "Hunt & Thomas",
    reason: "Essentiel pour tout développeur qui veut progresser.",
  },
  {
    title: "Clean Architecture",
    author: "Robert C. Martin",
    reason: "Complément naturel à Clean Code — penser en systèmes.",
  },
  {
    title: "Refactoring",
    author: "Martin Fowler",
    reason: "Apprendre à améliorer un code existant sans tout casser.",
  },
];
const FALLBACK_SUMMARY =
  "Ce livre est une référence incontournable dans son domaine. Il aborde les concepts fondamentaux de manière claire et progressive. Recommandé pour tout étudiant souhaitant approfondir ses connaissances.";
const FALLBACK_STATS =
  "La bibliothèque fonctionne bien avec un bon taux de disponibilité. Il est recommandé de relancer les étudiants en retard et d'identifier les livres populaires pour en commander des exemplaires supplémentaires.";
const FALLBACK_CHAT =
  "Je suis temporairement indisponible. Veuillez réessayer dans quelques instants ou consulter directement le catalogue de la bibliothèque.";

const isQuotaError = (err) =>
  err.message.includes("429") ||
  err.message.includes("quota") ||
  err.message.includes("rate limit");

// POST /api/ai/recommend
router.post("/recommend", protect, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id })
      .populate("book", "title author genre")
      .limit(10);

    const borrowedBooks = loans.map(
      (l) => `"${l.book.title}" de ${l.book.author} (${l.book.genre})`,
    );

    if (borrowedBooks.length === 0) {
      return res.json({
        recommendations:
          "Empruntez vos premiers livres pour obtenir des recommandations !",
      });
    }

    const prompt = `Tu es un bibliothécaire expert. Un étudiant a emprunté : ${borrowedBooks.join(", ")}.
Recommande 3 livres adaptés à son profil.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
[{"title":"...","author":"...","reason":"..."}]`;

    const text = await askGroq(prompt);
    const jsonMatch = text.match(/\[.*\]/s);
    const recommendations = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : FALLBACK_RECOMMENDATIONS;
    res.json({ recommendations });
  } catch (err) {
    if (isQuotaError(err))
      return res.json({
        recommendations: FALLBACK_RECOMMENDATIONS,
        fallback: true,
      });
    res.status(500).json({ message: "Erreur IA : " + err.message });
  }
});

// POST /api/ai/summarize
router.post("/summarize", protect, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    const prompt = `Résume en 3 phrases claires le livre "${book.title}" de ${book.author} pour des étudiants universitaires.`;
    const summary = await askGroq(prompt);
    res.json({ summary });
  } catch (err) {
    if (isQuotaError(err))
      return res.json({ summary: FALLBACK_SUMMARY, fallback: true });
    res.status(500).json({ message: "Erreur IA : " + err.message });
  }
});

// GET /api/ai/stats-summary
router.get("/stats-summary", protect, async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({
      availableCopies: { $gt: 0 },
    });
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const lateLoans = await Loan.countDocuments({ status: "late" });

    const prompt = `Tu es un assistant bibliothécaire. Voici les statistiques de la bibliothèque BIT :
- Total livres : ${totalBooks}
- Livres disponibles : ${availableBooks}
- Emprunts actifs : ${activeLoans}
- Emprunts en retard : ${lateLoans}
Donne un commentaire de 2 phrases sur l'état de la bibliothèque, puis une recommandation d'action concrète. Réponds en français.`;

    const summary = await askGroq(prompt);
    res.json({ summary });
  } catch (err) {
    if (isQuotaError(err))
      return res.json({ summary: FALLBACK_STATS, fallback: true });
    res.status(500).json({ message: "Erreur IA : " + err.message });
  }
});

// POST /api/ai/chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;

    const prompt = `Tu es un assistant bibliothécaire expert de la bibliothèque BIT.
Tu aides les étudiants à trouver des livres et répondre à leurs questions.
Réponds en français, de façon concise (maximum 3 phrases).

Question : ${message}`;

    const reply = await askGroq(prompt);
    res.json({ reply });
  } catch (err) {
    if (isQuotaError(err))
      return res.json({ reply: FALLBACK_CHAT, fallback: true });
    res.status(500).json({ message: "Erreur IA : " + err.message });
  }
});

module.exports = router;
