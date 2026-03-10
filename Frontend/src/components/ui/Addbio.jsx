import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PenLine,
} from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

// ─── Suggestions ──────────────────────────────────────────────────────────────
const BIO_SUGGESTIONS = [
  "Building things on the internet 🛠️",
  "Developer • Designer • Creator",
  "Turning coffee into code ☕",
  "Shipping products and sharing ideas",
  "Open source enthusiast & lifelong learner",
  "Full-stack developer crafting digital experiences",
  "Code. Build. Break. Learn. Repeat.",
  "Creating solutions one line of code at a time",
  "Passionate about clean code & great UX",
  "Debugging life one bug at a time 🐛",
  "Tech enthusiast exploring the web",
  "Building scalable apps for the modern web",
  "Always learning, always building",
  "Transforming ideas into code",
  "Developer by profession, creator by passion",
  "Crafting modern web experiences",
  "Frontend lover with a backend brain",
  "Problem solver with a keyboard",
  "Coding the future 🚀",
  "Minimal code, maximum impact",
  "Exploring tech and building cool stuff",
  "Learning today, building tomorrow",
  "Code is poetry",
  "Making the web a better place",
  "Just another human writing JavaScript"
];

// ─── AddBio Modal ─────────────────────────────────────────────────────────────
/**
 * Props:
 *   isOpen     {boolean}         — controls visibility
 *   onClose    {() => void}      — called when modal should close
 *   currentBio {string}          — pre-fills textarea if user already has a bio
 *   onSaved    {(bio: string) => void} — called with the new bio after success
 */
export default function AddBio({ isOpen, onClose, currentBio = "", onSaved }) {
  const [bio, setBio] = useState(currentBio);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [newsuggestion, setNewSuggestion] = useState(7);;
  const [prev,setprev] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef(null);

  const MAX = 160;
  const remaining = MAX - bio.length;
  const isOverLimit = remaining < 0;
  const isEmpty = bio.trim().length === 0;
  const canSave = !isEmpty && !isOverLimit && !saving;

  // Sync if parent passes a new currentBio (e.g. after profile fetch)
  useEffect(() => {
    if (isOpen) {
      setBio(currentBio);
      setStatus(null);
      setErrorMsg("");
    }
  }, [isOpen, currentBio]);

  // Auto-focus textarea
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => textareaRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !saving) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, saving]);

  const handleClose = () => {
    if (saving) return;
    setStatus(null);
    setErrorMsg("");
    onClose?.();
  };

  const moresuggestion = () =>{
    if(newsuggestion >= BIO_SUGGESTIONS.length) {
      setprev(0);
      setNewSuggestion(7);
      return;
    }
    setprev(newsuggestion);
    setNewSuggestion(newsuggestion + 7);
  }

  const handleTextareaChange = (e) => {
    setBio(e.target.value);
    setStatus(null);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleSuggestion = (text) => {
    setBio(text);
    setStatus(null);
    textareaRef.current?.focus();
    // Trigger resize
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 160) + "px";
      }
    }, 0);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    setErrorMsg("");
    try {
      await axiosInstance.post("/users/addbio", { bio: bio.trim() });
      setStatus("success");
      onSaved?.(bio.trim());
      // Auto-close after a brief success flash
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.response?.data?.message ?? "Couldn't save bio. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Ring progress values
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const fillRatio = Math.min(bio.length / MAX, 1);
  const dashOffset = circumference * (1 - fillRatio);
  const ringColor = isOverLimit
    ? "#f87171"
    : remaining <= 20
      ? "#eab308"
      : "#6366f1";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="bio-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* ── Sheet / Modal ── */}
          <motion.div
            key="bio-modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="fixed bottom-[64px] left-0 right-0 z-50 mx-auto w-full max-w-lg sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:px-4"
          >
            <div className="relative overflow-hidden rounded-t-3xl border border-white/[0.07] bg-[#0d1525] shadow-2xl shadow-black/80 sm:rounded-3xl">
              {/* Top accent gradient line */}
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* ── Drag handle (mobile) ── */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-white/[0.12]" />
              </div>

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 pb-3 pt-4 sm:pt-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
                    <PenLine size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {currentBio ? "Edit your bio" : "Add a bio"}
                    </h2>
                    <p className="text-[10px] text-gray-500">
                      Tell the world who you are
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleClose}
                  disabled={saving}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-500 transition-all hover:bg-white/[0.08] hover:text-white focus-visible:outline-none disabled:opacity-40"
                >
                  <X size={13} />
                </motion.button>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px bg-white/[0.05]" />

              {/* ── Textarea ── */}
              <div className="px-5 pt-4">
                <div
                  className={
                    "relative overflow-hidden rounded-2xl border transition-all duration-200 " +
                    (status === "error"
                      ? "border-red-500/40 bg-red-500/[0.04]"
                      : status === "success"
                        ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                        : "border-white/[0.08] bg-white/[0.03] focus-within:border-indigo-500/40 focus-within:bg-indigo-500/[0.03]")
                  }
                >
                  {/* Top shimmer when focused */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 transition-opacity duration-200 [.focus-within_&]:opacity-100" />

                  <textarea
                    ref={textareaRef}
                    value={bio}
                    onChange={handleTextareaChange}
                    placeholder="Software engineer. Building cool stuff. Lover of good coffee and open source…"
                    maxLength={MAX + 10}
                    rows={3}
                    className="w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-relaxed text-gray-200 placeholder-gray-600/70 outline-none"
                    style={{ minHeight: "90px", maxHeight: "160px", overflow: "auto" }}
                  />

                  {/* Char counter ring — bottom right inside box */}
                  <div className="flex items-center justify-end px-3 pb-2.5">
                    <div
                      className="relative flex h-7 w-7 items-center justify-center"
                      title={`${remaining} characters remaining`}
                    >
                      <svg
                        className="-rotate-90"
                        width="28"
                        height="28"
                        viewBox="0 0 28 28"
                      >
                        <circle
                          cx="14"
                          cy="14"
                          r={radius}
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="2.2"
                        />
                        <circle
                          cx="14"
                          cy="14"
                          r={radius}
                          fill="none"
                          stroke={bio.length === 0 ? "rgba(255,255,255,0.06)" : ringColor}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-150"
                        />
                      </svg>
                      {remaining <= 30 && (
                        <span
                          className={
                            "absolute text-[9px] font-bold tabular-nums " +
                            (isOverLimit ? "text-red-400" : "text-yellow-400")
                          }
                        >
                          {remaining}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Status messages ── */}
                <AnimatePresence mode="wait">
                  {status === "error" && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mt-2 flex items-center gap-1.5 rounded-xl bg-red-500/[0.08] px-3 py-2 text-[11px] text-red-400"
                    >
                      <AlertCircle size={11} className="shrink-0" />
                      {errorMsg}
                    </motion.div>
                  )}
                  {status === "success" && (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mt-2 flex items-center gap-1.5 rounded-xl bg-emerald-500/[0.08] px-3 py-2 text-[11px] text-emerald-400"
                    >
                      <CheckCircle2 size={11} className="shrink-0" />
                      Bio saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Suggestions ── */}
              <div className="px-5 pt-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={10} className="text-indigo-400/70" />
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Quick starters
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BIO_SUGGESTIONS.map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestion(s)}
                      disabled={saving}
                      className={
                        "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all focus-visible:outline-none disabled:opacity-40 " +
                        (bio === s
                          ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                          : "border-white/[0.07] bg-white/[0.02] text-gray-500 hover:border-indigo-500/30 hover:bg-indigo-500/[0.08] hover:text-indigo-300")
                      }
                    >
                      {s}
                    </motion.button>
                  )).slice(prev, newsuggestion)}
                </div>
                <button
                onClick={()=> moresuggestion()}
                >
                  more suggestions
                </button>
              </div>

              {/* ── Footer actions ── */}
              <div className="flex items-center justify-end gap-2 px-5 pb-6 pt-4">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-white/[0.05] hover:text-white focus-visible:outline-none disabled:opacity-40"
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={canSave ? { scale: 0.95 } : {}}
                  onClick={handleSave}
                  disabled={!canSave}
                  className={
                    "flex min-w-[90px] items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none " +
                    (status === "success"
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                      : canSave
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500"
                        : "cursor-not-allowed bg-white/[0.04] text-gray-600")
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Saving…
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 size={11} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <PenLine size={11} strokeWidth={2.3} />
                      {currentBio ? "Update bio" : "Save bio"}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}