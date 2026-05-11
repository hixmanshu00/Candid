import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, Briefcase, User, ChevronDown, ChevronUp,
  Sparkles, FileText, Code2, Users, Brain, Trophy,
  Layers, Cpu, Building2, Zap, CheckCircle2, Clock,
  BarChart3, Target, BookOpen,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

const INTERVIEW_TYPES = [
  { value: "Technical", label: "Technical", icon: Code2, color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-950/60" },
  { value: "HR", label: "HR Round", icon: Users, color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-950/60" },
  { value: "Behavioral", label: "Behavioral", icon: Brain, color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/60" },
  { value: "System Design", label: "System Design", icon: Layers, color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-950/60" },
  { value: "DSA", label: "DSA", icon: Cpu, color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-950/60" },
  { value: "Leadership", label: "Leadership", icon: Trophy, color: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-950/60" },
];

const DIFFICULTIES = [
  { value: "auto", label: "Auto" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const POPULAR_TOPICS = [
  "React", "Node.js", "System Design", "JavaScript", "TypeScript",
  "Python", "DSA", "SQL", "AWS", "Docker",
];

const POPULAR_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"];

const calcCreditCost = (count) => 50 + Math.max(0, count - 5) * 5;

export default function Step1SetUp({ onStart }) {
  const { userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const [practiceMode, setPracticeMode] = useState("resume");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [company, setCompany] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("auto");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [topic, setTopic] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const creditCost = calcCreditCost(questionCount);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formData, { withCredentials: true });
      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
      toast.success("Resume analysed successfully!");
    } catch {
      toast.error("Failed to analyse resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const isValid = () => {
    if (!experience.trim()) return false;
    if (practiceMode === "topic") return topic.trim().length > 0;
    return role.trim().length > 0;
  };

  const handleStart = async () => {
    if (!isValid() || loading) return;
    setLoading(true);
    try {
      const effectiveRole = practiceMode === "topic" ? topic.trim() : role.trim();
      const payload = {
        role: effectiveRole,
        experience: experience.trim(),
        mode: interviewType,
        questionCount,
        timeLimitEnabled,
        difficulty,
        company: company.trim() || undefined,
        topic: practiceMode === "topic" ? topic.trim() : undefined,
        jobDescription: practiceMode === "jd" ? jobDescription.trim() : undefined,
        resumeText: practiceMode === "resume" ? resumeText : "",
        projects: practiceMode === "resume" ? projects : [],
        skills: practiceMode === "resume" ? skills : [],
      };
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions", payload, { withCredentials: true });
      if (userData) dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      onStart(result.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const switchPracticeMode = (mode) => {
    setPracticeMode(mode);
    setAnalysisDone(false);
    setResumeFile(null);
    setResumeText("");
    setProjects([]);
    setSkills([]);
    setRole("");
    setTopic("");
    setJobDescription("");
  };

  const inputCls = "w-full pl-9 pr-4 py-3 text-sm border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-slate-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500";
  const labelCls = "block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-2";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-start justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-teal-950/10 px-4 py-8"
    >
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 border border-slate-100 dark:border-zinc-800 grid md:grid-cols-5 overflow-hidden">

        {/* ── Left panel (gradient — looks great in both modes) ── */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 relative bg-linear-to-br from-teal-600 via-teal-700 to-emerald-800 p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles size={12} />
              AI-Powered Mock Interviews
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Configure Your<br />AI Interview
            </h2>
            <p className="text-teal-100 text-sm leading-relaxed mb-10">
              Realistic mock interviews with dynamic questions, voice AI, and detailed
              performance analytics.
            </p>
            <div className="space-y-3">
              {[
                { icon: Target, text: "Role & experience tailored questions" },
                { icon: Brain, text: "6 interview types including Behavioral & DSA" },
                { icon: BarChart3, text: "Detailed analytics with model answers" },
                { icon: Clock, text: "Optional timed pressure per question" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-teal-100 text-sm"
                >
                  <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-white" />
                  </div>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { value: "6", label: "Interview Types" },
              { value: "20", label: "Max Questions" },
              { value: "3", label: "Score Metrics" },
              { value: "∞", label: "Practice Sessions" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-teal-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20 pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-teal-400/20 rounded-full pointer-events-none" />
        </motion.div>

        {/* ── Right panel ── */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3 p-6 sm:p-8 overflow-y-auto max-h-screen md:max-h-[90vh]"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interview Setup</h2>
          <p className="text-slate-400 dark:text-zinc-500 text-sm mb-6">Configure your session and hit Start</p>

          {/* Practice Mode Tabs */}
          <div className="mb-6">
            <label className={labelCls}>Practice Mode</label>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
              {[
                { key: "resume", label: "Upload Resume", icon: Upload },
                { key: "topic", label: "By Skill / Topic", icon: BookOpen },
                { key: "jd", label: "Job Description", icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => switchPracticeMode(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    practiceMode === key
                      ? "bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Role + Experience */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {practiceMode !== "topic" ? (
              <div className="relative col-span-2 sm:col-span-1">
                <User size={15} className="absolute top-3.5 left-3.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Job Role (e.g. Frontend Dev)"
                  className={inputCls}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            ) : (
              <div className="relative col-span-2 sm:col-span-1">
                <Brain size={15} className="absolute top-3.5 left-3.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Skill / Topic (e.g. React, DSA)"
                  className={inputCls}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            )}
            <div className="relative col-span-2 sm:col-span-1">
              <Briefcase size={15} className="absolute top-3.5 left-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className={inputCls}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          {/* Popular topics chips */}
          {practiceMode === "topic" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {POPULAR_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    topic === t
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-teal-400 dark:hover:border-teal-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </motion.div>
          )}

          {/* Conditional content */}
          <AnimatePresence mode="wait">
            {practiceMode === "resume" && (
              <motion.div
                key="resume"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                {!analysisDone ? (
                  <div
                    onClick={() => document.getElementById("resumeUpload").click()}
                    className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition group"
                  >
                    <Upload size={28} className="mx-auto text-slate-300 dark:text-zinc-600 group-hover:text-teal-500 mb-2 transition" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {resumeFile ? (
                        <span className="text-teal-600 dark:text-teal-400 font-medium">{resumeFile.name}</span>
                      ) : (
                        <>Click to upload <span className="text-teal-600 dark:text-teal-400 font-medium">resume (PDF)</span> — optional</>
                      )}
                    </p>
                    <input
                      id="resumeUpload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    {resumeFile && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUploadResume(); }}
                        className="mt-3 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-zinc-200 transition"
                      >
                        {analyzing ? "Analysing…" : "Analyse Resume"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-sm">
                      <CheckCircle2 size={16} /> Resume Analysed
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 10).map((s, i) => (
                          <span key={i} className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                        {skills.length > 10 && (
                          <span className="text-teal-600 dark:text-teal-400 text-xs">+{skills.length - 10} more</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => { setAnalysisDone(false); setResumeFile(null); }}
                      className="text-xs text-slate-400 dark:text-zinc-500 hover:text-red-500 transition"
                    >
                      Remove & re-upload
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {practiceMode === "jd" && (
              <motion.div
                key="jd"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <textarea
                  placeholder="Paste the job description here… AI will generate questions tailored to this role."
                  rows={5}
                  className="w-full text-sm border border-slate-200 dark:border-zinc-700 rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-slate-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interview Type */}
          <div className="mb-4">
            <label className={labelCls}>Interview Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERVIEW_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setInterviewType(value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    interviewType === value
                      ? "ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400 shadow-sm"
                      : `${color} border`
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Company */}
          <div className="mb-4">
            <div className="relative">
              <Building2 size={15} className="absolute top-3.5 left-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Target Company (optional — e.g. Google, Amazon)"
                className={inputCls}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {POPULAR_COMPANIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompany(company === c ? "" : c)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    company === c
                      ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100"
                      : "bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-6 border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Zap size={14} className="text-teal-600 dark:text-teal-400" />
                Advanced Options
              </span>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-5 bg-white dark:bg-zinc-900">
                    {/* Question Count */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={labelCls}>Number of Questions</label>
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
                          {questionCount}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={20}
                        step={1}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full h-2 accent-teal-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-400 dark:text-zinc-500 mt-1">
                        <span>5 (Quick)</span>
                        <span>10 (Standard)</span>
                        <span>20 (Full)</span>
                      </div>
                    </div>

                    {/* Time Limit toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Time Limit Per Question</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">Easy: 60s · Medium: 90s · Hard: 120s</p>
                      </div>
                      <button
                        onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none ${
                          timeLimitEnabled ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                            timeLimitEnabled ? "left-6" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className={labelCls}>Difficulty</label>
                      <div className="flex gap-2">
                        {DIFFICULTIES.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setDifficulty(value)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              difficulty === value
                                ? "bg-teal-600 text-white border-teal-600"
                                : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-teal-400 dark:hover:border-teal-600"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Credit cost + Start */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-semibold text-slate-700 dark:text-zinc-200 text-sm">{creditCost}</span>{" "}
              credits · {userData?.credits || 0} remaining
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={!isValid() || loading || (userData?.credits || 0) < creditCost}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white disabled:text-slate-500 dark:disabled:text-zinc-500 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Start Interview
                </>
              )}
            </motion.button>
          </div>

          {userData && (userData.credits || 0) < creditCost && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Not enough credits.{" "}
              <a href="/pricing" className="underline font-medium">Buy more</a>
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
