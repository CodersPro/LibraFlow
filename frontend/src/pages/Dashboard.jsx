import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

function StatCard({ label, value, color, icon }) {
  const { t } = useLanguage();

  const colorClasses = {
    blue: "from-sky-500 to-sky-600",
    orange: "from-orange-500 to-orange-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 card-hover group">
      <div
        className={`h-1 w-full bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} rounded-t-xl -mx-5 -mt-5 mb-4`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {t(label)}
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
}

function BookCarousel({ books, title, onViewAll }) {
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            {t("viewAll")}
          </button>
        )}
      </div>
      <div className="relative">
        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 p-6 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((book, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="h-32 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg mb-3 flex items-center justify-center text-white text-4xl font-bold group-hover:scale-105 transition-transform">
                📖
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {book.title}
              </p>
              <p className="text-xs text-slate-500 truncate">{book.author}</p>
              {book.genre && (
                <span className="inline-block mt-2 text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                  {book.genre}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-lg transition-all"
        >
          ←
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-lg transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allBooks, setAllBooks] = useState([]);

  const isStudent = user && user.role === "student";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get("/stats");
        setStats(statsRes.data);

        // Fetch all books for search
        const booksRes = await api.get("/books");
        setAllBooks(booksRes.data);

        // If student, fetch their recommendations and history
        if (isStudent) {
          try {
            const recRes = await api.post("/ai/recommend");
            setRecommendedBooks(recRes.data.recommendations || []);
          } catch (e) {
            // Use some books as fallback recommendations
            setRecommendedBooks(
              booksRes.data.slice(0, 5).map((b) => ({
                title: b.title,
                author: b.author,
                genre: b.genre,
              })),
            );
          }

          // Fetch user loans for history
          try {
            const loansRes = await api.get("/loans");
            setUserHistory(loansRes.data || []);
          } catch (e) {
            setUserHistory([]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isStudent]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleViewAllRecs = () => {
    navigate("/ai?tab=recs");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
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
          <span className="text-sm">{t("loading")}</span>
        </div>
      </div>
    );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
          {t("overview")}
        </p>
        <h2 className="text-3xl font-bold text-slate-900">
          {t("dashboardTitle")}
        </h2>
      </div>

      {/* Student Features: Search Bar & Actions */}
      {isStudent && (
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchBooks")}
              className="w-full px-5 py-4 pl-12 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all shadow-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all"
            >
              {t("search")}
            </button>
          </form>

          {/* Action Buttons: History & Notifications */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showHistory
                  ? "bg-sky-100 text-sky-700"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {t("history")}
            </button>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowHistory(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showNotifications
                  ? "bg-sky-100 text-sky-700"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {t("notifications")}
              {notifications.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden animate-slide-down">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("yourHistory")}
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userHistory.length > 0 ? (
                  userHistory.map((loan, i) => (
                    <div
                      key={i}
                      className="px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {loan.book?.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(loan.createdAt).toLocaleDateString()} -{" "}
                        <span
                          className={
                            loan.status === "returned"
                              ? "text-emerald-600"
                              : loan.status === "late"
                                ? "text-red-600"
                                : "text-amber-600"
                          }
                        >
                          {loan.status === "returned"
                            ? t("returned")
                            : loan.status === "late"
                              ? t("late")
                              : t("active")}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="px-6 py-8 text-center text-slate-400">
                    {t("noLoans")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden animate-slide-down">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("notifications")}
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, i) => (
                    <div
                      key={i}
                      className="px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <p className="text-sm text-slate-900">{notif.message}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(notif.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      🔔
                    </div>
                    <p className="text-slate-400 text-sm">
                      {t("noNotifications")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommended Books Carousel */}
          {recommendedBooks.length > 0 && (
            <BookCarousel
              books={recommendedBooks}
              title={t("recommendedForYou")}
              onViewAll={handleViewAllRecs}
            />
          )}
        </div>
      )}

      {/* Stats Grid - Shown for everyone */}
      {stats ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="totalBooks"
              value={stats.totalBooks}
              color="blue"
              icon="📚"
            />
            <StatCard
              label="activeLoans"
              value={stats.activeLoans}
              color="orange"
              icon="↩"
            />
            <StatCard
              label="available"
              value={stats.availableBooks}
              color="green"
              icon="✓"
            />
            <StatCard
              label="late"
              value={stats.lateLoans}
              color="red"
              icon="⚠"
            />
          </div>

          {/* Charts Row - Only for librarians */}
          {user && user.role === "librarian" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Most Borrowed Books */}
              <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t("mostBorrowed")}
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {stats.topBooks &&
                    stats.topBooks.map(function (b, i) {
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {i < 9 ? "0" + (i + 1) : i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {b.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {b.author} · {b.count} {t("loans").toLowerCase()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Books by Genre */}
              <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t("booksByGenre")}
                  </h3>
                </div>
                <div className="px-6 py-5 space-y-5">
                  {stats.byGenre &&
                    stats.byGenre.map(function (g, i) {
                      var max = stats.byGenre[0].count;
                      var colors = [
                        "from-sky-500 to-sky-600",
                        "from-indigo-500 to-indigo-600",
                        "from-emerald-500 to-emerald-600",
                        "from-purple-500 to-purple-600",
                        "from-pink-500 to-pink-600",
                      ];
                      return (
                        <div key={i}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              {g._id}
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                              {g.count}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${colors[i] || colors[0]} transition-all duration-500`}
                              style={{ width: (g.count / max) * 100 + "%" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <p className="text-slate-500">{t("noData")}</p>
        </div>
      )}
    </div>
  );
}
