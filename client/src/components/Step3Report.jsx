import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft, Download, Share2, ChevronDown, ChevronUp,
  MessageSquare, Lightbulb, User, Trophy, Zap, Target,
} from "lucide-react";
import { ServerUrl } from "../App";
import { useTheme } from "../context/ThemeContext";

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  hard: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400",
};

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="text-slate-600 dark:text-zinc-300 font-medium">{label}</span>
        <span className="font-bold text-teal-600 dark:text-teal-400">{value}/10</span>
      </div>
      <div className="bg-slate-100 dark:bg-zinc-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-linear-to-r from-teal-500 to-emerald-400 h-full rounded-full"
        />
      </div>
    </div>
  );
}

function QuestionCard({ q, index }) {
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showUserAnswer, setShowUserAnswer] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Q{index + 1}</span>
            {q.difficulty && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty] || "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"}`}>
                {q.difficulty}
              </span>
            )}
          </div>
          <p className="text-slate-800 dark:text-zinc-100 font-semibold text-sm leading-relaxed">
            {q.question || "Question not available"}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold ${
            q.score >= 7
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              : q.score >= 4
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
          }`}>
            {q.score ?? 0}
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">/ 10</p>
        </div>
      </div>

      {/* AI Feedback */}
      {q.feedback && q.feedback.trim() && (
        <div className="mx-5 mb-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30 rounded-xl p-3">
          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-1 flex items-center gap-1.5">
            <MessageSquare size={12} /> AI Feedback
          </p>
          <p className="text-teal-800 dark:text-teal-200 text-sm leading-relaxed">{q.feedback}</p>
        </div>
      )}

      {/* Per-question skill bars */}
      <div className="mx-5 mb-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Confidence", value: q.confidence || 0 },
          { label: "Communication", value: q.communication || 0 },
          { label: "Correctness", value: q.correctness || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 dark:bg-zinc-800 rounded-xl py-2">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{s.value}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Your Answer */}
      {q.answer && q.answer.trim() && (
        <div className="mx-5 mb-3">
          <button
            onClick={() => setShowUserAnswer(!showUserAnswer)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition py-2 px-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700"
          >
            <span className="flex items-center gap-1.5"><User size={12} /> Your Answer</span>
            {showUserAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {showUserAnswer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-b-xl px-4 py-3 -mt-1">
                  <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed italic">"{q.answer}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Model Answer */}
      {q.modelAnswer && q.modelAnswer.trim() && (
        <div className="mx-5 mb-5">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition py-2 px-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/30"
          >
            <span className="flex items-center gap-1.5"><Lightbulb size={12} /> See Model Answer</span>
            {showModelAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {showModelAnswer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30 rounded-b-xl px-4 py-3 -mt-1">
                  <p className="text-teal-900 dark:text-teal-200 text-sm leading-relaxed">{q.modelAnswer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function Step3Report({ report, isSharedView = false }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sharing, setSharing] = useState(false);

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-zinc-500">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-zinc-700 border-t-teal-500 rounded-full animate-spin" />
          <p>Loading report…</p>
        </div>
      </div>
    );
  }

  const {
    interviewId,
    role = "",
    mode = "",
    company = "",
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
    shareToken: existingToken = null,
  } = report;

  const chartData = questionWiseScore.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score || 0,
    confidence: q.confidence || 0,
    communication: q.communication || 0,
  }));

  let performanceLabel = "";
  let performanceColor = "";
  if (finalScore >= 8) { performanceLabel = "Excellent"; performanceColor = "text-emerald-600 dark:text-emerald-400"; }
  else if (finalScore >= 5) { performanceLabel = "Good"; performanceColor = "text-amber-600 dark:text-amber-400"; }
  else { performanceLabel = "Needs Work"; performanceColor = "text-red-500 dark:text-red-400"; }

  const handleShare = async () => {
    if (!interviewId) return;
    setSharing(true);
    try {
      let token = existingToken;
      if (!token) {
        const res = await axios.post(`${ServerUrl}/api/interview/${interviewId}/share`, {}, { withCredentials: true });
        token = res.data.shareToken;
      }
      await navigator.clipboard.writeText(`${window.location.origin}/shared/${token}`);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to generate share link.");
    } finally {
      setSharing(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const cw = pageWidth - margin * 2;
    let y = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(13, 148, 136);
    doc.text("AI Interview Performance Report", pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.setDrawColor(13, 148, 136);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;

    if (role || mode) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Role: ${role}  |  Type: ${mode}${company ? `  |  Company: ${company}` : ""}`, margin, y);
      y += 10;
    }

    doc.setFillColor(240, 253, 250);
    doc.roundedRect(margin, y, cw, 18, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(`Final Score: ${finalScore}/10  —  ${performanceLabel}`, pageWidth / 2, y + 11, { align: "center" });
    y += 26;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, cw, 28, 4, 4, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Confidence: ${confidence}/10`, margin + 8, y + 9);
    doc.text(`Communication: ${communication}/10`, margin + 8, y + 17);
    doc.text(`Correctness: ${correctness}/10`, margin + 8, y + 25);
    y += 38;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Your Answer", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question || "",
        `${q.score ?? 0}/10`,
        q.answer ? q.answer.slice(0, 120) + (q.answer.length > 120 ? "…" : "") : "—",
        q.feedback || "",
      ]),
      styles: { fontSize: 8, cellPadding: 4, valign: "top" },
      headStyles: { fillColor: [13, 148, 136], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 50 },
        4: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save("Candid_Report.pdf");
  };

  const tooltipStyle = {
    borderRadius: "12px",
    border: isDark ? "1px solid #3f3f46" : "1px solid #e2e8f0",
    background: isDark ? "#18181b" : "#fff",
    color: isDark ? "#f4f4f5" : "#1e293b",
    fontSize: 12,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50/20 dark:from-zinc-950 dark:to-teal-950/10 px-4 sm:px-6 lg:px-10 py-8">

      {/* Shared view banner */}
      {isSharedView && (
        <div className="max-w-6xl mx-auto mb-6 bg-teal-600 text-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Shared Interview Report</p>
            <p className="text-teal-200 text-sm">This report was shared publicly.</p>
          </div>
          <a href="/" className="bg-white text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-50 transition shrink-0">
            Practice on Candid.ai →
          </a>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {!isSharedView && (
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 p-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-md transition"
            >
              <ArrowLeft size={18} className="text-slate-600 dark:text-zinc-300" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Interview Analytics</h1>
            <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
              {role && <span className="font-medium text-slate-600 dark:text-zinc-300">{role}</span>}
              {mode && <span> · {mode}</span>}
              {company && <span> · {company}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isSharedView && interviewId && (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition shadow-sm"
            >
              <Share2 size={15} />
              {sharing ? "Copying…" : "Share"}
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-teal-500/20"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="space-y-6">
          {/* Overall score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 text-center"
          >
            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-4">Overall Score</p>
            <div className="w-28 h-28 mx-auto mb-4">
              <CircularProgressbar
                value={(finalScore / 10) * 100}
                text={`${finalScore}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: finalScore >= 7 ? "#14b8a6" : finalScore >= 4 ? "#f59e0b" : "#ef4444",
                  textColor: isDark ? "#f4f4f5" : "#111827",
                  trailColor: isDark ? "#3f3f46" : "#f3f4f6",
                })}
              />
            </div>
            <p className={`text-lg font-bold ${performanceColor}`}>{performanceLabel}</p>
            <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">{questionWiseScore.length} questions evaluated</p>
          </motion.div>

          {/* Skill evaluation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6"
          >
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-5 flex items-center gap-2">
              <Target size={15} className="text-teal-600 dark:text-teal-400" /> Skill Evaluation
            </p>
            <div className="space-y-4">
              <ScoreBar label="Confidence" value={confidence} />
              <ScoreBar label="Communication" value={communication} />
              <ScoreBar label="Correctness" value={correctness} />
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6"
          >
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <Zap size={15} className="text-amber-500" /> Summary
            </p>
            <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed">
              {finalScore >= 8
                ? "Outstanding performance. Maintain confidence and keep refining with specific real-world examples."
                : finalScore >= 5
                ? "Good foundation. Focus on structuring answers more clearly and adding specific technical depth."
                : "Significant improvement needed. Practice structured thinking, clarity, and confident delivery."}
            </p>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6"
          >
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-5 flex items-center gap-2">
              <Trophy size={15} className="text-teal-600 dark:text-teal-400" /> Performance Trend
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3f3f46" : "#f1f5f9"} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#64748b" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" name="Score" stroke="#14b8a6" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{ r: 4, fill: "#14b8a6" }} />
                  <Area type="monotone" dataKey="confidence" name="Confidence" stroke="#6366f1" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  <Area type="monotone" dataKey="communication" name="Communication" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Question breakdown */}
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <MessageSquare size={15} className="text-teal-600 dark:text-teal-400" />
              Question Breakdown
            </p>
            <div className="space-y-3">
              {questionWiseScore.map((q, i) => (
                <QuestionCard key={i} q={q} index={i} isSharedView={isSharedView} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
