import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const GENRES = [
  "Informatique",
  "Mathematiques",
  "Sciences",
  "Gestion",
  "Litterature",
  "Autre",
];

export default function Catalogue() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  // Genre-based cover colors and icons
  const getGenreStyle = (bookGenre) => {
    const styles = {
      Informatique: { bg: "from-blue-500 to-cyan-600", icon: "💻" },
      Mathematiques: { bg: "from-purple-500 to-pink-600", icon: "🔢" },
      Sciences: { bg: "from-green-500 to-emerald-600", icon: "🔬" },
      Gestion: { bg: "from-amber-500 to-orange-600", icon: "📊" },
      Litterature: { bg: "from-rose-500 to-red-600", icon: "📖" },
      Autre: { bg: "from-slate-500 to-slate-600", icon: "📚" },
    };
    return styles[bookGenre] || styles["Autre"];
  };

  const getDisplayImage = (book) => {
    if (book.coverImage) return book.coverImage;
    const style = getGenreStyle(book.genre);
    return null; // Will use gradient placeholder
  };

  const fetchBooks = function () {
    var params = {};
    if (search) params.search = search;
    if (genre) params.genre = genre;
    api.get("/books", { params: params }).then(function (res) {
      setBooks(res.data);
      setLoading(false);
    });
  };

  useEffect(
    function () {
      fetchBooks();
    },
    [search, genre],
  );

  const handleAdd = async function (e) {
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

  const handleDelete = async function (id) {
    if (!window.confirm("Supprimer ce livre ?")) return;
    await api.delete("/books/" + id);
    fetchBooks();
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
        {user && user.role === "librarian" && (
          <button
            onClick={function () {
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
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

      {/* Add Book Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-6 animate-slide-down"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t("addBook")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder={t("title")}
              value={form.title}
              onChange={function (e) {
                setForm({ ...form, title: e.target.value });
              }}
              className="input"
            />
            <input
              required
              placeholder={t("author")}
              value={form.author}
              onChange={function (e) {
                setForm({ ...form, author: e.target.value });
              }}
              className="input"
            />
            <select
              value={form.genre}
              onChange={function (e) {
                setForm({ ...form, genre: e.target.value });
              }}
              className="input"
            >
              {GENRES.map(function (g) {
                return <option key={g}>{g}</option>;
              })}
            </select>
            <input
              type="number"
              min="1"
              placeholder={t("copies")}
              value={form.totalCopies}
              onChange={function (e) {
                setForm({ ...form, totalCopies: parseInt(e.target.value) });
              }}
              className="input"
            />
            <textarea
              placeholder={t("description")}
              value={form.description}
              onChange={function (e) {
                setForm({ ...form, description: e.target.value });
              }}
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
              onClick={function () {
                setShowForm(false);
              }}
              className="btn btn-secondary"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
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
            onChange={function (e) {
              setSearch(e.target.value);
            }}
            className="input pl-10"
          />
        </div>
        <select
          value={genre}
          onChange={function (e) {
            setGenre(e.target.value);
          }}
          className="input w-48"
        >
          <option value="">{t("allGenres")}</option>
          {GENRES.map(function (g) {
            return <option key={g}>{g}</option>;
          })}
        </select>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Couverture
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("book")}
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("genre")}
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("availableCopies")}
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("status")}
              </th>
              {user && user.role === "librarian" && (
                <th className="px-6 py-4" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    <span>{t("loading")}</span>
                  </div>
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  {t("noBooks")}
                </td>
              </tr>
            ) : (
              books.map(function (book) {
                return (
                  <tr
                    key={book._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {book.title}
                      </p>
                      <p className="text-xs text-slate-500">{book.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                        {book.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      <span
                        className={
                          book.availableCopies > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }
                      >
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-300">
                        /{book.totalCopies}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {book.availableCopies > 0 ? (
                        <span className="badge badge-success">
                          {t("availableStatus")}
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          {t("borrowedStatus")}
                        </span>
                      )}
                    </td>
                    {user && user.role === "librarian" && (
                      <td className="px-6 py-4">
                        <button
                          onClick={function () {
                            handleDelete(book._id);
                          }}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {t("delete")}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
