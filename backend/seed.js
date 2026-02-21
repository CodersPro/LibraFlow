require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const books = [
  // ── INFORMATIQUE ──
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Informatique",
    description:
      "Les meilleures pratiques pour écrire un code propre et maintenable.",
    totalCopies: 3,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    genre: "Informatique",
    description:
      "Guide essentiel pour devenir un développeur pragmatique et efficace.",
    totalCopies: 2,
  },
  {
    title: "Design Patterns",
    author: "Gang of Four",
    genre: "Informatique",
    description:
      "Les 23 patterns de conception orientée objet incontournables.",
    totalCopies: 4,
  },
  {
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    genre: "Informatique",
    description: "Plongée profonde dans les mécanismes internes de JavaScript.",
    totalCopies: 3,
  },
  {
    title: "The Clean Coder",
    author: "Robert C. Martin",
    genre: "Informatique",
    description: "Le comportement professionnel attendu d'un développeur.",
    totalCopies: 2,
  },
  {
    title: "Refactoring",
    author: "Martin Fowler",
    genre: "Informatique",
    description: "Techniques pour améliorer le design du code existant.",
    totalCopies: 3,
  },
  {
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest & Stein",
    genre: "Informatique",
    description:
      "La référence absolue sur les algorithmes et structures de données.",
    totalCopies: 5,
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    author: "Abelson & Sussman",
    genre: "Informatique",
    description: "Le classique du MIT sur les fondements de la programmation.",
    totalCopies: 2,
  },
  {
    title: "The Mythical Man-Month",
    author: "Frederick P. Brooks",
    genre: "Informatique",
    description: "Essais sur le génie logiciel et la gestion de projets.",
    totalCopies: 2,
  },
  {
    title: "Code Complete",
    author: "Steve McConnell",
    genre: "Informatique",
    description:
      "Guide complet des meilleures pratiques de construction logicielle.",
    totalCopies: 3,
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    genre: "Informatique",
    description: "Les parties essentielles et élégantes de JavaScript.",
    totalCopies: 4,
  },
  {
    title: "Node.js Design Patterns",
    author: "Mario Casciaro",
    genre: "Informatique",
    description: "Patterns et bonnes pratiques pour applications Node.js.",
    totalCopies: 3,
  },
  {
    title: "Learning React",
    author: "Alex Banks & Eve Porcello",
    genre: "Informatique",
    description: "Guide moderne pour apprendre React et ses hooks.",
    totalCopies: 4,
  },
  {
    title: "MongoDB: The Definitive Guide",
    author: "Shannon Bradshaw",
    genre: "Informatique",
    description: "Tout sur MongoDB pour les développeurs et administrateurs.",
    totalCopies: 3,
  },
  {
    title: "RESTful Web APIs",
    author: "Leonard Richardson",
    genre: "Informatique",
    description: "Conception et développement d'APIs RESTful robustes.",
    totalCopies: 2,
  },

  // ── MATHÉMATIQUES ──
  {
    title: "Calculus",
    author: "James Stewart",
    genre: "Mathématiques",
    description:
      "Le manuel de référence pour le calcul différentiel et intégral.",
    totalCopies: 5,
  },
  {
    title: "Linear Algebra and Its Applications",
    author: "Gilbert Strang",
    genre: "Mathématiques",
    description:
      "Algèbre linéaire avec applications pratiques et géométriques.",
    totalCopies: 4,
  },
  {
    title: "Discrete Mathematics and Its Applications",
    author: "Kenneth Rosen",
    genre: "Mathématiques",
    description: "Mathématiques discrètes pour informaticiens et ingénieurs.",
    totalCopies: 5,
  },
  {
    title: "Introduction to Probability",
    author: "Dimitri Bertsekas",
    genre: "Mathématiques",
    description: "Probabilités et variables aléatoires avec exercices.",
    totalCopies: 3,
  },
  {
    title: "Mathematical Analysis",
    author: "Tom Apostol",
    genre: "Mathématiques",
    description: "Analyse mathématique rigoureuse pour étudiants avancés.",
    totalCopies: 2,
  },
  {
    title: "Graph Theory",
    author: "Reinhard Diestel",
    genre: "Mathématiques",
    description: "Théorie des graphes complète avec preuves et applications.",
    totalCopies: 3,
  },
  {
    title: "Numerical Methods for Engineers",
    author: "Chapra & Canale",
    genre: "Mathématiques",
    description: "Méthodes numériques appliquées à l'ingénierie.",
    totalCopies: 4,
  },

  // ── SCIENCES ──
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Sciences",
    description:
      "L'univers, le big bang et les trous noirs expliqués simplement.",
    totalCopies: 4,
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    genre: "Sciences",
    description: "La théorie de l'évolution vue à travers le prisme du gène.",
    totalCopies: 3,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Sciences",
    description:
      "Histoire de l'humanité depuis les origines jusqu'à aujourd'hui.",
    totalCopies: 5,
  },
  {
    title: "The Double Helix",
    author: "James D. Watson",
    genre: "Sciences",
    description:
      "La découverte de la structure de l'ADN racontée de l'intérieur.",
    totalCopies: 2,
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    genre: "Sciences",
    description: "Un voyage à travers l'univers et l'histoire des sciences.",
    totalCopies: 3,
  },
  {
    title: "The Feynman Lectures on Physics",
    author: "Richard Feynman",
    genre: "Sciences",
    description:
      "La physique expliquée par le plus grand pédagogue du XXe siècle.",
    totalCopies: 3,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Sciences",
    description: "Les deux systèmes de pensée qui gouvernent nos décisions.",
    totalCopies: 4,
  },

  // ── GESTION ──
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    genre: "Gestion",
    description: "Méthode pour créer et gérer des startups efficacement.",
    totalCopies: 4,
  },
  {
    title: "Good to Great",
    author: "Jim Collins",
    genre: "Gestion",
    description:
      "Pourquoi certaines entreprises passent de bonnes à excellentes.",
    totalCopies: 3,
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    genre: "Gestion",
    description: "Notes sur les startups et comment construire le futur.",
    totalCopies: 4,
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    genre: "Gestion",
    description: "Stratégie et leadership appliqués aux affaires modernes.",
    totalCopies: 3,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Gestion",
    description:
      "Comment construire de bonnes habitudes et éliminer les mauvaises.",
    totalCopies: 5,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Gestion",
    description: "Les règles pour réussir dans une économie distraite.",
    totalCopies: 3,
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    genre: "Gestion",
    description: "Les principes fondamentaux de l'efficacité personnelle.",
    totalCopies: 4,
  },
  {
    title: "Dare to Lead",
    author: "Brené Brown",
    genre: "Gestion",
    description: "Leadership courageux et cultures de confiance en entreprise.",
    totalCopies: 2,
  },

  // ── LITTÉRATURE ──
  {
    title: "1984",
    author: "George Orwell",
    genre: "Littérature",
    description: "Roman dystopique sur la surveillance et le totalitarisme.",
    totalCopies: 4,
  },
  {
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    genre: "Littérature",
    description: "Un conte philosophique sur l'essentiel et l'amitié.",
    totalCopies: 5,
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Littérature",
    description: "Une société future où le bonheur est imposé par le contrôle.",
    totalCopies: 3,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Littérature",
    description: "Le rêve américain et ses illusions dans les années 20.",
    totalCopies: 3,
  },
  {
    title: "L'Étranger",
    author: "Albert Camus",
    genre: "Littérature",
    description:
      "L'absurde et l'indifférence face au monde dans l'Algérie coloniale.",
    totalCopies: 4,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");

    await Book.deleteMany({});
    console.log("🗑️  Anciens livres supprimés");

    const inserted = await Book.insertMany(
      books.map((b) => ({
        ...b,
        availableCopies: b.totalCopies,
        description: b.description || "",
      })),
    );

    console.log(`\n📚 ${inserted.length} livres insérés avec succès !\n`);

    const byGenre = books.reduce((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1;
      return acc;
    }, {});

    console.log("📊 Répartition par genre :");
    Object.entries(byGenre).forEach(([genre, count]) => {
      console.log(`   ${genre} : ${count} livres`);
    });

    console.log("\n✅ Seed terminé !\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
};

seed();
