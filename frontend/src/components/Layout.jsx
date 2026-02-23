import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const navItems = [
  { to: "/app/dashboard", icon: "◈", labelKey: "dashboardNav" },
  { to: "/app/catalogue", icon: "📚", labelKey: "catalogue" },
  { to: "/app/loans", icon: "↩", labelKey: "loans" },
  { to: "/app/ai", icon: "✦", labelKey: "ai" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
              <span className="text-base font-bold text-white">L</span>
            </div>
            <div>
              <h1 className="leading-tight text-base font-semibold text-slate-900">
                LibraFlow
              </h1>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Smart Library
              </p>
            </div>
          </div>

          <nav className="mb-6 flex flex-wrap gap-2 md:flex-col md:gap-1">
            {navItems.map(({ to, icon, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "nav-link-active" : "")
                }
              >
                <span>{icon}</span>
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-slate-200 pt-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-semibold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  {user?.role || "Guest"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleLang}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              title={
                lang === "fr" ? "Switch to English" : "Changer en français"
              }
            >
              <span className="inline-flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs">
                  {lang === "fr" ? "🇫🇷" : "🇬🇧"}
                </span>
                <span className="uppercase text-xs">{lang}</span>
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
              title={t("logout")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
