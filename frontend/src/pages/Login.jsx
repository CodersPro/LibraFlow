import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import api from "../api/axios";
import logo from "../assets/logo_LibraFlow.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("student"); // 'student' or 'admin'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);

      // Vérification stricte du rôle choisi vs rôle réel
      if (role === "admin" && data.role !== "librarian") {
        throw new Error("Cet utilisateur n'est pas un administrateur");
      }
      if (role === "student" && data.role !== "student") {
        throw new Error("Cet utilisateur n'est pas un étudiant");
      }

      login(data);
      navigate("/app/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message || err.message || "Erreur de connexion"
      );
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

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 overflow-hidden relative">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8 relative z-10">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${role === "student"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t("student")}
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${role === "admin"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t("admin")}
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className={`w-1.5 h-6 rounded-full ${role === 'admin' ? 'bg-indigo-500' : 'bg-sky-500'}`}></div>
            {role === "admin" ? t("adminLogin") : t("studentLogin")}
          </h2>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder={role === "admin" ? "admin@bit.edu" : "etudiant@bit.edu"}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("password")}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${role === "admin"
                  ? "from-indigo-600 to-violet-700"
                  : "from-sky-500 to-indigo-600"
                } text-white rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
            >
              {loading ? t("connecting") : t("signIn")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              {t("noAccount")} {" "}
              <Link to="/register" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
                {t("register")}
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
