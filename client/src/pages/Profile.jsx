import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "motion/react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, TrendingUp, TrendingDown, Flame, Trophy,
  BarChart3, Target, Star, Zap, ChevronRight, BookOpen,
} from "lucide-react";
import { ServerUrl } from "../App";
import { format } from "date-fns";

const MODE_COLORS = {
  Technical: "bg-blue-100 text-blue-700",
  HR: "bg-purple-100 text-purple-700",
  Behavioral: "bg-amber-100 text-amber-700",
  "System Design": "bg-indigo-100 text-indigo-700",
  DSA: "bg-rose-100 text-rose-700",
  Leadership: "bg-teal-100 text-teal-700",
};

function StatCard({ icon: Icon, label, value, sub, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { userData } = useSelector((s) => s.user);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(ServerUrl + "/api/user/progress", {
          withCredentials: true,
        });
        setProgress(res.data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (!userData) {
    navigate("/");
    return null;
  }

  const initial = (userData.name || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profile & Progress</h1>
            <p className="text-gray-400 text-xs">Your performance overview</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/30 shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-gray-500 text-sm">{userData.email}</p>
            {progress?.totalInterviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                  {progress.totalInterviews} interviews completed
                </span>
                {progress.improvement > 0 && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                    <TrendingUp size={11} /> +{progress.improvement} improvement
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="sm:text-right">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <Zap size={14} className="text-yellow-400" />
              {userData.credits} credits
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs text-emerald-600 hover:underline mt-1.5 block"
            >
              Buy more →
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm">Loading your progress…</p>
            </div>
          </div>
        ) : !progress || progress.totalInterviews === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
          >
            <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No completed interviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Complete your first interview to see your progress here.</p>
            <button
              onClick={() => navigate("/interview")}
              className="mt-5 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Start Interview
            </button>
          </motion.div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={Trophy}
                label="Total Interviews"
                value={progress.totalInterviews}
                color="emerald"
              />
              <StatCard
                icon={Target}
                label="Average Score"
                value={`${progress.avgScore}/10`}
                sub={progress.improvement > 0 ? `↑ ${progress.improvement} total gain` : undefined}
                color="blue"
              />
              <StatCard
                icon={Star}
                label="Best Score"
                value={`${progress.bestScore}/10`}
                color="amber"
              />
              <StatCard
                icon={Flame}
                label="Practice Streak"
                value={`${progress.streak} day${progress.streak !== 1 ? "s" : ""}`}
                sub={progress.streak > 0 ? "Keep it up!" : "Start today"}
                color="rose"
              />
            </div>

            {/* Score trend chart */}
            {progress.recentTrend.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BarChart3 size={15} className="text-emerald-600" /> Score Over Time
                  </p>
                  <span className="text-xs text-gray-400">Last {progress.recentTrend.length} sessions</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progress.recentTrend}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                        formatter={(val, name, props) => [val, `Score (${props.payload.role})`]}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        fill="url(#scoreGrad)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#10b981" }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Skill trends + mode breakdown side by side */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Skill trends */}
              {progress.skillTrend.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                >
                  <p className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2">
                    <TrendingUp size={15} className="text-indigo-500" /> Skill Trends
                  </p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progress.skillTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 11 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#6366f1" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="communication" name="Communication" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="correctness" name="Correctness" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Mode breakdown */}
              {progress.modeStats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Target size={15} className="text-emerald-600" /> Interview Type Breakdown
                    </p>
                  </div>
                  <div className="space-y-3">
                    {progress.modeStats.map((m) => (
                      <div key={m.mode} className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${MODE_COLORS[m.mode] || "bg-gray-100 text-gray-600"}`}>
                          {m.mode}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${(m.avgScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 shrink-0 w-10 text-right">
                          {m.avgScore}/10
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">{m.count}x</span>
                      </div>
                    ))}
                  </div>

                  {/* Weak / strong areas */}
                  {(progress.weakAreas.length > 0 || progress.strongAreas.length > 0) && (
                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                      {progress.strongAreas.length > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <TrendingUp size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-gray-600">
                            <span className="font-semibold text-emerald-700">Strong: </span>
                            {progress.strongAreas.join(", ")}
                          </span>
                        </div>
                      )}
                      {progress.weakAreas.length > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <TrendingDown size={13} className="text-red-400 mt-0.5 shrink-0" />
                          <span className="text-gray-600">
                            <span className="font-semibold text-red-600">Needs work: </span>
                            {progress.weakAreas.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-white font-bold text-lg">Ready for another session?</p>
                <p className="text-emerald-200 text-sm mt-0.5">Keep practicing to improve your scores.</p>
              </div>
              <button
                onClick={() => navigate("/interview")}
                className="bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition flex items-center gap-2 shrink-0"
              >
                Start Interview <ChevronRight size={15} />
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
