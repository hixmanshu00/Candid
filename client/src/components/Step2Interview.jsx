import React, { useState, useRef, useEffect, useCallback } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, ArrowRight, Infinity, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { ServerUrl } from "../App";
import toast from "react-hot-toast";

const DEEPGRAM_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
const TTS_MODEL = "aura-asteria-en";

export default function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, timeLimitEnabled } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [deepgramReady, setDeepgramReady] = useState(false);
  const [showAvatarMobile, setShowAvatarMobile] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const dgMicRef = useRef(null); // { stop: () => void }
  const introRanRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const progressPct = (currentIndex / questions.length) * 100;
  const hasDeepgramKey = Boolean(DEEPGRAM_KEY);

  // ── Deepgram TTS ──────────────────────────────────────────────────────────
  const speakText = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!hasDeepgramKey) { resolve(); return; }

        stopMicStream();
        setIsAIPlaying(true);
        setSubtitle(text);
        videoRef.current?.play();

        fetch(`https://api.deepgram.com/v1/speak?model=${TTS_MODEL}`, {
          method: "POST",
          headers: {
            Authorization: `Token ${DEEPGRAM_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })
          .then((r) => r.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => {
              URL.revokeObjectURL(url);
              audioRef.current = null;
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
              setIsAIPlaying(false);
              setSubtitle("");
              resolve();
            };
            audio.onerror = () => { resolve(); };
            audio.play().catch(() => resolve());
          })
          .catch(() => {
            setIsAIPlaying(false);
            setSubtitle("");
            resolve();
          });
      }),
    [hasDeepgramKey]
  );

  // ── Deepgram STT (WebSocket + MediaRecorder) ─────────────────────────────
  const startMicStream = useCallback(async () => {
    if (!hasDeepgramKey || dgMicRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg;codecs=opus";

      const ws = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true",
        ["token", DEEPGRAM_KEY]
      );

      const recorder = new MediaRecorder(stream, { mimeType });

      ws.onopen = () => {
        setDeepgramReady(true);
        recorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        });
        recorder.start(250);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          const t = data.channel?.alternatives?.[0]?.transcript;
          if (t && data.is_final && t.trim()) {
            setAnswer((prev) => (prev + " " + t).trim());
          }
        } catch {}
      };

      ws.onerror = () => setDeepgramReady(false);
      ws.onclose = () => setDeepgramReady(false);

      dgMicRef.current = {
        stop: () => {
          if (recorder.state !== "inactive") recorder.stop();
          stream.getTracks().forEach((t) => t.stop());
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
          dgMicRef.current = null;
          setDeepgramReady(false);
        },
      };
    } catch {
      toast.error("Microphone access denied.");
    }
  }, [hasDeepgramKey]);

  const stopMicStream = useCallback(() => {
    dgMicRef.current?.stop();
  }, []);

  // ── Run intro then ask questions ──────────────────────────────────────────
  useEffect(() => {
    if (introRanRef.current) return;
    introRanRef.current = true;

    const run = async () => {
      await speakText(`Hi ${userName}, great to meet you! I hope you're feeling confident and ready.`);
      await speakText("I'll ask you a few questions. Answer naturally and take your time. Let's begin.");
      setIsIntroPhase(false);
    };
    run();
  }, [speakText, userName]);

  // Ask question when index changes (after intro)
  useEffect(() => {
    if (isIntroPhase) return;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 600));
      if (currentIndex === questions.length - 1) {
        await speakText("Alright, this is the last one — it may be a bit more challenging.");
      }
      await speakText(currentQuestion.question);
      if (isMicOn) startMicStream();
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntroPhase, currentIndex]);

  // Timer
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || !timeLimitEnabled) return;
    const timer = setInterval(() => {
      setTimeLeft((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, timeLimitEnabled]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  // Auto-submit on timeout
  useEffect(() => {
    if (!isIntroPhase && currentQuestion && timeLimitEnabled && timeLeft === 0 && !isSubmitting && !feedback) {
      handleSubmitAnswer();
    }
  }, [timeLeft]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMicStream();
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current = null;
    };
  }, []);

  const toggleMic = () => {
    if (isMicOn) {
      stopMicStream();
    } else {
      startMicStream();
    }
    setIsMicOn((v) => !v);
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;
    stopMicStream();
    setIsSubmitting(true);
    try {
      const timeTaken = timeLimitEnabled ? (currentQuestion.timeLimit || 60) - timeLeft : 0;
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        { interviewId, questionIndex: currentIndex, answer, timeTaken },
        { withCredentials: true }
      );
      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
    } catch {
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      await handleFinish();
      return;
    }
    await speakText("Let's move to the next question.");
    setCurrentIndex((i) => i + 1);
  };

  const handleFinish = async () => {
    stopMicStream();
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      onFinish(result.data);
    } catch {
      toast.error("Failed to finish interview. Please refresh.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-teal-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-teal-950/10 flex items-start justify-center p-3 sm:p-6">
      {/* No Deepgram key warning */}
      {!hasDeepgramKey && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-medium px-4 py-2.5 rounded-full shadow-md">
          <AlertCircle size={13} />
          Add VITE_DEEPGRAM_API_KEY to .env for voice features
        </div>
      )}

      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 border border-slate-100 dark:border-zinc-800 overflow-hidden">

        {/* Mobile progress bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              Q {currentIndex + 1} / {questions.length}
            </span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-zinc-700 rounded-full">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeLimitEnabled ? (
              <span className={`text-xs font-bold tabular-nums ${timeLeft < 15 ? "text-red-500" : "text-slate-600 dark:text-zinc-300"}`}>
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            ) : (
              <Infinity size={14} className="text-teal-500" />
            )}
            <button
              onClick={() => setShowAvatarMobile((v) => !v)}
              className="text-xs font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1"
            >
              Avatar {showAvatarMobile ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* ── Left: AI avatar ── */}
          <AnimatePresence>
            {(showAvatarMobile || true) && (
              <div className={`${showAvatarMobile ? "block" : "hidden"} lg:block w-full lg:w-[36%] bg-slate-50 dark:bg-zinc-950/50 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-zinc-800 flex flex-col items-center p-4 sm:p-6 gap-4`}>
                <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-black max-h-48 lg:max-h-none">
                  <video
                    src={femaleVideo}
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {subtitle && (
                  <div className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 shadow-sm">
                    <p className="text-slate-600 dark:text-zinc-300 text-xs text-center leading-relaxed italic">
                      "{subtitle}"
                    </p>
                  </div>
                )}

                <div className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-zinc-500 font-medium">Status</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                      isAIPlaying
                        ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                        : "bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400"
                    }`}>
                      {isAIPlaying ? "AI Speaking…" : "Your Turn"}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-zinc-700" />

                  {/* Timer — desktop only here */}
                  <div className="hidden lg:flex justify-center">
                    {timeLimitEnabled ? (
                      <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                          <Infinity size={22} className="text-teal-500" />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-zinc-500">No Limit</span>
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:block h-px bg-slate-100 dark:bg-zinc-700" />

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{currentIndex + 1}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Current</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-700 dark:text-zinc-200">{questions.length}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Total</p>
                    </div>
                  </div>

                  {/* Progress bar — desktop */}
                  <div className="hidden lg:block bg-slate-100 dark:bg-zinc-700 rounded-full h-1.5">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {hasDeepgramKey && (
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${deepgramReady ? "bg-teal-500 animate-pulse" : "bg-slate-300 dark:bg-zinc-600"}`} />
                      <span className="text-slate-400 dark:text-zinc-500">
                        {deepgramReady ? "Deepgram listening" : "Deepgram standby"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* ── Right: Question + answer ── */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">
                AI Smart Interview
              </h2>
              {currentQuestion?.difficulty && (
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : currentQuestion.difficulty === "medium"
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>

            {isIntroPhase ? (
              <div className="flex-1 flex items-center justify-center min-h-48">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/40 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm">AI is preparing your interview…</p>
                </div>
              </div>
            ) : (
              <>
                {currentQuestion && (
                  <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mb-1.5 font-medium">
                      Question {currentIndex + 1} of {questions.length}
                    </p>
                    <p className="text-slate-800 dark:text-zinc-100 font-semibold leading-relaxed text-sm sm:text-base">
                      {currentQuestion.question}
                    </p>
                  </div>
                )}

                <textarea
                  placeholder={hasDeepgramKey ? "Speak or type your answer here…" : "Type your answer here…"}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1 min-h-32 sm:min-h-40 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 resize-none outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800 dark:text-zinc-100 text-sm transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />

                {!feedback ? (
                  <div className="flex items-center gap-3 mt-4">
                    {hasDeepgramKey && (
                      <motion.button
                        onClick={toggleMic}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full shadow-md transition-all ${
                          isMicOn
                            ? "bg-teal-600 text-white shadow-teal-500/30"
                            : "bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                      </motion.button>
                    )}

                    <motion.button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Evaluating…
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-2xl p-4 sm:p-5"
                  >
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">AI Feedback</p>
                    <p className="text-teal-800 dark:text-teal-200 text-sm font-medium mb-4 leading-relaxed">
                      {feedback}
                    </p>
                    <button
                      onClick={handleNext}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition"
                    >
                      {currentIndex + 1 >= questions.length ? "See Report" : "Next Question"}
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
