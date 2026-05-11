import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import { ServerUrl } from "../App";
import {
  ArrowLeft, Search, Trophy, Clock, ChevronRight,
  BookOpen, Code2, Users, Brain, Layers, Cpu, Star,
} from "lucide-react";
import { format } from "date-fns";

const MODE_META = {
  Technical:     { icon: Code2,   color: "bg-blue-50 text-blue-700" },
  HR:            { icon: Users,   color: "bg-purple-50 text-purple-700" },
  Behavioral:    { icon: Brain,   color: "bg-amber-50 text-amber-700" },
  "System Design":{ icon: Layers, color: "bg-indigo-50 text-indigo-700" },
  DSA:           { icon: Cpu,     color: "bg-rose-50 text-rose-700" },
  Leadership:    { icon: Star,    color: "bg-teal-50 text-teal-700" },
};

function ScoreRing({ score }) {
  const color =
    score >= 7 ? "text-emerald-600" :
    score >= 4 ? "text-amber-500" : "text-red-500";
  return (
    <div className="text-right shrink-0">
      <p className={`text-xl font-bold ${color}`}>{score}/10</p>
      <p className="text-xs text-gray-400">Score</p>
    </div>
  );
}

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/get-interview", {
          withCredentials: true,
        });
        setInterviews(result.data);
        setFiltered(result.data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  useEffect(() => {
    let data = interviews;
    if (filterMode !== "All") data = data.filter((i) => i.mode === filterMode);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.role?.toLowerCase().includes(q) ||
          i.mode?.toLowerCase().includes(q) ||
          i.company?.toLowerCase().includes(q) ||
          i.topic?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [search, filterMode, interviews]);

  const modes = ["All", ...Object.keys(MODE_META)];

  const stats = {
    total: interviews.length,
    completed: interviews.filter((i) => i.status === "completed").length,
    avgScore:
      interviews.filter((i) => i.status === "completed").length > 0
        ? (
            interviews
              .filter((i) => i.status === "completed")
              .reduce((s, i) => s + (i.finalScore || 0), 0) /
            interviews.filter((i) => i.status === "completed").length
          ).toFixed(1)
        : 0,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Interview History</h1>
            <p className="text-gray-400 text-xs">All your past practice sessions</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats bar */}
        {!loading && interviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Sessions", value: stats.total, icon: BookOpen, color: "text-gray-700" },
              { label: "Completed", value: stats.completed, icon: Trophy, color: "text-emerald-600" },
              { label: "Avg Score", value: `${stats.avgScore}/10`, icon: Star, color: "text-amber-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <s.icon size={18} className={s.color} />
                <div>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter */}
        {!loading && interviews.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute top-3.5 left-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by role, mode, company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    filterMode === m
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm">Loading interviews…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {interviews.length === 0 ? "No interviews yet" : "No matches found"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {interviews.length === 0
                ? "Complete your first session to see it here."
                : "Try adjusting your search or filter."}
            </p>
            {interviews.length === 0 && (
              <button
                onClick={() => navigate("/interview")}
                className="mt-5 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Start Interview
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, index) => {
              const meta = MODE_META[item.mode] || { icon: Code2, color: "bg-gray-100 text-gray-600" };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Mode icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon size={18} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {item.role}
                          {item.company && (
                            <span className="text-gray-400 font-normal"> @ {item.company}</span>
                          )}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                          {item.mode}
                        </span>
                        {item.difficulty && item.difficulty !== "auto" && (
                          <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                            {item.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{item.experience}</span>
                        {item.questionCount && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400">{item.questionCount} questions</span>
                          </>
                        )}
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} />
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Score + status + arrow */}
                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === "completed" && <ScoreRing score={item.finalScore || 0} />}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status === "completed" ? "Done" : "Incomplete"}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-emerald-500 transition"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
