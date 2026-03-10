import { useState, useEffect , useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Link2, MapPin, Edit3, Check, X,
  Loader2, AlertCircle, Camera, UserPlus, UserMinus,
  Grid3X3, Github, Star, GitFork, ExternalLink, Code2, Lock, Globe
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";
import PostCard from "../components/PostCard";

/* ─────────────────────────────────────────
   Skeleton helpers
───────────────────────────────────────── */
const Pulse = ({ className }) => (
  <div className={`animate-pulse rounded-full bg-white/[0.06] ${className}`} />
);

const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-36 w-full bg-white/[0.06]" />
    <div className="px-5 pb-4">
      <div className="flex items-end justify-between -mt-10 mb-4">
        <div className="h-20 w-20 rounded-full bg-white/[0.08] ring-4 ring-[#090e1a]" />
        <div className="h-8 w-24 rounded-2xl bg-white/[0.06]" />
      </div>
      <Pulse className="h-4 w-36 mb-2" />
      <Pulse className="h-3 w-24 mb-4" />
      <Pulse className="h-3 w-full mb-1.5" />
      <Pulse className="h-3 w-2/3 mb-4" />
      <div className="flex gap-4">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-3 w-20" />
      </div>
    </div>
  </div>
);

const RepoSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <Pulse className="h-3.5 w-32" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-3/4" />
        <div className="flex gap-4 pt-1">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-12" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   Language color map
───────────────────────────────────────── */
const LANG_COLORS = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Ruby: "#701516", Swift: "#fa7343", Kotlin: "#A97BFF",
  PHP: "#4F5D95", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
  Vue: "#41b883", Dart: "#00B4AB", "C#": "#178600",
};

/* ─────────────────────────────────────────
   GitHub Repo Card
───────────────────────────────────────── */
const RepoCard = ({ repo }) => {
  const langColor = LANG_COLORS[repo.language] ?? "#6366f1";
  return (
    <a href={repo.html_url} target="_blank" rel="noreferrer"
      className="group flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] hover:shadow-lg hover:shadow-indigo-900/20 hover:-translate-y-0.5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {repo.private
            ? <Lock size={13} className="shrink-0 text-amber-500/70" />
            : <Globe size={13} className="shrink-0 text-indigo-400/60" />}
          <span className="truncate text-[13px] font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">
            {repo.name}
          </span>
        </div>
        <ExternalLink size={12} className="shrink-0 text-gray-700 group-hover:text-gray-400 transition-colors mt-0.5" />
      </div>

      {/* Description */}
      <p className="text-[12px] leading-relaxed text-gray-500 line-clamp-2 flex-1">
        {repo.description || <span className="italic text-gray-700">No description provided.</span>}
      </p>

      {/* Topics */}
      {repo.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400/80 ring-1 ring-indigo-500/20">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-gray-600">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor }} />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-500/60" />
            {repo.stargazers_count.toLocaleString()}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={11} className="text-gray-600" />
            {repo.forks_count.toLocaleString()}
          </span>
        )}
        <span className="ml-auto">
          {new Date(repo.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>
    </a>
  );
};

/* ─────────────────────────────────────────
   GitHub Tab Panel
───────────────────────────────────────── */
const GitHubPanel = ({ githubUsername }) => {
  const [repos, setRepos]   = useState([]);
  const [ghUser, setGhUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [sort, setSort]     = useState("updated");

  useEffect(() => {
    if (!githubUsername) return;
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`https://api.github.com/users/${githubUsername}`).then((r) => r.json()),
      fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=${sort}`).then((r) => r.json()),
    ])
      .then(([user, repoData]) => {
        if (user.message === "Not Found") { setError("GitHub user not found."); return; }
        setGhUser(user);
        setRepos(Array.isArray(repoData) ? repoData.filter((r) => !r.fork) : []);
      })
      .catch(() => setError("Failed to load GitHub data."))
      .finally(() => setLoading(false));
  }, [githubUsername, sort]);

  /* Not linked */
  if (!githubUsername) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <Github size={28} className="text-gray-700" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-gray-400">No GitHub linked</p>
          <p className="mt-1 text-[12px] text-gray-600 max-w-[200px]">
            This user hasn't connected their GitHub account yet.
          </p>
        </div>
      </motion.div>
    );
  }

  if (loading) return <RepoSkeleton />;

  if (error) {
    return (
      <div className="mx-5 mt-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
        <AlertCircle size={14} className="shrink-0" />{error}
      </div>
    );
  }

  return (
    <div>
      {/* GitHub summary bar */}
      {ghUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mx-5 mt-5 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
          <img src={ghUser.avatar_url} alt={ghUser.login}
            className="h-10 w-10 rounded-full ring-2 ring-white/10" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-white truncate">{ghUser.name || ghUser.login}</p>
              <a href={ghUser.html_url} target="_blank" rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors">
                <ExternalLink size={11} />
              </a>
            </div>
            <p className="text-[11px] text-gray-600">@{ghUser.login}</p>
          </div>
          <div className="flex items-center gap-5 text-center shrink-0">
            {[
              { value: repos.length, label: "Repos" },
              { value: ghUser.followers?.toLocaleString(), label: "Followers" },
              { value: repos.reduce((a, r) => a + r.stargazers_count, 0).toLocaleString(), label: "Stars" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-[13px] font-bold text-white">{value}</p>
                <p className="text-[10px] text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sort bar */}
      {repos.length > 0 && (
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <p className="text-[12px] text-gray-600">{repos.length} repositories</p>
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-0.5">
            {[
              { id: "updated", label: "🕐 Recent" },
              { id: "stars",   label: "⭐ Stars"  },
              { id: "name",    label: "🔤 Name"   },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setSort(id)}
                className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all
                  ${sort === id ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {repos.length === 0 && !loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <Code2 size={22} className="text-gray-600" />
          </div>
          <p className="text-[14px] font-semibold text-gray-400">No public repositories</p>
          <p className="text-[12px] text-gray-600">This user hasn't published any repos yet.</p>
        </motion.div>
      )}

      {/* Grid */}
      {repos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
          {repos.map((repo, i) => (
            <motion.div key={repo.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.04 }}>
              <RepoCard repo={repo} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Stat chip
───────────────────────────────────────── */
const StatChip = ({ value, label, onClick }) => (
  <button onClick={onClick}
    className="group flex items-baseline gap-1.5 text-left transition-opacity hover:opacity-80 focus-visible:outline-none">
    <span className="text-[15px] font-bold text-white tabular-nums">{value ?? 0}</span>
    <span className="text-[12px] text-gray-500 group-hover:text-gray-400 transition-colors">{label}</span>
  </button>
);

/* ─────────────────────────────────────────
   Tab bar — Posts + GitHub only
───────────────────────────────────────── */
const TABS = [
  { id: "Posts",  icon: Grid3X3 },
  { id: "GitHub", icon: Github  },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex border-b border-white/[0.05]">
    {TABS.map(({ id, icon: Icon }) => (
      <button key={id} onClick={() => onChange(id)}
        className={`relative flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none
          ${active === id ? "text-white" : "text-gray-600 hover:text-gray-400"}`}>
        <Icon size={14} />
        {id}
        {active === id && (
          <motion.div layoutId="tab-indicator"
            className="absolute bottom-0 left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-indigo-500"
            transition={{ type: "spring", stiffness: 500, damping: 40 }} />
        )}
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   Edit field
───────────────────────────────────────── */
const EditField = ({ label, value, onChange, placeholder, maxLength, multiline }) => {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">{label}</label>
      <Tag value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} rows={multiline ? 3 : undefined}
        className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-white placeholder-gray-700 transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:outline-none" />
    </div>
  );
};

/* ─────────────────────────────────────────
   Edit Profile Modal
───────────────────────────────────────── */
const EditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:     user.name     ?? "",
    bio:      user.bio      ?? "",
    location: user.location ?? "",
    website:  user.website  ?? "",
    github:   user.github   ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setErr("");
    try {
      const { data } = await axiosInstance.put("/users/update", form);
      onSave(data.user ?? { ...user, ...form });
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to save changes.");
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(12px)", background: "rgba(9,14,26,0.75)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/60">

        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
          <h2 className="text-[15px] font-bold text-white">Edit Profile</h2>
          <button onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-all focus-visible:outline-none">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <EditField label="Name"     value={form.name}     onChange={set("name")}     placeholder="Your name"                  maxLength={50}  />
          <EditField label="Bio"      value={form.bio}      onChange={set("bio")}      placeholder="Tell the world about yourself…" maxLength={160} multiline />
          <EditField label="Location" value={form.location} onChange={set("location")} placeholder="Where are you?"             maxLength={40}  />
          <EditField label="Website"  value={form.website}  onChange={set("website")}  placeholder="https://yoursite.com"       maxLength={100} />

          {/* GitHub with prefix */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">GitHub Username</label>
            <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all focus-within:border-indigo-500/50 focus-within:bg-white/[0.05]">
              <span className="flex items-center gap-1.5 border-r border-white/[0.08] px-3 py-2.5 text-[13px] text-gray-600 shrink-0">
                <Github size={13} /> github.com/
              </span>
              <input value={form.github} onChange={(e) => set("github")(e.target.value)}
                placeholder="your-username" maxLength={39}
                className="flex-1 bg-transparent px-3 py-2.5 text-[14px] text-white placeholder-gray-700 focus:outline-none" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {err && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-5 mb-2 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={12} />{err}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-2 border-t border-white/[0.05] px-5 py-4">
          <button onClick={onClose}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[13px] font-medium text-gray-400 transition-all hover:bg-white/[0.06] hover:text-gray-200 focus-visible:outline-none">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-1.5 text-[13px] font-semibold text-white shadow-md shadow-indigo-900/40 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none active:scale-95">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Main Profile Page
───────────────────────────────────────── */
export default function Profile() {
  // URL is /profile/:username
  const { username } = useParams();
  const navigate = useNavigate();

  // profileUser + posts come from a single call to /otheruser/:username
  const [profileUser,    setProfileUser]    = useState(null);
  const [posts,          setPosts]          = useState([]);
  const [pageLoading,    setPageLoading]    = useState(true);
  const [pageError,      setPageError]      = useState("");

  // loggedInUser comes from JWT cookie via /users/me
  const [loggedInUser,   setLoggedInUser]   = useState(null);

  const [activeTab,      setActiveTab]      = useState("Posts");
  const [followLoading,  setFollowLoading]  = useState(false);
  const [editOpen,       setEditOpen]       = useState(false);
  const [bannerHover,    setBannerHover]    = useState(false);
  const [avatarHover,    setAvatarHover]    = useState(false);

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const isOwnProfile = loggedInUser && profileUser && loggedInUser._id === profileUser._id;
  const isFollowing  = loggedInUser && profileUser?.followers?.includes(loggedInUser._id);

  /* ──────────────────────────────────────
     1. Get logged-in user from JWT cookie
        → if it's their own profile, redirect
  ─────────────────────────────────────── */
  useEffect(() => {
    axiosInstance.get("/users/me")
      .then(({ data }) => {
        const me = data.user ?? data;
        setLoggedInUser(me);
        // If the username in the URL is the logged-in user → redirect to own profile
        if (me?.username && me.username === username) {
          navigate(`/profile/${me.username}`, { replace: true });
        }
      })
      .catch(() => {}); // not logged in — show public profile
  }, [username, navigate]);

  /* ──────────────────────────────────────
     2. Fetch profile user + posts together
        Single call: GET /otheruser/:username
        Returns: { user, posts }
  ─────────────────────────────────────── */
  useEffect(() => {
    if (!username) return;
    setPageLoading(true);
    setPageError("");
    axiosInstance.get(`/otheruser/${username}`)
      .then(({ data }) => {
        setProfileUser(data.user);
        setPosts(data.posts ?? []);
      })
      .catch((err) => {
        const msg = err.response?.data?.message;
        setPageError(msg || "Failed to load profile.");
      })
      .finally(() => setPageLoading(false));
  }, [username]);

  /* ── Follow / Unfollow ── */
  const handleFollow = async () => {
    if (!loggedInUser || !profileUser) return;
    setFollowLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/users/${isFollowing ? "unfollow" : "follow"}/${profileUser._id}`
      );
      if (data.success) {
        setProfileUser((prev) => ({
          ...prev,
          followers: isFollowing
            ? prev.followers.filter((fid) => fid !== loggedInUser._id)
            : [...(prev.followers ?? []), loggedInUser._id],
        }));
      }
    } catch {}
    finally { setFollowLoading(false); }
  };

  /* ── Image upload (own profile only) ── */
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await axiosInstance.put("/users/update", {
          [type === "avatar" ? "profilePic" : "bannerPic"]: reader.result,
        });
        setProfileUser((prev) => ({ ...prev, ...(data.user ?? {}) }));
      } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const joinDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
  const avatarInitial = profileUser?.name?.[0]?.toUpperCase() ?? "?";

  /* ──────────────── RENDER ──────────────── */
  return (
    <div className="flex h-screen overflow-hidden bg-[#090e1a]">
      <Sidebar />

      <main className="flex flex-1 flex-col border-r border-white/[0.05] overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.15) transparent" }}>
        <style>{`
          main::-webkit-scrollbar { width: 4px; }
          main::-webkit-scrollbar-track { background: transparent; }
          main::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.18); border-radius: 99px; }
          main::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }
        `}</style>

        {/* ── Sticky back header ── */}
        <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#090e1a]/85 backdrop-blur-xl">
          <div className="flex items-center gap-3.5 px-4 py-3">
            <button onClick={() => navigate(-1)}
              className="rounded-full p-1.5 text-gray-500 transition-all hover:bg-white/[0.06] hover:text-gray-300 active:scale-95 focus-visible:outline-none">
              <ArrowLeft size={16} />
            </button>
            {profileUser && !pageLoading ? (
              <div>
                <p className="text-[15px] font-bold text-white leading-tight">{profileUser.name}</p>
                <p className="text-[11px] text-gray-600">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Pulse className="h-3.5 w-28" />
                <Pulse className="h-2.5 w-16" />
              </div>
            )}
          </div>
        </div>

        {/* ── Error state ── */}
        {pageError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mx-5 mt-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span className="flex-1">{pageError}</span>
            <button onClick={() => navigate(-1)}
              className="shrink-0 text-xs underline underline-offset-2 hover:text-red-300">Go back</button>
          </motion.div>
        )}

        {/* ── Skeleton ── */}
        {pageLoading && <ProfileSkeleton />}

        {/* ── Profile content ── */}
        {!pageLoading && profileUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* Banner */}
            <div className="relative h-36 w-full overflow-hidden"
              onMouseEnter={() => setBannerHover(true)}
              onMouseLeave={() => setBannerHover(false)}
              onClick={() => isOwnProfile && bannerInputRef.current?.click()}
              style={{ cursor: isOwnProfile ? "pointer" : "default" }}>
              {profileUser.bannerPic ? (
                <img src={profileUser.bannerPic} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-[#0d1424]">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
                  <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-indigo-600/20 blur-3xl" />
                  <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full bg-violet-600/20 blur-3xl" />
                </div>
              )}
              {isOwnProfile && (
                <AnimatePresence>
                  {bannerHover && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-2 text-[13px] font-medium text-white/90">
                        <Camera size={14} /> Change banner
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleImageUpload(e, "banner")} />
            </div>

            {/* Avatar + action buttons */}
            <div className="flex items-end justify-between px-5 -mt-10 mb-3">
              {/* Avatar */}
              <div className="relative"
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => isOwnProfile && avatarInputRef.current?.click()}
                style={{ cursor: isOwnProfile ? "pointer" : "default" }}>
                <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-[#090e1a] shadow-xl shadow-black/50">
                  {profileUser.profilePic ? (
                    <img src={profileUser.profilePic} alt={profileUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/50 to-violet-600/50 text-2xl font-bold text-indigo-200">
                      {avatarInitial}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <AnimatePresence>
                    {avatarHover && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                        <Camera size={16} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#090e1a] bg-emerald-500" />
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleImageUpload(e, "avatar")} />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <button onClick={() => setEditOpen(true)}
                    className="flex items-center gap-1.5 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-95 focus-visible:outline-none">
                    <Edit3 size={13} /> Edit profile
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate(`/messages/${profileUser._id}`)}
                      className="rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-white/[0.08] active:scale-95 focus-visible:outline-none">
                      Message
                    </button>
                    <button onClick={handleFollow} disabled={followLoading}
                      className={`flex items-center gap-1.5 rounded-2xl px-4 py-1.5 text-[13px] font-semibold transition-all active:scale-95 focus-visible:outline-none disabled:opacity-60
                        ${isFollowing
                          ? "border border-white/[0.12] bg-white/[0.04] text-white hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-red-400"
                          : "bg-indigo-600 text-white shadow-md shadow-indigo-900/40 hover:bg-indigo-500"}`}>
                      {followLoading
                        ? <Loader2 size={13} className="animate-spin" />
                        : isFollowing
                          ? <><UserMinus size={13} /> Unfollow</>
                          : <><UserPlus size={13} /> Follow</>}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name / handle / bio / meta */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-extrabold tracking-tight text-white leading-tight">
                  {profileUser.name}
                </h2>
                {profileUser.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 ring-1 ring-indigo-500/20">
                    <Check size={10} /> Verified
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] text-gray-600">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="mt-3 text-[14px] leading-relaxed text-gray-300">{profileUser.bio}</p>
              )}

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-3.5 text-[12px] text-gray-500">
                {profileUser.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-600" />{profileUser.location}
                  </span>
                )}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Link2 size={12} />{profileUser.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profileUser.github && (
                  <a href={`https://github.com/${profileUser.github}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                    <Github size={12} />{profileUser.github}
                  </a>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-600" />Joined {joinDate}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-5">
                <StatChip
                  value={profileUser.following?.length}
                  label="Following"
                  onClick={() => navigate(`/profile/${id}/following`)}
                />
                <StatChip
                  value={profileUser.followers?.length}
                  label="Followers"
                  onClick={() => navigate(`/profile/${id}/followers`)}
                />
              </div>
            </div>

            {/* ── Tabs ── */}
            <TabBar active={activeTab} onChange={setActiveTab} />

            {/* ── Posts Tab ── */}
            {activeTab === "Posts" && (
              <div>
                {posts.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 px-4 py-24 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                      <Grid3X3 size={22} className="text-gray-600" />
                    </div>
                    <p className="text-[14px] font-semibold text-gray-400">No posts yet</p>
                    <p className="text-[12px] text-gray-600 max-w-[180px]">
                      {isOwnProfile
                        ? "Share something with the world."
                        : `@${profileUser.username} hasn't posted anything.`}
                    </p>
                  </motion.div>
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

                {posts.length > 0 && (
                  <p className="py-8 text-center text-[11px] text-gray-700">
                    You're all caught up ✦
                  </p>
                )}
              </div>
            )}

            {/* ── GitHub Tab ── */}
            {activeTab === "GitHub" && (
              <GitHubPanel githubUsername={profileUser.github} />
            )}

          </motion.div>
        )}
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && profileUser && (
          <EditModal
            user={profileUser}
            onClose={() => setEditOpen(false)}
            onSave={(updated) => {
              setProfileUser((p) => ({ ...p, ...updated }));
              setEditOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <RightPanel />
    </div>
  );
}