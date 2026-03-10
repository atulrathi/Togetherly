import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PenLine,
  AtSign,
  EyeOff,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, maxLength, hint, error, type = "text" }) {
  const pct = maxLength ? value.length / maxLength : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium tracking-wide text-gray-500">
          {label}
        </label>
        {maxLength && (
          <span className={
            "text-[10px] tabular-nums font-medium " +
            (value.length > maxLength ? "text-red-400" : pct > 0.85 ? "text-amber-400" : "text-gray-700")
          }>
            {value.length}<span className="text-gray-700">/{maxLength}</span>
          </span>
        )}
      </div>

      <div className={
        "relative rounded-2xl border transition-all duration-300 " +
        (error
          ? "border-red-500/30 bg-red-500/[0.03]"
          : "border-white/[0.07] bg-white/[0.025] focus-within:border-indigo-500/35 focus-within:bg-indigo-500/[0.02]")
      }>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-relaxed text-gray-200 placeholder-gray-700 outline-none"
            style={{ minHeight: "88px", maxHeight: "140px" }}
          />
        ) : (
          <div className="flex items-center gap-2 px-4">
            {type === "username" && (
              <span className="shrink-0 text-sm text-gray-700">@</span>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="w-full bg-transparent py-3.5 text-sm text-gray-200 placeholder-gray-700 outline-none"
            />
          </div>
        )}
      </div>

      {(error || hint) && (
        <p className={"px-1 text-[10px] leading-relaxed " + (error ? "text-red-400" : "text-gray-700")}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ status, error, successMsg }) {
  return (
    <AnimatePresence>
      {status === "error" && error && (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2 rounded-xl bg-red-500/[0.07] px-3.5 py-2.5 text-[11px] text-red-400 ring-1 ring-red-500/15"
        >
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </motion.div>
      )}
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/[0.07] px-3.5 py-2.5 text-[11px] text-emerald-400 ring-1 ring-emerald-500/15"
        >
          <CheckCircle2 size={12} className="shrink-0" />
          {successMsg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveButton({ canSave, saving, status, label, onClick }) {
  return (
    <motion.button
      whileTap={canSave ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={!canSave}
      className={
        "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none " +
        (status === "success"
          ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
          : canSave
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
            : "cursor-not-allowed bg-white/[0.03] text-gray-700 ring-1 ring-white/[0.05]")
      }
    >
      {saving ? (
        <><Loader2 size={12} className="animate-spin" />Saving…</>
      ) : status === "success" ? (
        <><CheckCircle2 size={12} />Saved</>
      ) : (
        label
      )}
    </motion.button>
  );
}

// ─── Panel Shell ──────────────────────────────────────────────────────────────
function PanelShell({ title, subtitle, children, onBack }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ type: "spring", stiffness: 460, damping: 38 }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-gray-500 transition-all hover:bg-white/[0.07] hover:text-gray-300 focus-visible:outline-none"
        >
          <ArrowLeft size={13} />
        </motion.button>
        <div>
          <h3 className="text-sm font-semibold leading-tight text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[10px] text-gray-600">{subtitle}</p>}
        </div>
      </div>
      <div className="h-px bg-white/[0.04]" />
      {children}
    </motion.div>
  );
}

// ─── Edit Bio Panel ───────────────────────────────────────────────────────────
function EditBioPanel({ user, onSuccess, onBack }) {
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const MAX = 160;
  const canSave = bio.trim().length > 0 && bio.length <= MAX && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await axiosInstance.post("/users/addbio", { bio: bio.trim() });
      setStatus("success");
      setTimeout(() => onSuccess?.("bio", bio.trim()), 700);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save bio.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelShell title="Bio" subtitle="Shown on your public profile" onBack={onBack}>
      <Field
        label="Write something about yourself"
        value={bio}
        onChange={(v) => { setBio(v); setStatus(null); setError(""); }}
        placeholder="Software developer, coffee lover, open source enthusiast…"
        maxLength={MAX}
        error={bio.length > MAX ? `${bio.length - MAX} characters over the limit` : ""}
        type="textarea"
      />
      <StatusBanner status={status} error={error} successMsg="Your bio has been updated" />
      <SaveButton canSave={canSave} saving={saving} status={status} label="Save bio" onClick={handleSave} />
    </PanelShell>
  );
}

// ─── Edit Username Panel ──────────────────────────────────────────────────────
function EditUsernamePanel({ user, onSuccess, onBack }) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const isInvalid = username.trim().length < 3;
  const hasSpecial = /[^a-zA-Z0-9_.]/.test(username);
  const canSave = !isInvalid && !hasSpecial && !saving && username !== user?.username;

  const fieldError = hasSpecial
    ? "Only letters, numbers, underscores and dots"
    : isInvalid && username.length > 0 ? "Minimum 3 characters" : "";

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await axiosInstance.post("/users/changeusername", { username: username.trim() });
      setStatus("success");
      setTimeout(() => onSuccess?.("username", username.trim()), 700);
    } catch (err) {
      setError(err.response?.data?.message);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelShell title="Username" subtitle="Your unique handle across Linkora" onBack={onBack}>
      <Field
        label="Choose a new username"
        value={username}
        onChange={(v) => { setUsername(v.toLowerCase()); setStatus(null); setError(""); }}
        placeholder={user?.username}
        maxLength={30}
        error={fieldError}
        hint={!fieldError ? `Current username is @${user?.username}` : ""}
        type="username"
      />
      <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
        <div className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
        <p className="text-[11px] leading-relaxed text-gray-600">
          Changing your username will break any existing links or mentions pointing to{" "}
          <span className="font-medium text-gray-500">@{user?.username}</span>.
        </p>
      </div>
      <StatusBanner status={status} error={error} successMsg="Username updated successfully" />
      <SaveButton canSave={canSave} saving={saving} status={status} label="Update username" onClick={handleSave} />
    </PanelShell>
  );
}

// ─── Disable Account Panel ────────────────────────────────────────────────────
function DisableAccountPanel({ onBack, onClose }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const WORD = "disable";
  const canDisable = confirm === WORD && !disabling && !loggingOut;

  const handleDisable = async () => {
    if (!canDisable) return;
    setDisabling(true);
    try {
      await axiosInstance.post("/disable/disableuser");
      setDisabling(false);
      setLoggingOut(true);
      await axiosInstance.post("/auth/logout");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong. Try again.");
      setDisabling(false);
      setLoggingOut(false);
    }
  };

  const items = [
    { ok: true,  text: "Your posts, followers and data are fully preserved" },
    { ok: true,  text: "Re-enable instantly by logging back in at any time" },
    { ok: false, text: "Your profile becomes invisible to other users" },
    { ok: false, text: "You won't appear in search or recommendations" },
    { ok: false, text: "Followers will stop seeing your content in their feed" },
  ];

  return (
    <PanelShell title="Pause your account" subtitle="Temporarily hide your presence on Linkora" onBack={onBack}>

      {/* ── Full-screen loading overlay ── */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#070c18]/95 backdrop-blur-xl"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
              <span className="absolute inset-2 animate-pulse rounded-full bg-amber-500/10" />
              <Loader2 size={24} className="animate-spin text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Signing you out…</p>
              <p className="mt-1 text-xs text-gray-500">Your account has been paused</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-4 py-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          What changes
        </p>
        {items.map(({ ok, text }, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={
              "mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full " +
              (ok ? "bg-emerald-500/15" : "bg-white/[0.05]")
            }>
              <span className={"text-[8px] font-bold " + (ok ? "text-emerald-400" : "text-gray-600")}>
                {ok ? "✓" : "–"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium tracking-wide text-gray-500">
          Type <span className="font-semibold text-gray-400">"{WORD}"</span> to continue
        </label>
        <div className={
          "rounded-2xl border transition-all duration-200 " +
          (confirm && confirm !== WORD
            ? "border-red-500/25 bg-red-500/[0.03]"
            : confirm === WORD
              ? "border-emerald-500/25 bg-emerald-500/[0.03]"
              : "border-white/[0.07] bg-white/[0.025] focus-within:border-white/[0.12]")
        }>
          <input
            type="text"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            placeholder={WORD}
            autoComplete="off"
            className="w-full bg-transparent px-4 py-3.5 text-sm tracking-wide text-gray-200 placeholder-gray-700 outline-none"
          />
        </div>
        {confirm && confirm !== WORD && (
          <p className="px-1 text-[10px] text-red-400">That doesn't match</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/[0.07] px-3.5 py-2.5 text-[11px] text-red-400 ring-1 ring-red-500/15">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </div>
      )}

      <motion.button
        whileTap={canDisable ? { scale: 0.97 } : {}}
        onClick={handleDisable}
        disabled={!canDisable}
        className={
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none " +
          (canDisable
            ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25 hover:bg-amber-500/20"
            : "cursor-not-allowed bg-white/[0.03] text-gray-700 ring-1 ring-white/[0.05]")
        }
      >
        {disabling
          ? <><Loader2 size={12} className="animate-spin" />Pausing account…</>
          : loggingOut
            ? <><Loader2 size={12} className="animate-spin" />Signing out…</>
            : <><EyeOff size={12} />Pause my account</>
        }
      </motion.button>

      <p className="text-center text-[10px] leading-relaxed text-gray-700">
        You can restore full access anytime — just log back in.
      </p>
    </PanelShell>
  );
}

// ─── Menu config ──────────────────────────────────────────────────────────────
const MENU = [
  {
    id: "bio",
    icon: PenLine,
    label: "Bio",
    desc: "How you appear to others",
    iconColor: "text-indigo-400",
    hoverGlow: "group-hover:bg-indigo-500/[0.07]",
    hoverBorder: "hover:border-indigo-500/20",
  },
  {
    id: "username",
    icon: AtSign,
    label: "Username",
    desc: "Your unique @handle",
    iconColor: "text-violet-400",
    hoverGlow: "group-hover:bg-violet-500/[0.07]",
    hoverBorder: "hover:border-violet-500/20",
  },
  {
    id: "disable",
    icon: EyeOff,
    label: "Pause account",
    desc: "Temporarily hide your profile",
    iconColor: "text-amber-400/80",
    hoverGlow: "group-hover:bg-amber-500/[0.06]",
    hoverBorder: "hover:border-amber-500/20",
    muted: true,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditProfile({ isOpen, onClose, user, onSaved }) {
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => { if (isOpen) setActivePanel(null); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => {
      if (e.key === "Escape") activePanel ? setActivePanel(null) : onClose?.();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, activePanel]);

  const handleSuccess = (field, value) => {
    onSaved?.(field, value);
    setTimeout(() => setActivePanel(null), 400);
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="ep-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => activePanel ? setActivePanel(null) : onClose?.()}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            key="ep-sheet"
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-[64px] left-0 right-0 z-50 mx-auto w-full max-w-lg sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:px-4"
          >
            <div
              className="relative overflow-hidden rounded-t-[28px] bg-[#0c1322] shadow-2xl shadow-black sm:rounded-[24px]"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

              <div className="flex justify-center pt-3.5 sm:hidden">
                <div className="h-[3px] w-9 rounded-full bg-white/[0.10]" />
              </div>

              <div className="flex items-center justify-between px-5 pb-4 pt-4 sm:pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md" />
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="relative h-10 w-10 rounded-full object-cover ring-[1.5px] ring-white/[0.10]"
                      />
                    ) : (
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-violet-600/80 text-sm font-bold text-white ring-[1.5px] ring-white/[0.10]">
                        {initial}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c1322] bg-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-white">{user?.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-600">@{user?.username}</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-gray-600 transition-all hover:bg-white/[0.07] hover:text-gray-300 focus-visible:outline-none"
                >
                  <X size={14} />
                </motion.button>
              </div>

              <div className="mx-5 h-px bg-white/[0.04]" />

              <div className="overflow-y-auto px-5 pb-7 pt-5" style={{ maxHeight: "58vh" }}>
                <AnimatePresence mode="wait">
                  {!activePanel && (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      className="flex flex-col gap-2"
                    >
                      <p className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-700">
                        Profile settings
                      </p>

                      {MENU.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 7 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.055, duration: 0.18 }}
                            whileTap={{ scale: 0.984 }}
                            onClick={() => setActivePanel(item.id)}
                            className={
                              "group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none " +
                              "border-white/[0.06] bg-white/[0.02] " +
                              item.hoverBorder + " hover:bg-white/[0.035]"
                            }
                          >
                            <div className={
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-200 group-hover:scale-[1.07] " +
                              item.hoverGlow
                            }>
                              <Icon size={15} className={item.iconColor} strokeWidth={1.8} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={
                                "text-[13px] font-medium leading-tight transition-colors duration-150 " +
                                (item.muted ? "text-gray-400 group-hover:text-gray-300" : "text-gray-200 group-hover:text-white")
                              }>
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-[10px] text-gray-700 transition-colors duration-150 group-hover:text-gray-600">
                                {item.desc}
                              </p>
                            </div>

                            <ChevronRight
                              size={14}
                              className="shrink-0 text-gray-800 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500"
                            />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {activePanel === "bio" && (
                    <EditBioPanel key="bio" user={user} onSuccess={handleSuccess} onBack={() => setActivePanel(null)} />
                  )}
                  {activePanel === "username" && (
                    <EditUsernamePanel key="username" user={user} onSuccess={handleSuccess} onBack={() => setActivePanel(null)} />
                  )}
                  {activePanel === "disable" && (
                    <DisableAccountPanel key="disable" onBack={() => setActivePanel(null)} onClose={onClose} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}