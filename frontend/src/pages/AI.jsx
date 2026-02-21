import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function AI() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isLibrarian = user && user.role === "librarian";
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Bonjour ! Je suis votre assistant bibliothecaire propulse par BookAI. Vous pouvez me poser des questions sur des livres, demander des recommandations, ou discuter de litterature !",
    },
  ]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);

  const [bookId, setBookId] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSum, setLoadingSum] = useState(false);

  const [statsSummary, setStatsSummary] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(
    function () {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },
    [messages],
  );

  const sendMessage = async function () {
    if (!input.trim()) return;
    var userMsg = input.trim();
    setInput("");
    setMessages(function (prev) {
      return [...prev, { role: "user", text: userMsg }];
    });
    setLoadingChat(true);

    try {
      const res = await api.post("/ai/chat", { message: userMsg });
      setMessages(function (prev) {
        return [...prev, { role: "assistant", text: res.data.reply }];
      });
    } catch (err) {
      setMessages(function (prev) {
        return [
          ...prev,
          {
            err: true,
            role: "assistant",
            text: "Erreur : " + (err.response?.data?.message || err.message),
          },
        ];
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyDown = function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRecommendations = async function () {
    setLoadingRec(true);
    try {
      const res = await api.post("/ai/recommend");
      setRecommendations(
        Array.isArray(res.data.recommendations) ? res.data.recommendations : [],
      );
    } catch (err) {
      alert("Erreur IA : " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingRec(false);
    }
  };

  const getSummary = async function () {
    if (!bookId) {
      alert("Entre un ID de livre");
      return;
    }
    setLoadingSum(true);
    try {
      const res = await api.post("/ai/summarize", { bookId: bookId });
      setSummary(res.data.summary);
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSum(false);
    }
  };

  const getStatsSummary = async function () {
    setLoadingStats(true);
    try {
      const res = await api.get("/ai/stats-summary");
      setStatsSummary(res.data.summary);
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingStats(false);
    }
  };

  var tabs = [
    { id: "chat", labelKey: "chat", icon: "💬" },
    { id: "recs", labelKey: "recommendations", icon: "✦" },
    { id: "summary", labelKey: "summary", icon: "📖" },
    ...(isLibrarian ? [{ id: "stats", labelKey: "stats", icon: "📊" }] : []),
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
          {t("artificialIntelligence")}
        </p>
        <h2 className="text-3xl font-bold text-slate-900">{t("geminiAI")}</h2>
        <p className="text-slate-500 text-sm mt-1">{t("poweredBy")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(function (tab) {
          return (
            <button
              key={tab.id}
              onClick={function () {
                setActiveTab(tab.id);
              }}
              className={
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 " +
                (activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              <span>{tab.icon}</span>
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* ── CHAT ── */}
      {activeTab === "chat" && (
        <div
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          style={{ height: "560px" }}
        >
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold">{t("geminiAI")}</h3>
              <p className="text-xs text-slate-500">BookAI Pro</p>
            </div>
            <span className="ml-auto flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map(function (msg, i) {
              return (
                <div
                  key={i}
                  className={
                    "flex " +
                    (msg.role === "user" ? "justify-end" : "justify-start")
                  }
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-2 flex-shrink-0">
                      B
                    </div>
                  )}
                  <div
                    className={
                      "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed " +
                      (msg.role === "user"
                        ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm")
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {loadingChat && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-2 flex-shrink-0">
                  B
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <input
              value={input}
              onChange={function (e) {
                setInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("askQuestion")}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={loadingChat || !input.trim()}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-40 shadow-md"
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}

      {/* ── RECOMMANDATIONS ── */}
      {activeTab === "recs" && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("personalizedRecs")}
            </h3>
            <p className="text-slate-500 text-xs mt-1">{t("basedOnHistory")}</p>
          </div>
          <div className="p-6">
            <button
              onClick={getRecommendations}
              disabled={loadingRec}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3.5 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
            >
              {loadingRec ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                  {t("generating")}
                </>
              ) : (
                <>
                  <span>✦</span> {t("generateRecs")}
                </>
              )}
            </button>
            <div className="mt-6 space-y-3">
              {recommendations.map(function (rec, i) {
                return (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {i < 9 ? "0" + (i + 1) : i + 1}
                    </span>
                    <div>
                      <p className="text-slate-900 text-sm font-medium">
                        {rec.title}
                      </p>
                      <p className="text-slate-500 text-xs mb-1">
                        {rec.author}
                      </p>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recommendations.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">📚</span>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {t("clickToGenerate")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESUME ── */}
      {activeTab === "summary" && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden max-w-xl">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("summary")}
            </h3>
            <p className="text-slate-500 text-xs mt-1">{t("enterBookId")}</p>
          </div>
          <div className="p-6">
            <input
              placeholder={t("bookId")}
              value={bookId}
              onChange={function (e) {
                setBookId(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all mb-4 font-mono"
            />
            <button
              onClick={getSummary}
              disabled={loadingSum}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-md"
            >
              {loadingSum ? t("generatingSummary") : t("generateSummary")}
            </button>
            {summary && (
              <div className="mt-5 bg-sky-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">
                  {t("geminiSummary")}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      {activeTab === "stats" && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden max-w-xl">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("intelligentAnalysis")}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              {t("libraryAnalysis")}
            </p>
          </div>
          <div className="p-6">
            <button
              onClick={getStatsSummary}
              disabled={loadingStats}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-md"
            >
              {loadingStats ? t("generating") : t("analyzeLibrary")}
            </button>
            {statsSummary && (
              <div className="mt-5 bg-sky-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">
                  {t("geminiSummary")}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {statsSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
