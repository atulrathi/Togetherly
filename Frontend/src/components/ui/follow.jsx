import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, AlertCircle, Users } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

// ─── Single user row ───────────────────────────────────────────────────────────
function UserRow({ person, index }) {
  const initial = person.name?.charAt(0).toUpperCase() ?? "U";

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors duration-150 hover:bg-white/[0.03]"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {person.profilePic ? (
          <img
            src={person.profilePic}
            alt={person.name}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/[0.07]"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/60 to-violet-600/60 text-sm font-bold text-white ring-2 ring-white/[0.07]">
            {initial}
          </div>
        )}
      </div>

      {/* Name, username, bio */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white leading-tight">{person.name}</p>
        <p className="truncate text-xs text-gray-500 mt-0.5">{"@" + person.username}</p>
        {person.bio ? (
          <p className="truncate text-xs text-gray-600 mt-1 leading-relaxed">{person.bio}</p>
        ) : null}
      </div>

      {/* Joined date */}
      {person.createdAt && (
        <p className="shrink-0 text-[10px] text-gray-700 tabular-nums">
          {fmtDate(person.createdAt)}
        </p>
      )}
    </motion.div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Users size={20} className="text-gray-700" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-300">
          {type === "followers" ? "No followers yet" : "Not following anyone yet"}
        </p>
        <p className="mt-0.5 text-xs text-gray-600">
          {type === "followers"
            ? "When people follow you, they'll appear here."
            : "Find people to follow and they'll show up here."}
        </p>
      </div>
    </div>
  );
}

// ─── Main FollowModal ─────────────────────────────────────────────────────────
export default function FollowModal({ isOpen, onClose, defaultTab = "followers" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [query,     setQuery]     = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState("");

  const searchRef = useRef(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFollowers([]);
      setFollowing([]);
      setError("");
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  // Focus search on open
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 140);
  }, [isOpen]);

  // Fetch both lists from single endpoint on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const fetchAll = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await axiosInstance.get("/follow/followers");
        if (!cancelled) {
          setFollowers(Array.isArray(data?.followers) ? data.followers : []);
          setFollowing(Array.isArray(data?.following) ? data.following : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? "Failed to load connections.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const rawList = activeTab === "followers" ? followers : following;

  const filtered = query.trim()
    ? rawList.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.username?.toLowerCase().includes(query.toLowerCase())
      )
    : rawList;

  const TABS = ["followers", "following"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.97, y: 14 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed inset-x-4 bottom-0 top-[8%] z-50 mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/80 sm:bottom-auto sm:top-[10%] sm:max-h-[78vh]"
          >
            {/* Top accent line */}
            <div className="h-[1.5px] w-full shrink-0 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-white">Connections</h2>
                <p className="mt-0.5 text-[11px] text-gray-600">
                  {followers.length} follower{followers.length !== 1 ? "s" : ""} · {following.length} following
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-500 transition-all hover:bg-white/[0.07] hover:text-white focus-visible:outline-none"
              >
                <X size={13} />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-white/[0.05]">
              {TABS.map((tab) => {
                const active = activeTab === tab;
                const count  = tab === "followers" ? followers.length : following.length;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setQuery(""); }}
                    className={
                      "relative flex-1 py-3 text-xs font-semibold capitalize transition-colors duration-150 focus-visible:outline-none " +
                      (active ? "text-white" : "text-gray-600 hover:text-gray-400")
                    }
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {tab}
                      {count > 0 && (
                        <span className={
                          "rounded-full px-1.5 py-px text-[9px] font-bold tabular-nums " +
                          (active
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-white/[0.04] text-gray-600")
                        }>
                          {count}
                        </span>
                      )}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="follow-tab-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-indigo-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="shrink-0 px-4 py-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 transition-colors focus-within:border-indigo-500/25 focus-within:bg-indigo-500/[0.03]">
                <Search size={12} className="shrink-0 text-gray-600" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={"Search " + activeTab + "…"}
                  className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-700 outline-none"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => setQuery("")}
                      className="shrink-0 text-gray-600 transition-colors hover:text-gray-400 focus-visible:outline-none"
                    >
                      <X size={11} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">

              {/* Loading skeleton */}
              {isLoading && (
                <div className="flex flex-col gap-0.5 px-1 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl px-3 py-3">
                      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
                        <div className="h-2 w-20 animate-pulse rounded-full bg-white/[0.04]" />
                      </div>
                      <div className="h-2 w-12 animate-pulse rounded-full bg-white/[0.03]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle size={16} className="text-red-400" />
                  </div>
                  <p className="text-xs text-gray-500">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="rounded-xl border border-white/[0.07] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty list */}
              {!isLoading && !error && rawList.length === 0 && (
                <EmptyState type={activeTab} />
              )}

              {/* No search results */}
              {!isLoading && !error && filtered.length === 0 && rawList.length > 0 && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Search size={16} className="text-gray-700" />
                  <p className="text-xs text-gray-600">No results for "{query}"</p>
                </div>
              )}

              {/* User list */}
              {!isLoading && !error && filtered.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + query}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex flex-col"
                  >
                    {filtered.map((person, i) => (
                      <UserRow key={person._id} person={person} index={i} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}