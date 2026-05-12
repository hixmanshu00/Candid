import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { BsRobot } from "react-icons/bs";
import {
  Zap, User, LogOut, History, BarChart3, CreditCard,
  ChevronDown, Sun, Moon, LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ServerUrl, setAuthToken } from "../App";
import { setUserData } from "../redux/userSlice";
import { useTheme } from "../context/ThemeContext";
import AuthModel from "./AuthModel";

export default function Navbar() {
  const { userData } = useSelector((s) => s.user);
  const { isDark, toggle } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout");
      setAuthToken(null);
      dispatch(setUserData(null));
      setShowUserMenu(false);
      navigate("/");
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Logout failed.");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = userData?.name?.charAt(0).toUpperCase() || "";

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 flex justify-center px-4 pt-5">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex justify-between items-center"
      >
        {/* Logo */}
        <button onClick={() => navigate(userData ? "/dashboard" : "/")} className="flex items-center gap-2.5">
          <div className="bg-teal-600 text-white p-2 rounded-xl">
            <BsRobot size={16} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden sm:block text-base">
            Candid<span className="text-teal-600">.ai</span>
          </span>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Credits pill */}
          <button
            onClick={() => {
              if (!userData) { setShowAuth(true); return; }
              navigate("/pricing");
            }}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition px-3.5 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-zinc-300"
          >
            <Zap size={14} className="text-amber-500" />
            {userData?.credits ?? 0}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                if (!userData) { setShowAuth(true); return; }
                setShowUserMenu((v) => !v);
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 transition text-white pl-1.5 pr-3 py-1.5 rounded-full text-sm font-semibold"
            >
              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {userData ? initial : <User size={13} />}
              </div>
              <span className="hidden sm:block max-w-25 truncate">
                {userData ? userData.name.split(" ")[0] : "Sign In"}
              </span>
              {userData && <ChevronDown size={13} className="text-teal-200" />}
            </button>

            <AnimatePresence>
              {showUserMenu && userData && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userData.name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{userData.email}</p>
                  </div>

                  <div className="py-1.5">
                    {[
                      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
                      { icon: BarChart3, label: "Profile & Progress", path: "/profile" },
                      { icon: History, label: "Interview History", path: "/history" },
                      { icon: CreditCard, label: "Buy Credits", path: "/pricing" },
                    ].map(({ icon: Icon, label, path }) => (
                      <button
                        key={path}
                        onClick={() => { navigate(path); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                      >
                        <Icon size={15} className="text-slate-400 dark:text-zinc-500" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    >
                      <LogOut size={15} />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}
