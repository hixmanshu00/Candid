import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Brain, Building2, Settings2, BarChart3,
  Share2, FileText, Code2, Users, MessageSquare, Layers, Trophy,
  CheckCircle2, Zap, Star,
} from "lucide-react";
import { BsRobot } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModel from "../components/AuthModel";

const INTERVIEW_TYPES = [
  { label: "Technical", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
  { label: "HR", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" },
  { label: "Behavioral", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  { label: "System Design", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
  { label: "DSA", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  { label: "Leadership", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" },
];

const COMPANIES = ["Amazon", "Google", "Microsoft", "Meta", "Apple"];

const FEATURES = [
  {
    icon: Brain,
    title: "6 Interview Types",
    desc: "Technical, HR, Behavioral, System Design, DSA, and Leadership — all in one platform.",
    accent: "teal",
    wide: true,
    content: (
      <div className="flex flex-wrap gap-2 mt-4">
        {INTERVIEW_TYPES.map((t) => (
          <span key={t.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${t.color}`}>
            {t.label}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    title: "AI Model Answers",
    desc: "Every question comes with an expert model answer to learn from.",
    accent: "emerald",
    wide: false,
    content: (
      <div className="mt-4 bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed border border-slate-200 dark:border-zinc-700">
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Model Answer: </span>
        "Start by clarifying requirements, then discuss trade-offs between consistency and availability..."
      </div>
    ),
  },
  {
    icon: Building2,
    title: "Company-Specific Mode",
    desc: "Target your prep for top-tier companies with tailored question patterns.",
    accent: "blue",
    wide: false,
    content: (
      <div className="flex flex-wrap gap-2 mt-4">
        {COMPANIES.map((c) => (
          <span key={c} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            {c}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Track your scores, skill trends, streaks, and weak areas over time.",
    accent: "teal",
    wide: true,
    content: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[["87%", "Avg Score"], ["12", "Streak Days"], ["↑ 23%", "Improvement"]].map(([v, l]) => (
          <div key={l} className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-3 text-center border border-teal-100 dark:border-teal-900/30">
            <p className="text-base font-bold text-teal-700 dark:text-teal-300">{v}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Settings2,
    title: "Configurable Sessions",
    desc: "Set question count (5–20), optional timer, and difficulty level your way.",
    accent: "amber",
    wide: false,
    content: (
      <div className="mt-4 space-y-2">
        {[["Questions", "15"], ["Difficulty", "Medium"], ["Timer", "Off"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">{k}</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Share2,
    title: "Shareable Reports",
    desc: "Generate a public link for your interview report — great for portfolios.",
    accent: "rose",
    wide: false,
    content: (
      <div className="mt-4 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl px-3 py-2.5">
        <Share2 size={13} className="text-rose-500 shrink-0" />
        <span className="text-xs text-rose-600 dark:text-rose-400 font-mono truncate">
          candid.ai/shared/a3f9c...
        </span>
      </div>
    ),
  },
];

const STEPS = [
  {
    num: "01",
    icon: Layers,
    title: "Choose Your Mode",
    desc: "Upload a resume, paste a job description, or pick a skill/topic to practice.",
  },
  {
    num: "02",
    icon: Settings2,
    title: "Configure Your Session",
    desc: "Select interview type, difficulty, company focus, and how many questions.",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Answer with AI",
    desc: "Work through AI-generated questions with optional time pressure.",
  },
  {
    num: "04",
    icon: Trophy,
    title: "Review & Improve",
    desc: "Get AI feedback, compare with model answers, and track your progress.",
  },
];

const ACCENT_CLASSES = {
  teal: {
    icon: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
    border: "border-teal-200/60 dark:border-teal-800/30",
    glow: "hover:border-teal-300 dark:hover:border-teal-700",
  },
  emerald: {
    icon: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/60 dark:border-emerald-800/30",
    glow: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  blue: {
    icon: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    border: "border-blue-200/60 dark:border-blue-800/30",
    glow: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  amber: {
    icon: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    border: "border-amber-200/60 dark:border-amber-800/30",
    glow: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  rose: {
    icon: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    border: "border-rose-200/60 dark:border-rose-800/30",
    glow: "hover:border-rose-300 dark:hover:border-rose-700",
  },
};

function MockInterviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-teal-500/20 dark:bg-teal-500/10 blur-3xl rounded-3xl" />

      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-teal-500/10 dark:shadow-teal-500/5 overflow-hidden">
        {/* Card header */}
        <div className="bg-linear-to-r from-teal-600 to-teal-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <BsRobot size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Technical Interview</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Q 3 / 10</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wide">Question</p>
          <p className="text-sm text-slate-800 dark:text-zinc-100 leading-relaxed font-medium">
            Explain the difference between TCP and UDP, and when would you use each?
          </p>
        </div>

        {/* Answer area */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mb-2 uppercase tracking-wide">Your Answer</p>
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed min-h-16 border border-slate-200 dark:border-zinc-700">
            TCP is connection-oriented and guarantees delivery, while UDP is connectionless and faster...
            <span className="inline-block w-0.5 h-3 bg-teal-500 ml-0.5 animate-pulse align-middle" />
          </div>

          <div className="flex items-center gap-2 mt-3">
            {[["Correctness", "88%"], ["Clarity", "91%"]].map(([k, v]) => (
              <div key={k} className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 text-center">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{v}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{k}</p>
              </div>
            ))}
            <div className="flex-1 bg-teal-50 dark:bg-teal-950/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Next</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Continue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <Star size={13} className="text-amber-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">AI Feedback</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <CheckCircle2 size={13} className="text-emerald-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Model Answer</span>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { userData } = useSelector((s) => s.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleCTA = (path) => {
    if (!userData) { setShowAuth(true); return; }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="flex-1 px-6 pt-20 pb-24 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-semibold px-4 py-2 rounded-full border border-teal-200 dark:border-teal-800/50 mb-6"
            >
              <Sparkles size={13} />
              AI-Powered Interview Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight"
            >
              Ace Your Next<br />
              <span className="text-teal-600 dark:text-teal-400">Interview</span>{" "}
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-slate-500 dark:text-zinc-400 text-lg leading-relaxed max-w-lg"
            >
              Practice 6 interview types, get AI feedback, compare with model answers,
              and track your improvement — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <button
                onClick={() => handleCTA("/interview")}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 transition text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-teal-500/25"
              >
                Start Practicing
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handleCTA("/history")}
                className="flex items-center gap-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 px-7 py-3.5 rounded-full font-semibold text-sm"
              >
                View History
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 mt-10"
            >
              {[
                ["10K+", "Interviews Done"],
                ["6", "Interview Types"],
                ["5 FAANG", "Companies"],
              ].map(([val, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{val}</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">{label}</span>
                  <span className="text-slate-200 dark:text-zinc-700 text-lg last:hidden">·</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — mock card */}
          <div className="flex justify-center lg:justify-end">
            <MockInterviewCard />
          </div>
        </div>
      </section>

      {/* ── Features Bento ── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need to{" "}
              <span className="text-teal-600 dark:text-teal-400">prepare</span>
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 mt-3 max-w-xl mx-auto">
              A complete interview prep toolkit — from questions to feedback to analytics.
            </p>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const { icon: Icon, title, desc, accent, wide, content } = feature;
              const ac = ACCENT_CLASSES[accent];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  className={`
                    bg-white dark:bg-zinc-900 rounded-2xl border ${ac.border} ${ac.glow}
                    p-6 transition-all duration-200 shadow-sm hover:shadow-md
                    ${wide ? "md:col-span-2" : "md:col-span-1"}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-4 ${ac.icon}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 leading-relaxed">{desc}</p>
                  {content}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              How it{" "}
              <span className="text-emerald-500">works</span>
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 mt-3">
              From setup to feedback in four simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-5xl font-black text-slate-100 dark:text-zinc-800 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mt-3 mb-3">
                  <step.icon size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 -right-3 z-10">
                    <ArrowRight size={16} className="text-slate-300 dark:text-zinc-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-linear-to-br from-teal-600 to-teal-800 dark:from-teal-700 dark:to-teal-900 rounded-3xl px-8 py-14 text-center"
          >
            {/* decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full mb-5">
                <Zap size={13} />
                Free to start — no credit card needed
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to ace your next interview?
              </h2>
              <p className="text-teal-200 max-w-md mx-auto mb-8">
                Join thousands of candidates who use Candid.ai to prepare smarter and land offers faster.
              </p>
              <button
                onClick={() => handleCTA("/interview")}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 transition text-teal-700 px-8 py-3.5 rounded-full font-bold text-sm shadow-lg active:scale-95"
              >
                Start Practicing Free
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  );
}
