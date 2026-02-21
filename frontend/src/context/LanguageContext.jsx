import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  fr: {
    // Navigation
    dashboardNav: "Tableau de bord",
    catalogue: "Catalogue",
    loans: "Emprunts",
    ai: "BookAI",
    logout: "Déconnexion",

    // Dashboard
    overview: "Vue générale",
    dashboardTitle: "Tableau de bord",
    searchBooks: "Rechercher un livre...",
    history: "Historique",
    notifications: "Notifications",
    recommendedForYou: "Recommandé pour vous",
    viewAll: "Voir tout",
    noNotifications: "Aucune notification",
    yourHistory: "Votre historique",
    totalBooks: "Total livres",
    activeLoans: "En emprunt",
    available: "Disponibles",
    late: "Retards",
    mostBorrowed: "Livres les plus empruntés",
    booksByGenre: "Livres par genre",
    noData: "Aucune donnée disponible.",
    loading: "Chargement...",

    // Catalogue
    library: "Bibliothèque",
    gestion: "Gestion",
    addBook: "Ajouter un livre",
    search: "Rechercher titre, auteur...",
    allGenres: "Tous les genres",
    title: "Titre",
    author: "Auteur",
    genre: "Genre",
    copies: "Nombre d'exemplaires",
    description: "Description (optionnel)",
    cancel: "Annuler",
    add: "Ajouter",
    delete: "Supprimer",
    noBooks: "Aucun livre trouvé",
    availableCopies: "Dispo",
    status: "Statut",
    availableStatus: "Disponible",
    borrowedStatus: "Emprunté",
    student: "Étudiant",
    dueDate: "Date limite",
    return: "Retourner",
    newLoan: "Nouvel emprunt",
    selectBook: "Choisir un livre",
    selectUser: "ID MongoDB de l'étudiant",
    create: "Créer",
    noLoans: "Aucun emprunt",
    active: "Actif",
    returned: "Retourné",

    // AI
    artificialIntelligence: "Intelligence Artificielle",
    geminiAI: "BookAI",
    poweredBy: "Assistant intelligent propulsé par BookAI",
    chat: "Chat",
    recommendations: "Recommandations",
    summary: "Résumé",
    stats: "Analyse stats",
    askQuestion:
      "Posez une question sur un livre, demandez une recommandation...",
    send: "Envoyer",
    personalizedRecs: "Recommandations personnalisées",
    basedOnHistory: "Basé sur votre historique d'emprunts",
    generateRecs: "Générer mes recommandations",
    generating: "Analyse en cours...",
    bookId: "ID MongoDB du livre",
    enterBookId: "Entrez un ID de livre",
    generateSummary: "Générer le résumé",
    generatingSummary: "Génération...",
    geminiSummary: "Résumé BookAI",
    intelligentAnalysis: "Analyse intelligente",
    libraryAnalysis: "BookAI analyse l'état de votre bibliothèque",
    analyzeLibrary: "Analyser la bibliothèque",
    clickToGenerate: "Cliquez sur le bouton pour générer vos recommandations",

    // Login
    login: "Connexion",
    intelligentSystem: "Système de gestion intelligent",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    connecting: "Connexion...",

    // Common
    book: "Livre",
    role: "Rôle",
    librarian: "Bibliothécaire",
    user: "Utilisateur",
    loans: "emprunts",
  },
  en: {
    // Navigation
    dashboardNav: "Dashboard",
    catalogue: "Catalogue",
    loans: "Loans",
    ai: "BookAI",
    logout: "Logout",

    // Dashboard
    overview: "Overview",
    dashboardTitle: "Dashboard",
    searchBooks: "Search for a book...",
    history: "History",
    notifications: "Notifications",
    recommendedForYou: "Recommended for you",
    viewAll: "View all",
    noNotifications: "No notifications",
    yourHistory: "Your history",
    totalBooks: "Total books",
    activeLoans: "Active Loans",
    available: "Available",
    late: "Late",
    mostBorrowed: "Most Borrowed Books",
    booksByGenre: "Books by Genre",
    noData: "No data available.",
    loading: "Loading...",

    // Catalogue
    library: "Library",
    gestion: "Management",
    addBook: "Add Book",
    search: "Search title, author...",
    allGenres: "All Genres",
    title: "Title",
    author: "Author",
    genre: "Genre",
    copies: "Number of copies",
    description: "Description (optional)",
    cancel: "Cancel",
    add: "Add",
    delete: "Delete",
    noBooks: "No books found",
    availableCopies: "Available",
    status: "Status",
    availableStatus: "Available",
    borrowedStatus: "Borrowed",
    student: "Student",
    dueDate: "Due Date",
    return: "Return",
    newLoan: "New Loan",
    selectBook: "Select a book",
    selectUser: "Student MongoDB ID",
    create: "Create",
    noLoans: "No loans",
    active: "Active",
    returned: "Returned",

    // AI
    artificialIntelligence: "Artificial Intelligence",
    geminiAI: "BookAI",
    poweredBy: "Smart assistant powered by BookAI",
    chat: "Chat",
    recommendations: "Recommendations",
    summary: "Summary",
    stats: "Stats Analysis",
    askQuestion: "Ask a question about a book, request a recommendation...",
    send: "Send",
    personalizedRecs: "Personalized Recommendations",
    basedOnHistory: "Based on your borrowing history",
    generateRecs: "Generate My Recommendations",
    generating: "Analyzing...",
    bookId: "Book MongoDB ID",
    enterBookId: "Enter a book ID",
    generateSummary: "Generate Summary",
    generatingSummary: "Generating...",
    geminiSummary: "BookAI Summary",
    intelligentAnalysis: "Intelligent Analysis",
    libraryAnalysis: "BookAI analyzes your library status",
    analyzeLibrary: "Analyze Library",
    clickToGenerate: "Click the button to generate your recommendations",

    // Login
    login: "Login",
    intelligentSystem: "Intelligent Management System",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    connecting: "Signing in...",

    // Common
    book: "Book",
    role: "Role",
    librarian: "Librarian",
    user: "User",
    loans: "loans",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fr");

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("libraflow-lang");
    if (saved) setLang(saved);
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("libraflow-lang", lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;
  const toggleLang = () => setLang((prev) => (prev === "fr" ? "en" : "fr"));

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
