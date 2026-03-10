import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2, AlertCircle, RefreshCcw } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";
import PostCard from "../components/PostCard";
import UserSearchBar from "../components/ui/Search"; 
import axiosInstance from "../services/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const loaderRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;
    const fetchCurrentUser = async () => {
      try {
        const { data } = await axiosInstance.get(`/users/${username}`);
        if (data.success) setCurrentUser(data.user);
        else navigate("/");
      } catch (err) {
        console.error("[fetchCurrentUser]", err);
        navigate("/");
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, [username, navigate]);

  const fetchPosts = useCallback(async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/post/feed", { params: { page: pageNum } });
      setPosts((prev) => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setTotalPages(data.totalPages);
    } catch (err) {
      const msg = err.response?.data?.message ?? "";
      setError(msg || "Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loading, page, totalPages, fetchPosts]);

  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    setPostError("");
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePost = async () => {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    setPostError("");
    try {
      const { data } = await axiosInstance.post("/post/create", { content, image: null });
      setPosts((prev) => [data.post, ...prev]);
      setDraft("");
      setImagePreview(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      const msg = err.response?.data?.message ?? "";
      setPostError(msg || "Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handlePost();
  };

  const handleRefresh = () => { setPage(1); fetchPosts(1); };

  const charLimit = 280;
  const charCount = draft.length;
  const nearLimit = charCount >= charLimit * 0.8;
  const overLimit = charCount > charLimit;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(charCount / charLimit, 1));
  const avatarInitial = currentUser?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex h-screen overflow-hidden bg-[#090e1a]">
      <Sidebar />

      <main
        className="flex flex-1 flex-col border-r border-white/[0.05] overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.15) transparent" }}
      >
        <style>{`
          main::-webkit-scrollbar { width: 4px; }
          main::-webkit-scrollbar-track { background: transparent; }
          main::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.18); border-radius: 99px; }
          main::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }
        `}</style>

        {/* ── Sticky header — single row ── */}
        <div className="sticky top-0 z-10 border-b  border-white/[0.05] bg-[#090e1a]/85 backdrop-blur-xl">
          <div className="flex justify-between gap-3 px-5 py-3">
            <h1 className="text-[15px] font-bold tracking-tight text-white shrink-0">Home</h1>
            <div className="w-50">
              <UserSearchBar compact />
            </div>
            <button
              onClick={handleRefresh}
              aria-label="Refresh feed"
              className="shrink-0 rounded-full p-1.5 text-gray-500 transition-all hover:bg-white/[0.06] hover:text-gray-300 active:scale-95 focus-visible:outline-none"
            >
              <RefreshCcw size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Compose box ── */}
        <div className="border-b border-white/[0.05] px-5 py-5">
          <div className="flex gap-3.5">
            {userLoading ? (
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
            ) : currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt={currentUser.name}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10 shadow-lg shadow-indigo-900/20" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-600/40 text-[13px] font-bold text-indigo-200 ring-1 ring-white/10 shadow-lg shadow-indigo-900/20">
                {avatarInitial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {currentUser && (
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white leading-none">{currentUser.name}</span>
                  {currentUser.isVerified && (
                    <svg className="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-[12px] text-gray-600">@{currentUser.username}</span>
                </div>
              )}

              <textarea
                ref={textareaRef} rows={2} value={draft}
                onChange={handleDraftChange} onKeyDown={handleKeyDown}
                placeholder="What's happening?" maxLength={charLimit + 20}
                className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder-gray-600 focus:outline-none"
              />

              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 4 }} transition={{ duration: 0.2 }}
                    className="relative mt-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
                  >
                    <img src={imagePreview} alt="Preview" className="max-h-72 w-full object-cover" />
                    <button onClick={() => setImagePreview(null)} aria-label="Remove image"
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 focus-visible:outline-none">
                      <X size={13} aria-hidden="true" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3.5 border-t border-white/[0.05]" />

              <AnimatePresence>
                {postError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={12} aria-hidden="true" />{postError}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mt-3 flex items-center justify-between">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button onClick={() => fileInputRef.current?.click()} aria-label="Attach image"
                  className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/[0.08] hover:text-indigo-300 focus-visible:outline-none active:scale-95">
                  <ImagePlus size={14} className="transition-transform group-hover:scale-110" aria-hidden="true" />
                  <span>Add image</span>
                </button>

                <div className="flex items-center gap-3">
                  {draft.length > 0 && (
                    <div className="relative flex h-7 w-7 items-center justify-center">
                      <svg className="absolute inset-0 -rotate-90" width="28" height="28" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r={radius} fill="none" strokeWidth="2" stroke="rgba(255,255,255,0.06)" />
                        <circle cx="14" cy="14" r={radius} fill="none" strokeWidth="2"
                          stroke={overLimit ? "#f87171" : nearLimit ? "#fbbf24" : "#6366f1"}
                          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                          style={{ transition: "stroke-dashoffset 0.15s ease, stroke 0.15s ease" }} />
                      </svg>
                      {(nearLimit || overLimit) && (
                        <span className={`text-[9px] font-bold tabular-nums leading-none ${overLimit ? "text-red-400" : "text-amber-400"}`}>
                          {charLimit - charCount}
                        </span>
                      )}
                    </div>
                  )}
                  <button onClick={handlePost} disabled={!draft.trim() || overLimit || posting}
                    className="relative flex items-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-5 py-1.5 text-[13px] font-semibold text-white shadow-md shadow-indigo-900/40 transition-all duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60">
                    {posting && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                    {posting ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {draft.length > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-2 text-[11px] text-gray-700">
                    <kbd className="rounded bg-white/[0.05] px-1 py-0.5 font-mono text-[10px] text-gray-600">⌘ Enter</kbd> to post
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Skeleton */}
        {initialLoad && (
          <div className="divide-y divide-white/[0.04]">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex gap-3 px-5 py-4">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && !initialLoad && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-5 mt-4 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
              <AlertCircle size={15} aria-hidden="true" className="shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={handleRefresh} className="shrink-0 text-xs underline underline-offset-2 hover:text-red-300 focus-visible:outline-none">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed */}
        {!initialLoad && (
          <div>
            {posts.length === 0 && !loading ? (
              <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
                <p className="text-sm font-medium text-gray-400">No posts yet</p>
                <p className="text-xs text-gray-600">Be the first to post something.</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div key={post._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index, 5) * 0.055 }}
                  className="border-b border-white/[0.04]">
                  <PostCard post={post} />
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-8">
          {loading && !initialLoad && (
            <Loader2 size={18} className="animate-spin text-indigo-400/60" aria-label="Loading more posts…" />
          )}
          {!loading && page >= totalPages && posts.length > 0 && (
            <p className="text-[11px] text-gray-700">You're all caught up ✦</p>
          )}
        </div>
      </main>

      <RightPanel />
    </div>
  );
}