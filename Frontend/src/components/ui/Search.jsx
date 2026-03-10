import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

export default function UserSearchBar({ className = "", compact = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/users/search", { params: { q } });
      setResults(data.users ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setActiveIndex(-1);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(val), 320);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    else if (e.key === "Escape") close();
  };

  const handleSelect = (user) => { close(); navigate(`/profile/${user.username}`); };

  const close = () => {
    setOpen(false); setQuery(""); setResults([]);
    setActiveIndex(-1); setFocused(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const showDropdown = open && query.trim();

  return (
    <>
      <style>{`
        .usb-wrap { position: relative; width: 100%; }

        .usb-field {
          display: flex; align-items: center; gap: 8px;
          height: 32px; padding: 0 11px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          cursor: text;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .usb-field.open {
          border-color: rgba(99,102,241,0.45);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
        }
        .usb-field:not(.open):hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
        }

        .usb-input {
          flex: 1; min-width: 0;
          background: transparent; border: none; outline: none;
          font-size: 12px; color: rgba(255,255,255,0.9);
          letter-spacing: 0.01em;
        }
        .usb-input::placeholder { color: rgba(255,255,255,0.22); }

        .usb-kbd { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
        .usb-kbd kbd {
          display: inline-flex; align-items: center; justify-content: center;
          height: 18px; min-width: 18px; padding: 0 4px;
          border-radius: 5px; border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.05);
          font-size: 10px; font-family: inherit;
          color: rgba(255,255,255,0.25);
        }
        .usb-clear-btn {
          background: rgba(255,255,255,0.07); border: none; cursor: pointer;
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .usb-clear-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }

        /* Dropdown */
        .usb-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 9999;
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.07);
          background: #0f1220;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset,
                      0 40px 80px rgba(0,0,0,0.75), 0 8px 20px rgba(0,0,0,0.4);
          overflow: hidden;
        }

        .usb-label {
          padding: 10px 14px 5px;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.18);
        }

        .usb-list { padding: 0 4px 4px; }

        .usb-row {
          display: flex; align-items: center; gap: 11px;
          padding: 7px 10px; border-radius: 10px; cursor: pointer;
          transition: background 0.1s;
        }
        .usb-row:hover, .usb-row.active { background: rgba(99,102,241,0.10); }
        .usb-row.active .usb-row-name { color: #a5b4fc; }

        .usb-avatar {
          width: 34px; height: 34px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .usb-avatar-fallback {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0; border: 1px solid rgba(255,255,255,0.07);
        }

        .usb-row-body { flex: 1; min-width: 0; }
        .usb-row-name {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.88);
          display: flex; align-items: center; gap: 5px;
          line-height: 1.3; transition: color 0.1s;
        }
        .usb-row-handle {
          font-size: 11px; color: rgba(255,255,255,0.28);
          margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .usb-row-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .usb-pill {
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px; padding: 2px 7px;
        }
        .usb-arr {
          color: transparent;
          transition: color 0.15s, transform 0.15s;
        }
        .usb-row:hover .usb-arr, .usb-row.active .usb-arr {
          color: rgba(99,102,241,0.6);
          transform: translate(1px,-1px);
        }

        mark.usb-hl { background: transparent; color: #818cf8; font-weight: 600; }

        /* Empty */
        .usb-empty {
          padding: 28px 16px; display: flex; flex-direction: column;
          align-items: center; gap: 8px; text-align: center;
        }
        .usb-empty-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.18);
        }
        .usb-empty-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.4); }
        .usb-empty-sub { font-size: 11px; color: rgba(255,255,255,0.18); }

        /* Footer */
        .usb-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 8px 14px; display: flex; gap: 12px; align-items: center;
        }
        .usb-hint {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; color: rgba(255,255,255,0.18);
        }
        .usb-hint kbd {
          display: inline-flex; align-items: center; justify-content: center;
          height: 16px; min-width: 16px; padding: 0 4px;
          border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          font-size: 9px; font-family: inherit; color: rgba(255,255,255,0.25);
        }

        /* Skeleton */
        @keyframes usb-pulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
        .usb-skel { animation: usb-pulse 1.4s ease infinite; border-radius: 6px; background: rgba(255,255,255,0.06); }
      `}</style>

      <div className={`usb-wrap ${className}`} ref={containerRef}>
        {/* Input */}
        <div
          className={`usb-field ${focused ? "open" : ""}`}
          onClick={() => inputRef.current?.focus()}
        >

          <Search
            size={13}
            aria-hidden="true"
            style={{ flexShrink: 0, transition: "color .2s", color: focused ? "rgba(99,102,241,.8)" : "rgba(255,255,255,.25)" }}
          />
          <input
            ref={inputRef}
            type="text" value={query}
            onChange={handleChange} onKeyDown={handleKeyDown}
            onFocus={() => { setFocused(true); query.trim() && setOpen(true); }}
            placeholder="Search people…"
            autoComplete="off" spellCheck={false}
            className="usb-input"
          />
            {loading ? (
              <motion.span key="spin"
                initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .6 }} transition={{ duration: .1 }}
                style={{ fontSize: 11, color: "rgba(99,102,241,.7)", flexShrink: 0 }}
              >…</motion.span>
            ) : query ? (
              <motion.button key="x" className="usb-clear-btn"
                initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .6 }} transition={{ duration: .1 }}
                onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Clear"
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>×</span>
              </motion.button>
            ) : null}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="usb-dropdown"
              initial={{ opacity: 0, y: -8, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: .98 }}
              transition={{ duration: .16, ease: [.23,1,.32,1] }}
            >
              {loading ? (
                <div style={{ padding: "8px 4px" }}>
                  {[80, 55, 70].map((w, i) => (
                    <div key={i} className="usb-row" style={{ pointerEvents:"none" }}>
                      <div className="usb-skel" style={{ width:34, height:34, borderRadius:10, flexShrink:0 }}/>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                        <div className="usb-skel" style={{ height:10, width:`${w}%` }}/>
                        <div className="usb-skel" style={{ height:8, width:"38%", opacity:.6 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="usb-empty">
                  <p className="usb-empty-title">No results for "{query}"</p>
                  <p className="usb-empty-sub">Try a different name or username</p>
                </div>
              ) : (
                <>
                  <div className="usb-label">People</div>
                  <div className="usb-list">
                    {results.map((user, i) => (
                      <UserRow key={user._id} user={user} query={query}
                        isActive={activeIndex === i}
                        onHover={() => setActiveIndex(i)}
                        onSelect={() => handleSelect(user)}
                      />
                    ))}
                  </div>

                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Helpers ── */
const GRADS = [
  ["#6366f1","#8b5cf6"],["#ec4899","#f43f5e"],["#10b981","#06b6d4"],
  ["#f59e0b","#ef4444"],["#3b82f6","#6366f1"],["#8b5cf6","#ec4899"],
];
function hashStr(s=""){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h;}
function escRgx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
function fmtN(n){if(n>=1e6)return`${(n/1e6).toFixed(1)}M`;if(n>=1e3)return`${(n/1e3).toFixed(1)}K`;return String(n);}

function hl(text, query) {
  if (!query) return text;
  const rx = new RegExp(`(${escRgx(query)})`,"gi");
  return text.split(rx).map((p,i)=> rx.test(p) ? <mark key={i} className="usb-hl">{p}</mark> : p);
}

function UserRow({ user, query, isActive, onHover, onSelect }) {
  const [g1,g2] = GRADS[Math.abs(hashStr(user._id??user.username)) % GRADS.length];
  return (
    <div role="option" aria-selected={isActive}
      className={`usb-row ${isActive?"active":""}`}
      onMouseEnter={onHover} onClick={onSelect}
    >
      {user.profilePic
        ? <img src={user.profilePic} alt={user.name} className="usb-avatar"/>
        : <div className="usb-avatar-fallback" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
            {user.name?.[0]?.toUpperCase()??"?"}
          </div>
      }
      <div className="usb-row-body">
        <div className="usb-row-name">
          {hl(user.name, query)}
          {user.isVerified && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#818cf8" aria-label="Verified">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )}
        </div>
        <div className="usb-row-handle">@{hl(user.username, query)}</div>
      </div>
      <div className="usb-row-right">
      </div>
    </div>
  );
}