import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../hooks/useToast";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "student" 
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" 
        ? { email: form.email, password: form.password }
        : form;

      const { data } = await api.post(endpoint, payload);
      
      if (mode === "register") {
        toast.success(t("registrationSuccess") || "Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setMode("login");
      } else {
        login(data);
        toast.success(t("welcomeBack") || "Bon retour !");
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
        {/* Header with tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-5 text-sm font-semibold transition-all ${
              mode === "login" ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/30" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("login")}
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-5 text-sm font-semibold transition-all ${
              mode === "register" ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/30" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("register") || "S'inscrire"}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10"
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {mode === "register" && (
            <div className="animate-slide-down">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                {t("name") || "Nom complet"}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="Jean Dupont"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              {t("email")}
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              {t("password")}
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl py-4 text-sm font-bold hover:shadow-lg hover:shadow-sky-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t("processing") || "Chargement..."}
              </span>
            ) : (
              mode === "login" ? t("login") : t("register") || "S'inscrire"
            )}
          </button>
        </form>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-xs text-slate-400">
             LibraFlow &copy; 2024 &bull; Smart Library Management
           </p>
        </div>
      </div>
    </div>
  );
}
