import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Loans() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", bookId: "" });
  const [loading, setLoading] = useState(true);

  const fetchAll = function () {
    Promise.all([api.get("/loans"), api.get("/books")]).then(
      function (results) {
        setLoans(results[0].data);
        setBooks(
          results[1].data.filter(function (b) {
            return b.availableCopies > 0;
          }),
        );
        setLoading(false);
      },
    );
  };

  useEffect(function () {
    fetchAll();
  }, []);

  const handleCreate = async function (e) {
    e.preventDefault();
    try {
      await api.post("/loans", form);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(
        err.response && err.response.data
          ? err.response.data.message
          : "Erreur",
      );
    }
  };

  const handleReturn = async function (id) {
    await api.put("/loans/" + id + "/return");
    fetchAll();
  };

  const statusColor = function (status) {
    if (status === "returned") return "badge-success";
    if (status === "late") return "badge-danger";
    return "badge-warning";
  };

  const statusLabel = function (status) {
    if (status === "returned") return t("returned");
    if (status === "late") return t("late");
    return t("active");
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
            {t("gestion")}
          </p>
          <h2 className="text-3xl font-bold text-slate-900">{t("loans")}</h2>
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
            {t("newLoan")}
          </button>
        )}
      </div>

      {/* New Loan Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-6 animate-slide-down"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t("newLoan")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t("student")} ID (MongoDB)
              </label>
              <input
                required
                placeholder="ex: 64f3a..."
                value={form.userId}
                onChange={function (e) {
                  setForm({ ...form, userId: e.target.value });
                }}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t("book")}
              </label>
              <select
                required
                value={form.bookId}
                onChange={function (e) {
                  setForm({ ...form, bookId: e.target.value });
                }}
                className="input"
              >
                <option value="">{t("selectBook")}</option>
                {books.map(function (b) {
                  return (
                    <option key={b._id} value={b._id}>
                      {b.title} ({b.availableCopies}{" "}
                      {t("available").toLowerCase()})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary">
              {t("create")}
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

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("student")}
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("book")}
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("dueDate")}
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
            ) : loans.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  {t("noLoans")}
                </td>
              </tr>
            ) : (
              loans.map(function (loan) {
                return (
                  <tr
                    key={loan._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {loan.user && loan.user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {loan.user && loan.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {loan.book && loan.book.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {loan.book && loan.book.author}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusColor(loan.status)}`}>
                        {statusLabel(loan.status)}
                      </span>
                    </td>
                    {user && user.role === "librarian" && (
                      <td className="px-6 py-4">
                        {loan.status !== "returned" && (
                          <button
                            onClick={function () {
                              handleReturn(loan._id);
                            }}
                            className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {t("return")}
                          </button>
                        )}
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
