import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axios";
import { generateReturnReceiptPDF } from "../utils/generatePDF";

// ── Composant Scanner QR ──
// Utilisé par le bibliothécaire pour confirmer emprunts et retours
export default function QRScanner({ onClose, onSuccess }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [loanData, setLoanData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  // ── Démarrer la caméra ──
  const startCamera = async () => {
    if (mode !== "camera" || actionDone) return;
    setError("");
    setScanning(false);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSecure = window.isSecureContext || isLocalhost;

      if (!isSecure && window.location.protocol !== 'https:') {
        console.warn("Insecure context detected");
      }

      // Tentative de démarrage avec la caméra arrière, sinon n'importe laquelle (cas des PC)
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 24, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.65, height: Math.min(w, h) * 0.65 }) },
          (decodedText) => {
            html5QrCode.stop().catch(() => { });
            setScanning(false);
            handleQRResult(decodedText);
          },
          () => { }
        );
      } catch (backErr) {
        console.warn("Mode environment échoué, essai caméra par défaut...", backErr);
        await html5QrCode.start(
          undefined, // Utilise la caméra par défaut
          { fps: 24, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.65, height: Math.min(w, h) * 0.65 }) },
          (decodedText) => {
            html5QrCode.stop().catch(() => { });
            setScanning(false);
            handleQRResult(decodedText);
          },
          () => { }
        );
      }

      setScanning(true);
    } catch (err) {
      console.error("Camera Start Error:", err);
      let msg = "Erreur caméra. ";
      if (!window.isSecureContext && !isLocalhost) {
        msg += "Le navigateur bloque la caméra sur IP non-sécurisée. Utilisez http://localhost:5173 sur PC ou l'astuce chrome://flags sur mobile.";
      } else {
        msg += "Vérifiez que vous avez autorisé l'accès à la caméra dans les paramètres du navigateur.";
      }
      setError(msg);
    }
  };

  useEffect(() => {
    const timer = setTimeout(startCamera, 800);
    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, [mode, actionDone]);

  // ── Traiter le résultat QR (caméra ou manuel) ──
  const handleQRResult = async (raw) => {
    if (!raw) return;
    setError("");
    setLoanData(null);
    setLoading(true);

    try {
      // Extraire l'ID — format attendu : "LIBRAFLOW_LOAN:xxxxxxxx"
      let loanId = raw.trim();
      if (loanId.startsWith("LIBRAFLOW_LOAN:")) {
        loanId = loanId.replace("LIBRAFLOW_LOAN:", "");
      }

      const res = await api.get(`/loans/${loanId}`);
      setLoanData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Emprunt introuvable. Vérifiez l'ID.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmer l'emprunt (pending → active) ──
  const handleConfirmLoan = async () => {
    if (!loanData) return;
    setLoading(true);
    try {
      await api.put(`/loans/${loanData._id}/confirm`);
      setActionDone(true);
      if (onSuccess) onSuccess("confirmed");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la confirmation");
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmer le retour (active/late → returned) ──
  const handleConfirmReturn = async () => {
    if (!loanData) return;
    setLoading(true);
    try {
      const res = await api.put(`/loans/${loanData._id}/return`);
      generateReturnReceiptPDF(res.data); // générer le reçu PDF automatiquement
      setActionDone(true);
      if (onSuccess) onSuccess("returned");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du retour");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    active: "bg-sky-100 text-sky-700 border-sky-200",
    late: "bg-red-100 text-red-700 border-red-200",
    returned: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const statusLabel = {
    pending: "En attente de confirmation",
    active: "Emprunt actif",
    late: "En retard",
    returned: "Déjà retourné",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-lg">
              📷
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Scanner QR Code</h3>
              <p className="text-xs text-slate-500">
                Confirmer emprunt ou retour
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs caméra / manuel */}
        <div className="flex gap-1 p-3 bg-slate-100 mx-6 mt-4 rounded-xl">
          <button
            onClick={() => {
              setMode("camera");
              setLoanData(null);
              setError("");
              setActionDone(false);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "camera"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            📷 Caméra
          </button>
          <button
            onClick={() => {
              setMode("manual");
              setLoanData(null);
              setError("");
              setActionDone(false);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "manual"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            ⌨️ Saisie manuelle
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ── MODE CAMÉRA ── */}
          {mode === "camera" && !loanData && !actionDone && (
            <div className="relative">
              <div
                id="qr-reader"
                className="rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900"
                style={{ width: "100%", minHeight: "300px" }}
              />
              {!scanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-xs flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-sky-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Initialisation de la caméra...
                  </div>
                </div>
              )}
              {scanning && (
                <p className="text-center text-xs text-slate-400 mt-2 animate-pulse">
                  Pointez la caméra vers le QR code...
                </p>
              )}
              {error && (
                <div className="mt-4 space-y-3">
                  <p className="text-center text-xs text-red-500">{error}</p>
                  <button
                    onClick={startCamera}
                    className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    🔄 Réessayer d'allumer la caméra
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MODE MANUEL ── */}
          {mode === "manual" && !loanData && !actionDone && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ID de l'emprunt
              </label>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Collez l'ID MongoDB ou le code LIBRAFLOW_LOAN:..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                onClick={() => handleQRResult(manualId)}
                disabled={!manualId.trim() || loading}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:from-sky-600 hover:to-indigo-700"
              >
                {loading ? "Recherche..." : "Rechercher l'emprunt"}
              </button>
              {error && (
                <p className="text-center text-xs text-red-500">{error}</p>
              )}
            </div>
          )}

          {/* ── RÉSULTAT DU SCAN ── */}
          {loanData && !actionDone && (
            <div className="space-y-4">
              {/* Infos emprunt */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Emprunt trouvé
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[loanData.status]}`}
                  >
                    {statusLabel[loanData.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Étudiant</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {loanData.user?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {loanData.user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Livre</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {loanData.book?.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {loanData.book?.author}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Date limite</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(loanData.dueDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Demandé le</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(loanData.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-center text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Actions selon le statut */}
              {loanData.status === "pending" && (
                <button
                  onClick={handleConfirmLoan}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:from-emerald-600 hover:to-green-700 flex items-center justify-center gap-2 shadow-md"
                >
                  {loading ? "Confirmation..." : "✓  Confirmer l'emprunt"}
                </button>
              )}

              {(loanData.status === "active" || loanData.status === "late") && (
                <button
                  onClick={handleConfirmReturn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:from-sky-600 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md"
                >
                  {loading
                    ? "Traitement..."
                    : "↩  Confirmer le retour + Générer reçu PDF"}
                </button>
              )}

              {loanData.status === "returned" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 font-semibold text-sm">
                    ✓ Ce livre a déjà été retourné
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">
                    Retourné le{" "}
                    {new Date(loanData.returnedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setLoanData(null);
                  setError("");
                  setManualId("");
                }}
                className="w-full text-slate-500 text-sm hover:text-slate-700 transition-colors"
              >
                ← Scanner un autre QR code
              </button>
            </div>
          )}

          {/* ── SUCCÈS ── */}
          {actionDone && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <p className="font-semibold text-slate-900">
                Opération réussie !
              </p>
              <p className="text-sm text-slate-500">
                L'opération a été enregistrée avec succès.
              </p>
              <button
                onClick={() => {
                  setLoanData(null);
                  setActionDone(false);
                  setError("");
                  setManualId("");
                }}
                className="text-sky-600 text-sm font-medium hover:text-sky-700"
              >
                Scanner un autre →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
