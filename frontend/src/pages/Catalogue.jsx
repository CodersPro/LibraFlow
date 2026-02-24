import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../hooks/useToast";
import { generateLoanPDF } from "../utils/generatePDF";


const GENRES = [
  "Informatique",
  "Mathematiques",
  "Sciences",
  "Gestion",
  "Litterature",
  "Autre",
];

const GENRE_STYLES = {
  Informatique: {
    bg: "from-blue-500 to-cyan-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    icon: "💻",
  },
  Mathematiques: {
    bg: "from-purple-500 to-pink-600",
    light: "bg-purple-50",
    text: "text-purple-700",
    icon: "🔢",
  },
  Sciences: {
    bg: "from-green-500 to-emerald-600",
    light: "bg-green-50",
    text: "text-green-700",
    icon: "🔬",
  },
  Gestion: {
    bg: "from-amber-500 to-orange-600",
    light: "bg-amber-50",
    text: "text-amber-700",
    icon: "📊",
  },
  Litterature: {
    bg: "from-rose-500 to-red-600",
    light: "bg-rose-50",
    text: "text-rose-700",
    icon: "📖",
  },
  Autre: {
    bg: "from-slate-400 to-slate-600",
    light: "bg-slate-50",
    text: "text-slate-700",
    icon: "📚",
  },
};

const getStyle = (genre) => GENRE_STYLES[genre] || GENRE_STYLES["Autre"];

export default function Catalogue() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "Informatique",
    totalCopies: 1,
    description: "",
    coverImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState(null);
  const [borrowSuccess, setBorrowSuccess] = useState(null);

  const fetchBooks = () => {
    const params = {};
    if (search) params.search = search;
    if (genre) params.genre = genre;
    api.get("/books", { params }).then((res) => {
      setBooks(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBooks();
  }, [search, genre]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post("/books", form);
    setShowForm(false);
    setForm({
      title: "",
      author: "",
      genre: "Informatique",
      totalCopies: 1,
      description: "",
      coverImage: "",
    });
    fetchBooks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await api.delete("/books/" + id);
      fetchBooks();
      toast.success(t("bookDeleteSuccess"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("errorOccurred"));
    }
  };

  const handleBorrow = async (book) => {
    setBorrowingId(book._id);
    setBorrowSuccess(null);
    try {
      const loanRes = await api.post("/loans", { bookId: book._id });
      const loan = loanRes.data;
      const qrRes = await api.get(`/loans/${loan._id}/qrcode`);
      generateLoanPDF(loan, qrRes.data.qrCode);
      setBorrowSuccess({ bookTitle: book.title });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'emprunt");
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
            {t("library")}
          </p>
          <h2 className="text-3xl font-bold text-slate-900">
            {t("catalogue")}
          </h2>
        </div>
        {user?.role === "librarian" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("addBook")}
          </button>
        )}
      </div>

      {borrowSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-slide-down">
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <p className="font-semibold text-emerald-800">{t("borrowSuccessTitle")}</p>
            <p className="text-sm text-emerald-600">
              {t("borrowSuccessDesc").split("<strong>")[0]} <strong>{borrowSuccess.bookTitle}</strong>{" "}
              {t("borrowSuccessDesc").split("</strong>")[1]}
            </p>
          </div>
          <button
            onClick={() => setBorrowSuccess(null)}
            className="text-emerald-400 hover:text-emerald-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Formulaire ajout livre */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-6 animate-slide-down"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t("addBook")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder={t("title")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
            />
            <input
              required
              placeholder={t("author")}
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="input"
            />
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="input"
            >
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder={t("copies")}
              value={form.totalCopies}
              onChange={(e) =>
                setForm({ ...form, totalCopies: parseInt(e.target.value) })
              }
              className="input"
            />
            <textarea
              placeholder={t("description")}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input col-span-2 resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary">
              {t("add")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Recherche & Filtre */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">{t("allGenres")}</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      {!loading && (
        <p className="text-xs text-slate-400 mb-5">
          {books.length} {t("book")}{books.length !== 1 ? "s" : ""} {t("found") || "trouvé"}{books.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── GRILLE DE CARTES ── */}
      {loading ? (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">{t("loading")}</span>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <span className="text-5xl mb-4">📭</span>
          <p className="text-sm">{t("noBooks")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {books.map((book) => {
            const style = getStyle(book.genre);
            const isAvailable = book.availableCopies > 0;
            const isBorrowing = borrowingId === book._id;

            return (
              <div
                key={book._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                {/* ── Couverture ── */}
                <div
                  className={`relative bg-gradient-to-br ${style.bg} h-44 flex flex-col items-center justify-center overflow-hidden`}
                >
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {/* Cercles décoratifs en arrière-plan */}
                      <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white opacity-10" />
                      <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white opacity-10" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white opacity-5" />

                      {/* Icône genre */}
                      <span className="text-5xl drop-shadow-lg z-10">
                        {style.icon}
                      </span>

                      {/* Titre sur la couverture */}
                      <p className="text-white text-xs font-semibold text-center px-3 mt-2 leading-tight line-clamp-2 drop-shadow z-10">
                        {book.title}
                      </p>
                    </>
                  )}

                  {/* Badge disponibilité en haut à droite */}
                  <div className="absolute top-2 right-2 z-20">
                    {isAvailable ? (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        ✓ {t("availableStatus")}
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        ✗ {t("borrowedStatus")}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Infos ── */}
                <div className="p-3 flex flex-col flex-1 bg-slate-50">
                  {/* Titre */}
                  <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 mb-1">
                    {book.title}
                  </p>
                  {/* Auteur */}
                  <p className="text-xs text-slate-500 truncate mb-2">
                    {book.author}
                  </p>

                  {/* Genre tag */}
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${style.light} ${style.text} w-fit mb-2`}
                  >
                    {book.genre}
                  </span>

                  {/* Copies dispo */}
                  <div className="flex items-center justify-between text-xs mb-3 mt-auto">
                    <span className="text-slate-400">{t("copiesLabel")}</span>
                    <span className="font-semibold">
                      <span
                        className={
                          isAvailable ? "text-emerald-600" : "text-red-500"
                        }
                      >
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-300">
                        /{book.totalCopies}
                      </span>
                    </span>
                  </div>

                  {/* Bouton étudiant */}
                  {user?.role === "student" && (
                    <button
                      onClick={() => handleBorrow(book)}
                      disabled={!isAvailable || isBorrowing}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                        isAvailable && !isBorrowing
                          ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 shadow-sm"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isBorrowing ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg
                            className="animate-spin h-3 w-3"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {t("borrowing")}
                        </span>
                      ) : isAvailable ? (
                        t("borrow")
                      ) : (
                        t("unavailable")
                      )}
                    </button>
                  )}

                  {/* Bouton bibliothécaire */}
                  {user?.role === "librarian" && (
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="w-full py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    >
                      🗑 {t("delete")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
