import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  AlertCircle,
  Loader2,
  LogOut,
  UserCircle2,
  Camera,
  MoreHorizontal,
  ArrowLeft,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ImageIcon,
  Github,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  PenLine,
  X,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import FollowModel from "../components/ui/follow";
import AddBio from "../components/ui/Addbio";
import EditProfile from "../components/ui/EditProfile";

// ─── Post Card ───────────────────────────────────────────────────────────────
function PostCard({ post, initial, index, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";

  const fmt = (n) => {
    if (!n && n !== 0) return "0";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleDeleteClick = () => setConfirmDelete(true);
  const handleCancelDelete = () => setConfirmDelete(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/post/${post._id}`);
      setMenuOpen(false);
      onDelete?.(post._id);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.22 } }}
      transition={{ delay: index * 0.06, duration: 0.22 }}
      layout
      className="group relative border-b border-white/[0.05] px-4 py-4 transition-colors hover:bg-white/[0.015]"
    >
      <div className="flex gap-3">
        <div className="shrink-0">
          {post.author?.profilePic ? (
            <img
              src={post.author.profilePic}
              alt={post.author.name}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/70 to-violet-600/70 text-sm font-bold text-white ring-1 ring-white/10">
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-semibold text-white">
                {post.author?.name ?? "You"}
              </span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-600">
                {fmtDate(post.createdAt)}
              </span>
            </div>

            {/* ── Three-dot Menu ── */}
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  if (menuOpen) setConfirmDelete(false);
                }}
                aria-label="Post options"
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full transition-all focus-visible:outline-none " +
                  (menuOpen
                    ? "bg-white/[0.10] text-white"
                    : "text-gray-500 hover:bg-white/[0.07] hover:text-gray-300 sm:text-gray-600 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:text-gray-400")
                }
              >
                <MoreHorizontal size={15} />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    key="post-menu"
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    className="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1525] shadow-2xl shadow-black/80"
                    style={{ transformOrigin: "top right" }}
                  >
                    <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

                    <AnimatePresence mode="wait">
                      {!confirmDelete ? (
                        <motion.div
                          key="default-menu"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="p-1.5"
                        >
                          <button
                            onClick={handleDeleteClick}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10 focus-visible:outline-none"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10">
                              <Trash2 size={12} />
                            </div>
                            Delete post
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="confirm-menu"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="p-3"
                        >
                          <div className="mb-3 flex flex-col items-center gap-2 pt-1 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                              <TriangleAlert size={16} className="text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                Delete this post?
                              </p>
                              <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">
                                This action is permanent and cannot be undone.
                              </p>
                            </div>
                          </div>

                          <div className="mb-2.5 h-px bg-white/[0.05]" />

                          <div className="flex flex-col gap-1.5">
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={handleConfirmDelete}
                              disabled={deleting}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/90 py-2 text-xs font-semibold text-white shadow-md shadow-red-900/30 transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deleting ? (
                                <>
                                  <Loader2 size={11} className="animate-spin" />
                                  Deleting…
                                </>
                              ) : (
                                <>
                                  <Trash2 size={11} strokeWidth={2.5} />
                                  Yes, delete it
                                </>
                              )}
                            </motion.button>

                            <button
                              onClick={handleCancelDelete}
                              disabled={deleting}
                              className="w-full rounded-xl border border-white/[0.07] py-2 text-xs font-medium text-gray-400 transition-all hover:bg-white/[0.05] hover:text-white disabled:opacity-50 focus-visible:outline-none"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {post.title && (
            <p className="mt-0.5 text-sm font-semibold text-gray-200">
              {post.title}
            </p>
          )}
          {post.content && (
            <p className="mt-1 text-sm leading-relaxed text-gray-400 line-clamp-4">
              {post.content}
            </p>
          )}
          {post.image && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06]">
              <img
                src={post.image}
                alt="Post media"
                className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                onError={(e) => e.currentTarget.closest("div").remove()}
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={handleLike}
              className={
                "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-red-500/10 " +
                (liked ? "text-red-400" : "text-gray-600 hover:text-red-400")
              }
            >
              <Heart size={13} fill={liked ? "currentColor" : "none"} />
              <span>{fmt(likeCount)}</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-indigo-500/10 hover:text-indigo-400">
              <MessageCircle size={13} />
              <span>{post.commentCount ?? 0}</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-400">
              <Repeat2 size={13} />
              <span>{post.repostCount ?? 0}</span>
            </button>
            <button
              onClick={() => setBookmarked((v) => !v)}
              className={
                "ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-indigo-500/10 " +
                (bookmarked
                  ? "text-indigo-400"
                  : "text-gray-600 hover:text-indigo-400")
              }
            >
              <Bookmark size={13} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── GitHub Repo Card ─────────────────────────────────────────────────────────
function GitHubRepoCard({ repo, index }) {
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "from-yellow-500/20 to-yellow-600/20",
      TypeScript: "from-blue-500/20 to-blue-600/20",
      Python: "from-blue-400/20 to-blue-500/20",
      React: "from-cyan-500/20 to-cyan-600/20",
      "C++": "from-pink-500/20 to-pink-600/20",
      Java: "from-red-500/20 to-red-600/20",
      Go: "from-cyan-400/20 to-cyan-500/20",
      Rust: "from-orange-500/20 to-orange-600/20",
    };
    return colors[language] || "from-gray-500/20 to-gray-600/20";
  };

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-white/[0.02] p-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/[0.05]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Github
              size={14}
              className="shrink-0 text-gray-500 transition-colors group-hover:text-indigo-400"
            />
            <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-indigo-300">
              {repo.name}
            </h3>
          </div>
        </div>
        <ExternalLink
          size={13}
          className="shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      {repo.description && (
        <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {repo.language && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${getLanguageColor(repo.language)} px-2 py-1 text-[10px] font-medium text-gray-300`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {repo.language}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        {repo.stargazers_count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={11} className="text-yellow-500/70" />
            <span className="text-[10px] text-gray-500">
              {repo.stargazers_count}
            </span>
          </div>
        )}
        {repo.forks_count > 0 && (
          <div className="flex items-center gap-1">
            <GitFork size={11} className="text-emerald-500/70" />
            <span className="text-[10px] text-gray-500">{repo.forks_count}</span>
          </div>
        )}
        {repo.watchers_count > 0 && (
          <div className="flex items-center gap-1">
            <Eye size={11} className="text-blue-500/70" />
            <span className="text-[10px] text-gray-500">
              {repo.watchers_count}
            </span>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
    </motion.a>
  );
}

// ─── Connect GitHub Button ────────────────────────────────────────────────────
function ConnectGitHub({ onConnect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.08] bg-gradient-to-br from-white/[0.01] via-white/[0.005] to-white/[0.01] p-8"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <Github size={28} className="text-gray-600" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-white">
          Connect Your GitHub
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Showcase your best projects and repositories
        </p>
      </div>
      <button
        onClick={onConnect}
        className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none"
      >
        <Github size={13} />
        Connect GitHub Account
      </button>
    </motion.div>
  );
}

// ─── Empty Posts State ────────────────────────────────────────────────────────
function EmptyPosts() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <ImageIcon size={20} className="text-gray-700" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-300">
          Share something with the world
        </p>
        <p className="mt-0.5 text-xs text-gray-600">
          Your posts will show up here.
        </p>
      </div>
    </div>
  );
}

// ─── Compose Box ─────────────────────────────────────────────────────────────
function ComposeBox({ user, initial, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const imageRef = useRef(null);
  const textareaRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Write something before posting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axiosInstance.post("/post/create", {
        content: trimmed,
      });
      setContent("");
      removeImage();
      setFocused(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onPostCreated?.(data);
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Failed to create post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const charLimit = 500;
  const charLeft = charLimit - content.length;
  const isOverLimit = charLeft < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !submitting;
  const isExpanded = focused || content.length > 0 || !!imagePreview;

  const handleChange = (e) => {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(content.length / charLimit, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.18 }}
      className={
        "mx-4 overflow-hidden rounded-2xl border transition-all duration-200 " +
        (isExpanded
          ? "border-indigo-500/20 bg-gradient-to-b from-white/[0.03] to-white/[0.015] shadow-xl shadow-indigo-950/30"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.09] hover:bg-white/[0.025]")
      }
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.25 }}
            className="h-[1.5px] w-full origin-left bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
          />
        )}
      </AnimatePresence>

      <div className="flex gap-3 px-4 pb-2 pt-3.5">
        <div className="shrink-0 pt-0.5">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/[0.12]"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/60 to-violet-600/60 text-xs font-bold text-white ring-1 ring-white/10">
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!content.trim() && !imagePreview) setFocused(false);
            }}
            placeholder="What's on your mind?"
            maxLength={520}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-200 placeholder-gray-600/80 outline-none"
            style={{ minHeight: "28px", overflow: "hidden" }}
          />
        </div>
      </div>

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 mb-2 overflow-hidden rounded-xl border border-white/[0.07]"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-56 w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent" />
            <button
              onClick={removeImage}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-all hover:bg-black/85 hover:text-white focus-visible:outline-none"
            >
              <X size={11} />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
              <span className="text-[9px] font-medium text-white/50">
                preview only
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mx-4 mb-2 flex items-center gap-1.5 rounded-xl bg-red-500/[0.08] px-3 py-2 text-[11px] text-red-400"
          >
            <AlertCircle size={11} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mx-4 h-px bg-white/[0.05]" />

            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-0.5">
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  onClick={() => imageRef.current?.click()}
                  title="Add photo (preview only)"
                  className={
                    "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none " +
                    (imagePreview
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-gray-600 hover:bg-white/[0.05] hover:text-gray-400")
                  }
                >
                  <ImageIcon size={13} />
                  <span className="hidden sm:inline">Photo</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <AnimatePresence>
                  {content.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="relative flex h-6 w-6 items-center justify-center"
                      title={`${charLeft} characters remaining`}
                    >
                      <svg
                        className="absolute inset-0 -rotate-90"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          fill="none"
                          stroke="rgba(255,255,255,0.07)"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          fill="none"
                          stroke={
                            isOverLimit
                              ? "#f87171"
                              : charLeft <= 50
                                ? "#eab308"
                                : "#6366f1"
                          }
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-100"
                        />
                      </svg>
                      {charLeft <= 50 && (
                        <span
                          className={
                            "text-[9px] font-bold tabular-nums " +
                            (isOverLimit ? "text-red-400" : "text-yellow-500")
                          }
                        >
                          {charLeft}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleSubmit}
                  disabled={!canPost}
                  whileTap={canPost ? { scale: 0.93 } : {}}
                  className={
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none " +
                    (canPost
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30"
                      : "cursor-not-allowed bg-white/[0.04] text-gray-600")
                  }
                >
                  {submitting ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <PenLine size={11} strokeWidth={2.3} />
                  )}
                  <span>{submitting ? "Posting…" : "Post"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const moreRef = useRef(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [loggingOut, setLoggingOut] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [gitHubRepos, setGitHubRepos] = useState([]);
  const [gitHubLoading, setGitHubLoading] = useState(false);
  const [gitHubError, setGitHubError] = useState("");
  const [gitHubConnected, setGitHubConnected] = useState(false);
  const [followModal, setFollowModal] = useState({ open: false, tab: "followers" });
  const [bioModal, setBioModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);

  const TABS = ["Posts", "GitHub"];

  // ── Avatar upload ────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setAvatarUploading(true);
    try {
      const { data } = await axiosInstance.post(
        "users/upload/profilepic",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // ✅ Fixed: was setting "avatar" — API returns "profilePic"
      if (data.imageUrl)
        setUser((prev) => ({ ...prev, profilePic: data.imageUrl }));
    } catch (err) {
      alert(err.response?.data?.message ?? "Upload failed. Please try again.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Cover upload ─────────────────────────────────────────────────
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setCoverUploading(true);
    try {
      const { data } = await axiosInstance.post(
        "users/upload/coverphoto",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const newCover =
        data?.user?.coverPhoto ??
        data?.user?.coverImage ??
        data?.coverPhoto ??
        data?.coverImage ??
        data?.url;
      if (newCover) setUser((prev) => ({ ...prev, coverPhoto: newCover }));
    } catch (err) {
      alert(
        err.response?.data?.message ?? "Cover upload failed. Please try again.",
      );
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  // ── Fetch profile ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ Fixed: was "/users" — now correctly calls /users/:username
        const { data } = await axiosInstance.get(`/users/${username}`);
        if (!cancelled) setUser(data.user);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        const msg = err.response?.data?.message ?? "";
        if (status === 404) setError("Profile not found.");
        else setError(msg || "Failed to load profile. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, [username]);

  // ── Fetch posts ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "posts") return;
    let cancelled = false;
    const fetchPosts = async () => {
      setPostsLoading(true);
      setPostsError("");
      try {
        const { data } = await axiosInstance.get("/post/userpost", {
          params: { page, limit: 10 },
        });
        if (!cancelled) {
          const fetchedPosts = data?.data?.posts ?? data?.posts ?? [];
          const fetchedPagination =
            data?.data?.pagination ?? data?.pagination ?? null;
          setPosts((prev) =>
            page === 1 ? fetchedPosts : [...prev, ...fetchedPosts],
          );
          setPagination(fetchedPagination);
        }
      } catch (err) {
        if (!cancelled)
          setPostsError(err.response?.data?.message ?? "Failed to load posts.");
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    };
    fetchPosts();
    return () => { cancelled = true; };
  }, [activeTab, page]);

  // ── Fetch GitHub repos ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "github") return;
    let cancelled = false;
    const fetchGitHubRepos = async () => {
      setGitHubLoading(true);
      setGitHubError("");
      setGitHubConnected(false);
      setGitHubRepos([]);
      try {
        const { data } = await axiosInstance.get("/github/repos");
        if (!cancelled) {
          setGitHubRepos(Array.isArray(data) ? data : []);
          setGitHubConnected(true);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setGitHubConnected(false);
          setGitHubRepos([]);
          setGitHubError("");
        } else {
          setGitHubError(
            err.response?.data?.message ||
              "Failed to load GitHub repositories. Please try again.",
          );
          setGitHubConnected(false);
        }
      } finally {
        if (!cancelled) setGitHubLoading(false);
      }
    };
    fetchGitHubRepos();
    return () => { cancelled = true; };
  }, [activeTab]);

  // Reset posts on tab switch
  useEffect(() => {
    if (activeTab === "posts") {
      setPosts([]);
      setPage(1);
    }
  }, [activeTab]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMore) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target))
        setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMore]);

  // ── Logout ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    setShowMore(false);
    try {
      await axiosInstance.post("/auth/logout");
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  };

  // ── GitHub connect ────────────────────────────────────────────────
  const handleConnectGitHub = () => {
    window.location.href = "https://togetherly-z8yh.onrender.com/github/Oauth";
  };

  // ── New post prepended to feed ────────────────────────────────────
  const handlePostCreated = (newPost) => {
    const raw = newPost?.post ?? newPost?.data ?? newPost;
    if (raw?._id) {
      const enriched = {
        ...raw,
        author: {
          _id: user?._id,
          name: user?.name,
          username: user?.username,
          profilePic: user?.profilePic ?? null,
        },
      };
      setPosts((prev) => [enriched, ...prev]);
      setUser((prev) =>
        prev ? { ...prev, postCount: (prev.postCount ?? 0) + 1 } : prev,
      );
    } else {
      setPage(1);
    }
  };

  // ── Post deleted ─────────────────────────────────────────────────
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setUser((prev) =>
      prev
        ? { ...prev, postCount: Math.max((prev.postCount ?? 1) - 1, 0) }
        : prev,
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const fmt = (n) => {
    if (!n && n !== 0) return "0";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })
      : "";

  const initial =
    user?.name?.charAt(0).toUpperCase() ??
    username?.charAt(0).toUpperCase() ??
    "U";

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070c18]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
            <Loader2 size={22} className="animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-gray-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col">
        <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-medium text-white">Something went wrong</p>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Logout overlay */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#070c18]/95 backdrop-blur-xl"
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
              <span className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/10" />
              <Loader2 size={26} className="animate-spin text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Signing you out…</p>
              <p className="mt-1 text-xs text-gray-500">
                {"See you soon, " + (user?.name?.split(" ")[0] ?? "friend") + " 👋"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-2xl flex-col">
        {/* ── Top bar ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.05] bg-[#070c18]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/home/" + username)}
              aria-label="Go to home"
              className="rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5 text-gray-400 transition-all hover:bg-white/[0.07] hover:text-white focus-visible:outline-none"
            >
              <ArrowLeft size={15} />
            </motion.button>
            <div>
              <h1 className="text-sm font-bold text-white">My Profile</h1>
              <p className="text-[11px] text-gray-600">
                {fmt(user.postCount)} posts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setEditProfileModal(true)}
              aria-label="Edit profile"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.06] hover:text-indigo-300 focus-visible:outline-none"
            >
              <UserCircle2 size={13} />
              <span className="hidden sm:inline">Edit Profile</span>
            </motion.button>

            <div className="relative" ref={moreRef}>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowMore((v) => !v)}
                aria-label="More options"
                className={
                  "rounded-full border p-1.5 transition-all focus-visible:outline-none " +
                  (showMore
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white")
                }
              >
                <MoreHorizontal size={14} />
              </motion.button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    key="more-menu"
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/70"
                  >
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    <div className="p-3">
                      <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-2">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.name}
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/50 to-violet-600/50 text-[11px] font-bold text-white">
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-white">
                            {user.name}
                          </p>
                          <p className="truncate text-[10px] text-gray-500">
                            {"@" + user.username}
                          </p>
                        </div>
                        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      </div>
                      <div className="mb-2 h-px bg-white/[0.05]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10 focus-visible:outline-none"
                      >
                        <LogOut size={13} />
                        Sign out of Linkora
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Cover ── */}
        <div className="group relative h-36 w-full overflow-hidden sm:h-44">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
          {user.coverPhoto ? (
            <img
              src={user.coverPhoto}
              alt="Cover"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-violet-900/50 to-[#070c18]" />
              <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-[90px]" />
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-600/20 blur-[90px]" />
            </>
          )}

          <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/30" />

          <AnimatePresence>
            {coverUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm"
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
                <p className="text-[11px] font-semibold tracking-wide text-white/80">
                  Uploading cover…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            aria-label="Change cover photo"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/[0.18] bg-black/50 px-2.5 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white focus-visible:outline-none disabled:opacity-0 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Camera size={11} />
            Edit cover
          </button>
        </div>

        {/* ── Avatar + stats ── */}
        <div className="relative px-4">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <div className="group/avatar absolute -top-11 left-4">
            <div className="relative">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-[#070c18] sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/70 to-violet-600/70 text-2xl font-bold text-white ring-4 ring-[#070c18] sm:h-24 sm:w-24">
                  {initial}
                </div>
              )}

              <AnimatePresence>
                {avatarUploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/65 backdrop-blur-[2px] ring-4 ring-[#070c18]"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                aria-label="Change avatar"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full focus-visible:outline-none disabled:pointer-events-none"
              />

              <div
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                className={
                  "absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-[#070c18] shadow-lg transition-all duration-200 " +
                  (avatarUploading
                    ? "pointer-events-none bg-indigo-500/50"
                    : "bg-indigo-500 hover:scale-110 hover:bg-indigo-400")
                }
              >
                {avatarUploading ? (
                  <Loader2 size={10} className="animate-spin text-white" />
                ) : (
                  <Camera size={10} className="text-white" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-6 pb-2 pt-3"
          >
            {[
              { label: "Posts", value: user.postCount, onClick: null },
              {
                label: "Following",
                value: user.following,
                onClick: () => setFollowModal({ open: true, tab: "following" }),
              },
              {
                label: "Followers",
                value: user.followers,
                onClick: () => setFollowModal({ open: true, tab: "followers" }),
              },
            ].map(({ label, value, onClick }) => (
              <div
                key={label}
                onClick={onClick}
                className={"text-center " + (onClick ? "cursor-pointer" : "")}
              >
                <p className="text-sm font-bold text-white">{fmt(value)}</p>
                <p
                  className={
                    "text-[11px] " +
                    (onClick
                      ? "text-gray-400 transition-colors hover:text-indigo-400"
                      : "text-gray-500")
                  }
                >
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Identity ── */}
        <div className="mt-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              {user.isVerified && (
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
                  Verified
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{"@" + user.username}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-3"
          >
            {user.bio ? (
              <p
                onClick={() => setBioModal(true)}
                className="cursor-pointer text-sm leading-relaxed text-gray-300 transition-colors hover:text-white"
              >
                {user.bio}
              </p>
            ) : (
              <button
                onClick={() => setBioModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/[0.08] px-3 py-2 text-xs text-gray-600 transition-all hover:border-indigo-500/30 hover:text-indigo-400 focus-visible:outline-none"
              >
                <UserCircle2 size={11} />
                Add a bio to your profile
              </button>
            )}
          </motion.div>

          {user.createdAt && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 flex items-center gap-1.5 text-xs text-gray-600"
            >
              <Calendar size={11} />
              {"Joined " + fmtDate(user.createdAt)}
            </motion.p>
          )}
        </div>

        {/* ── Compose Box ── */}
        <div className="mt-5">
          <ComposeBox user={user} initial={initial} onPostCreated={handlePostCreated} />
        </div>

        {/* ── Tabs ── */}
        <div className="mt-5 flex border-b border-white/[0.05]">
          {TABS.map((tab) => {
            const active = activeTab === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={
                  "relative flex-1 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none " +
                  (active ? "text-white" : "text-gray-600 hover:text-gray-400")
                }
              >
                <div className="flex items-center justify-center gap-1.5">
                  {tab === "GitHub" && <Github size={14} />}
                  {tab}
                </div>
                {active && (
                  <motion.span
                    layoutId="tab-bar"
                    className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-indigo-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* ── POSTS TAB ── */}
            {activeTab === "posts" && (
              <>
                {postsLoading && page === 1 && (
                  <div className="flex flex-col">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-3 border-b border-white/[0.05] px-4 py-4"
                      >
                        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-32 animate-pulse rounded-full bg-white/[0.06]" />
                          <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.04]" />
                          <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {postsError && !postsLoading && (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
                      <AlertCircle size={18} className="text-red-400" />
                    </div>
                    <p className="text-xs text-gray-500">{postsError}</p>
                    <button
                      onClick={() => { setPosts([]); setPage(1); }}
                      className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/[0.05] hover:text-white"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!postsLoading && !postsError && posts.length === 0 && (
                  <EmptyPosts />
                )}

                {posts.length > 0 && (
                  <>
                    <AnimatePresence initial={false}>
                      {posts.map((post, i) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          initial={initial}
                          index={i}
                          onDelete={handlePostDeleted}
                        />
                      ))}
                    </AnimatePresence>

                    {pagination?.hasNextPage && (
                      <div className="flex justify-center py-6">
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={postsLoading}
                          className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
                        >
                          {postsLoading && (
                            <Loader2 size={12} className="animate-spin" />
                          )}
                          Load more posts
                        </button>
                      </div>
                    )}

                    {!pagination?.hasNextPage && posts.length > 0 && (
                      <p className="py-8 text-center text-[11px] text-gray-700">
                        You've seen all your posts
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── GITHUB TAB ── */}
            {activeTab === "github" && (
              <>
                {gitHubLoading && (
                  <div className="flex flex-col gap-3 px-4 py-8">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-32 animate-pulse rounded-2xl bg-white/[0.03]"
                      />
                    ))}
                  </div>
                )}

                {!gitHubConnected && !gitHubLoading && !gitHubError && (
                  <div className="px-4 py-8">
                    <ConnectGitHub onConnect={handleConnectGitHub} />
                  </div>
                )}

                {gitHubError && !gitHubLoading && (
                  <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
                      <AlertCircle size={18} className="text-red-400" />
                    </div>
                    <p className="text-xs text-gray-500">{gitHubError}</p>
                    <button
                      onClick={() => setGitHubError("")}
                      className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/[0.05] hover:text-white"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {gitHubConnected && gitHubRepos.length > 0 && (
                  <div className="grid gap-4 px-4 py-6 sm:grid-cols-2">
                    {gitHubRepos.map((repo, i) => (
                      <GitHubRepoCard key={repo.id} repo={repo} index={i} />
                    ))}
                  </div>
                )}

                {gitHubConnected &&
                  gitHubRepos.length === 0 &&
                  !gitHubLoading &&
                  !gitHubError && (
                    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                        <Github size={20} className="text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-300">
                          No repositories yet
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600">
                          Create your first repo on GitHub
                        </p>
                      </div>
                    </div>
                  )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="h-10" />
      </div>

      <FollowModel
        isOpen={followModal.open}
        defaultTab={followModal.tab}
        onClose={() => setFollowModal({ open: false, tab: "followers" })}
        currentUserId={user?._id}
      />
      <AddBio
        isOpen={bioModal}
        onClose={() => setBioModal(false)}
        currentBio={user?.bio ?? ""}
        onSaved={(newBio) => setUser((prev) => ({ ...prev, bio: newBio }))}
      />
      <EditProfile
        isOpen={editProfileModal}
        onClose={() => setEditProfileModal(false)}
        user={user}
        onSaved={(field, value) => {
          setUser((prev) => ({ ...prev, [field]: value }));
        }}
      />
    </>
  );
}