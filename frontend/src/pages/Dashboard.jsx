import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../hooks/useToast";

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white border border-amber-100 rounded-xl p-5 relative overflow-hidden">
      <div className={"absolute top-0 left-0 right-0 h-1 " + color} />
      <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="font-serif text-4xl font-bold text-stone-900">{value}</p>
      <span className="absolute bottom-4 right-4 text-3xl opacity-10">
        {icon}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats")
      .then(function (res) {
        setStats(res.data);
        setLoading(false);
      })
      .catch(function () {
        setLoading(false);
        toast.error(t("noData"));
      });
  }, []);

  if (loading)
    return (
      <div className="p-8 text-stone-400 font-mono text-sm">{t("loading")}</div>
    );

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">
          {t("overview")}
        </p>
        <h2 className="font-serif text-3xl font-bold text-stone-900">
          {t("dashboardTitle")}
        </h2>
      </div>
      {stats ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label={t("totalBooks")}
              value={stats.totalBooks}
              color="bg-amber-400"
              icon="📚"
            />
            <StatCard
              label={t("activeLoans")}
              value={stats.activeLoans}
              color="bg-orange-400"
              icon="↩"
            />
            <StatCard
              label={t("available")}
              value={stats.availableBooks}
              color="bg-green-500"
              icon="✓"
            />
            <StatCard
              label={t("late")}
              value={stats.lateLoans}
              color="bg-red-500"
              icon="⚠"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-50">
                <h3 className="font-serif text-lg font-bold">
                  {t("mostBorrowed")}
                </h3>
              </div>
              <div className="divide-y divide-amber-50">
                {stats.topBooks &&
                  stats.topBooks.map(function (b, i) {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-6 py-3"
                      >
                        <span className="font-serif text-2xl font-bold text-stone-200">
                          {i < 9 ? "0" + (i + 1) : i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-stone-800">
                            {b.title}
                          </p>
                          <p className="text-xs text-stone-400">
                            {b.author} · {b.count} {t("loans")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-50">
                <h3 className="font-serif text-lg font-bold">
                  {t("booksByGenre")}
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {stats.byGenre &&
                  stats.byGenre.map(function (g, i) {
                    var max = stats.byGenre[0].count;
                    var colors = [
                      "bg-stone-900",
                      "bg-amber-400",
                      "bg-green-500",
                      "bg-orange-400",
                      "bg-red-400",
                    ];
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{g._id}</span>
                          <span className="text-xs font-mono text-stone-400">
                            {g.count}
                          </span>
                        </div>
                        <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
                          <div
                            className={
                              "h-full rounded-full " +
                              (colors[i] || "bg-stone-300")
                            }
                            style={{ width: (g.count / max) * 100 + "%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-stone-400 text-sm">{t("noData")}</p>
      )}
    </div>
  );
}
