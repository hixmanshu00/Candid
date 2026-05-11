import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import axios from "axios";
import {
  Zap, History, BarChart3, PlayCircle, TrendingUp, TrendingDown,
  Flame, Trophy, ChevronRight, Target, Brain, Clock, ArrowRight,
  Sparkles,
} from "lucide-react";
import { ServerUrl } from "../App";
import { format } from "date-fns";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MODE_COLORS = {
  Technical: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  HR: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  Behavioral: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "System Design": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  DSA: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Leadership: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickAction({ icon: Icon, label, desc, onClick, primary }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        text-left w-full rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md
        ${primary
          ? "bg-teal-600 hover:bg-teal-700 border-teal-700 text-white"
          : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white hover:border-teal-300 dark:hover:border-teal-700"
        }
      `}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${primary ? "bg-white/20" : "bg-teal-100 dark:bg-teal-950/40"}`}>
        <Icon size={18} className={primary ? "text-white" : "text-teal-600 dark:text-teal-400"} />
      </div>
      <p className={`font-bold text-sm ${primary ? "text-white" : "text-slate-900 dark:text-white"}`}>{label}</p>
      <p className={`text-xs mt-0.5 leading-relaxed ${primary ? "text-teal-200" : "text-slate-500 dark:text-zinc-400"}`}>{desc}</p>
    </motion.button>
  );
}

function StatCard({ icon: Icon, label, value, trend, color = "teal" }) {
  const colors = {
    teal: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
    emerald: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">{label}</p>
      </div>
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { userData } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) { navigate("/"); return; }
    const load = async () => {
      try {
        const [progRes, histRes] = await Promise.all([
          axios.get(ServerUrl + "/api/user/progress", { withCredentials: true }),
          axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true }),
        ]);
        setProgress(progRes.data);
        setRecentInterviews((histRes.data || []).slice(0, 3));
      } catch {
        // silently fail — show zeroes
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userData, navigate]);

  const first = userData?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full space-y-8">

        {/* ── Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{getGreeting()},</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
              {first} 👋
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
              {progress?.totalInterviews > 0
                ? `You've completed ${progress.totalInterviews} interview${progress.totalInterviews > 1 ? "s" : ""}. Keep going!`
                : "Start your first interview to track your progress."}
            </p>
          </div>

          {progress?.streak > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-2xl px-4 py-3">
              <Flame size={18} className="text-amber-500" />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{progress.streak}-day streak</p>
                <p className="text-xs text-amber-500 dark:text-amber-400">Keep it up!</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Credits"
            value={userData?.credits ?? 0}
            color="amber"
          />
          <StatCard
            icon={Brain}
            label="Total Interviews"
            value={progress?.totalInterviews ?? 0}
            color="teal"
          />
          <StatCard
            icon={Trophy}
            label="Avg Score"
            value={progress?.avgScore ? `${progress.avgScore}%` : "—"}
            trend={progress?.improvement}
            color="emerald"
          />
          <StatCard
            icon={Target}
            label="Best Score"
            value={progress?.bestScore ? `${progress.bestScore}%` : "—"}
            color="rose"
          />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={PlayCircle}
              label="Start Interview"
              desc="Pick your mode and begin"
              onClick={() => navigate("/interview")}
              primary
            />
            <QuickAction
              icon={History}
              label="View History"
              desc="Browse past sessions"
              onClick={() => navigate("/history")}
            />
            <QuickAction
              icon={BarChart3}
              label="Profile & Progress"
              desc="Charts, trends & insights"
              onClick={() => navigate("/profile")}
            />
            <QuickAction
              icon={Zap}
              label="Buy Credits"
              desc="Top up your balance"
              onClick={() => navigate("/pricing")}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Recent Interviews ── */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                Recent Interviews
              </h2>
              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-10 flex justify-center">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentInterviews.length === 0 ? (
                <div className="p-10 text-center">
                  <Brain size={32} className="text-slate-200 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">No interviews yet</p>
                  <p className="text-xs text-slate-300 dark:text-zinc-600 mt-1">Start your first session to see it here.</p>
                  <button
                    onClick={() => navigate("/interview")}
                    className="mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 mx-auto transition"
                  >
                    Start now <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                recentInterviews.map((iv, i) => (
                  <button
                    key={iv._id}
                    onClick={() => navigate(`/report/${iv._id}`)}
                    className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition ${i < recentInterviews.length - 1 ? "border-b border-slate-100 dark:border-zinc-800" : ""}`}
                  >
                    <div className="w-9 h-9 bg-teal-100 dark:bg-teal-950/40 rounded-xl flex items-center justify-center shrink-0">
                      <Brain size={15} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {iv.role || "Interview"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODE_COLORS[iv.mode] || "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                          {iv.mode}
                        </span>
                        {iv.createdAt && (
                          <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(iv.createdAt), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {iv.overallScore != null ? (
                        <p className={`text-sm font-bold ${iv.overallScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {iv.overallScore}%
                        </p>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-zinc-600 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-medium">In Progress</span>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-zinc-600 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Insight Panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
              Insights
            </h2>

            {/* Weak areas */}
            {progress?.weakAreas?.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={15} className="text-rose-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Focus Areas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {progress.weakAreas.slice(0, 4).map((a) => (
                    <span key={a} className="text-xs font-medium px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/30">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Strong areas */}
            {progress?.strongAreas?.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={15} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Strong Areas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {progress.strongAreas.slice(0, 4).map((a) => (
                    <span key={a} className="text-xs font-medium px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* CTA tip */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-linear-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white cursor-pointer shadow-md shadow-teal-500/20"
              onClick={() => navigate("/profile")}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-teal-200" />
                <p className="text-xs font-semibold text-teal-200 uppercase tracking-wide">Pro Tip</p>
              </div>
              <p className="text-sm font-bold leading-snug">
                {progress?.totalInterviews > 0
                  ? "Check your skill trends in the Profile page to see what's improving."
                  : "Complete your first interview to unlock progress tracking and analytics."}
              </p>
              <div className="flex items-center gap-1 mt-3 text-teal-200 text-xs font-semibold">
                View Profile <ArrowRight size={12} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
