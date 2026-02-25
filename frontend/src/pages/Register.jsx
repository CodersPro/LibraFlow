import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import logo from "../assets/logo_LibraFlow.png";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    studentId: ""
  });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success(t("registrationSuccess"));
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-dots">
      <div className="fixed top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 transform hover:scale-105 transition-transform">
              <img src={logo} alt="LibraFlow Logo" className="w-full h-auto" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">LibraFlow</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "student" })}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${form.role === "student"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t("student")}
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "librarian" })}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${form.role === "librarian"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t("admin")}
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className={`w-1.5 h-6 rounded-full ${form.role === 'librarian' ? 'bg-indigo-500' : 'bg-sky-500'}`}></div>
            {form.role === "librarian" ? t("iamAdmin") : t("iamStudent")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("fullName")}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="Ex: Moussa K."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("email")}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("password")}
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="••••••••"
              />
            </div>

            {form.role === "student" && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ID Étudiant (BIT-XXX)
                </label>
                <input
                  type="text"
                  required
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="BIT-2024-001"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${form.role === "librarian"
                ? "from-indigo-600 to-violet-700"
                : "from-sky-500 to-indigo-600"
                } text-white rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
            >
              {loading ? t("processing") : t("register")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              {t("alreadyHaveAccount")} {" "}
              <Link to="/login" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          LibraFlow © 2024 • Smart Library Management
        </p>
      </div>
    </div>
  );
}
