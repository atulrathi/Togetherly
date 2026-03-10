import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/**
 * Login — Root authentication page.
 *
 * POSTs { email, password } to /auth/login via the shared axiosInstance.
 * On success, navigates the user to /home.
 */
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
     let user = await axiosInstance.post("/auth/login", {
        email:    form.email.trim(),
        password: form.password,
      });

      navigate(`/home/${user.data.username}`);

    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message ?? "";

      if (status === 401) {
        setError("Incorrect email or password. Please try again.");
      } else if (status === 403) {
        // Account exists but email has not been verified yet.
        setError("Your email address has not been verified. Please check your inbox.");
      } else if (status === 404) {
        setError("No account found with this email address.");
      } else if (err.code === "ERR_NETWORK" || !err.response) {
        setError("Unable to reach the server. Please check your connection and try again.");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">

      {/* ── Left decorative panel (hidden on mobile) ─────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-indigo-950/40 p-12 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-20 h-[350px] w-[350px] rounded-full bg-violet-700/20 blur-[100px]" />

        <div className="relative">
          <span className="text-2xl font-bold tracking-tight text-white">Linkora</span>
        </div>

        <div className="relative space-y-4">
          <blockquote className="text-3xl font-semibold leading-snug tracking-tight text-white">
            "Connect with the people<br />who matter most."
          </blockquote>
          <p className="text-sm text-indigo-300/70">
            Share moments, follow conversations, and build your community — all in one place.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-600">linkora.app</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* ── Right login form ──────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-16 lg:px-16">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile-only brand */}
          <motion.div variants={itemVariants} className="mb-2 lg:hidden">
            <span className="text-xl font-bold tracking-tight text-white">Linkora</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">
              Welcome back. Enter your credentials to continue.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                <AlertCircle size={15} aria-hidden="true" className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-gray-400">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 transition-all duration-200 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-gray-400">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-400 transition-colors hover:text-indigo-300 focus-visible:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 transition-all duration-200 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-400 focus-visible:outline-none"
                >
                  {showPassword
                    ? <EyeOff size={15} aria-hidden="true" />
                    : <Eye    size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign in"}
            </motion.button>

          </motion.form>

          {/* Register link */}
          <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300">
              Create one
            </Link>
          </motion.p>

        </motion.div>
      </div>

    </div>
  );
}