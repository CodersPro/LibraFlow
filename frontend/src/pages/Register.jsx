import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";

export default function Register() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "student" 
  });
  const [loading, setLoading] = useState(false);
  const { t, lang, toggleLang } = useLanguage();
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
      {/* Language Toggle */}
      <div className="fixed top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">LibraFlow</h1>
          <p className="text-slate-500 text-sm mt-1">{t("intelligentSystem")}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {t("register")}
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
                placeholder="Jean Dupont"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:from-sky-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? t("processing") : t("register")}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              {t("alreadyHaveAccount")} {" "}
              <Link to="/login" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          LibraFlow &copy; 2024 &bull; Smart Library Management
        </p>
      </div>
    </div>
  );
}
