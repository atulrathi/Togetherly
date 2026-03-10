import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Mail, User, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../services/axiosInstance";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const username = pathname.split("/")[2];

  const NAV_ITEMS = [
    { path: `/home/${username}`,     icon: Home, label: "Home"     },
    { path: `/messages/${username}`, icon: Mail, label: "Messages" },
    { path: `/profile/${username}`,  icon: User, label: "Profile"  },
  ];

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (path) =>
    path.startsWith("/profile")
      ? pathname.startsWith("/profile")
      : pathname === path;

  useEffect(() => {
    if (!showLogout) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target))
        setShowLogout(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLogout]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // proceed regardless
    } finally {
      localStorage.removeItem("token");
      setLoggingOut(false);
      setShowLogout(false);
      navigate("/");
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col justify-between lg:flex xl:w-[240px]"
      style={{ background: "linear-gradient(180deg, #07091480 0%, #070914 100%)", borderRight: "1px solid rgba(255,255,255,0.04)" }}
    >

      {/* Subtle top-edge glow */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      {/* ── Top ── */}
      <div className="flex flex-col px-4 pt-6">

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1,  y:  0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 px-2"
        >
          <Link to="/home" className="group flex items-center gap-2.5 focus-visible:outline-none">
            {/* Logo mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-600/30 transition-shadow group-hover:shadow-indigo-500/40">
              <span className="text-[13px] font-black tracking-tighter text-white select-none">L</span>
            </div>
            <span className="text-[16px] font-extrabold tracking-tight text-white">
              Linkora
            </span>
          </Link>
        </motion.div>

        {/* Section label */}
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
          Menu
        </p>

        {/* Nav */}
        <nav aria-label="Primary navigation" className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ path, icon: Icon, label }, i) => {
            const active = isActive(path);

            return (
              <motion.div
                key={path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1,  x:  0 }}
                transition={{ duration: 0.28, delay: i * 0.06 + 0.08, ease: "easeOut" }}
              >
                <Link
                  to={path}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-[13.5px] font-medium transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30
                    ${active
                      ? "bg-indigo-500/[0.1] text-white"
                      : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"}
                  `}
                >
                  {/* Active pill */}
                  {active && (
                    <motion.span
                      layoutId="sidebar-pill"
                      className="absolute left-0 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.3 : 1.8}
                    aria-hidden="true"
                    className={`transition-colors duration-150 ${active ? "text-indigo-300" : "text-gray-600 group-hover:text-gray-300"}`}
                  />

                  <span>{label}</span>

                  {/* Hover arrow */}
                  {!active && (
                    <span className="ml-auto translate-x-1 text-[10px] text-gray-700 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                      →
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom: User card ── */}
      <div className="relative px-4 pb-5" ref={popoverRef}>

        {/* Thin divider */}
        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Logout popover */}
        <AnimatePresence>
          {showLogout && (
            <motion.div
              key="logout-popover"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1,  y:  0, scale: 1    }}
              exit={{    opacity: 0,  y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1021] shadow-2xl shadow-black/60"
            >
              {/* Top accent */}
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

              <div className="p-4">
                <p className="mb-0.5 text-[13px] font-semibold text-white">Sign out?</p>
                <p className="mb-4 text-[11px] text-gray-500 leading-relaxed">
                  You'll be redirected to the login screen.
                </p>

                <div className="flex flex-col gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-[12px] font-semibold text-red-400 ring-1 ring-red-500/20 transition-all hover:bg-red-500/[0.18] hover:ring-red-500/35 disabled:opacity-50 focus-visible:outline-none"
                  >
                    {loggingOut
                      ? <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                      : <LogOut  size={12} aria-hidden="true" />
                    }
                    {loggingOut ? "Signing out…" : "Yes, sign me out"}
                  </motion.button>

                  <button
                    onClick={() => setShowLogout(false)}
                    className="w-full rounded-xl py-2 text-[12px] font-medium text-gray-600 transition-colors hover:bg-white/[0.04] hover:text-gray-300 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      
      </div>

    </aside>
  );
}