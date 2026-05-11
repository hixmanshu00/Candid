import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get user: ${error.message}` });
  }
};

function calculateStreak(interviews) {
  if (!interviews.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = new Set(
    interviews.map((i) => {
      const d = new Date(i.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  let current = today.getTime();

  // If no interview today, look from yesterday
  if (!days.has(current)) current -= 86400000;

  while (days.has(current)) {
    streak++;
    current -= 86400000;
  }
  return streak;
}

export const getUserProgress = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId, status: "completed" })
      .sort({ createdAt: 1 })
      .select("role mode company topic finalScore createdAt questions");

    if (!interviews.length) {
      return res.json({
        totalInterviews: 0,
        avgScore: 0,
        bestScore: 0,
        improvement: 0,
        streak: 0,
        recentTrend: [],
        skillTrend: [],
        modeStats: [],
        weakAreas: [],
        strongAreas: [],
      });
    }

    const totalInterviews = interviews.length;
    const scores = interviews.map((i) => i.finalScore || 0);
    const avgScore = Number((scores.reduce((s, v) => s + v, 0) / totalInterviews).toFixed(1));
    const bestScore = Number(Math.max(...scores).toFixed(1));
    const improvement =
      totalInterviews >= 2
        ? Number((scores[scores.length - 1] - scores[0]).toFixed(1))
        : 0;

    const recentTrend = interviews.slice(-15).map((i, idx) => ({
      label: `#${interviews.indexOf(i) + 1}`,
      date: i.createdAt,
      score: Number((i.finalScore || 0).toFixed(1)),
      role: i.role,
      mode: i.mode,
    }));

    const skillTrend = interviews.slice(-15).map((i, idx) => {
      const count = i.questions.length || 1;
      const sumConf = i.questions.reduce((s, q) => s + (q.confidence || 0), 0);
      const sumComm = i.questions.reduce((s, q) => s + (q.communication || 0), 0);
      const sumCorr = i.questions.reduce((s, q) => s + (q.correctness || 0), 0);
      return {
        label: `#${interviews.indexOf(i) + 1}`,
        confidence: Number((sumConf / count).toFixed(1)),
        communication: Number((sumComm / count).toFixed(1)),
        correctness: Number((sumCorr / count).toFixed(1)),
      };
    });

    const modeMap = {};
    interviews.forEach((i) => {
      if (!modeMap[i.mode]) modeMap[i.mode] = { count: 0, total: 0 };
      modeMap[i.mode].count++;
      modeMap[i.mode].total += i.finalScore || 0;
    });
    const modeStats = Object.entries(modeMap)
      .map(([mode, d]) => ({
        mode,
        count: d.count,
        avgScore: Number((d.total / d.count).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);

    const streak = calculateStreak(interviews);
    const weakAreas = modeStats.filter((m) => m.avgScore < avgScore).map((m) => m.mode);
    const strongAreas = modeStats.filter((m) => m.avgScore >= avgScore).map((m) => m.mode);

    return res.json({
      totalInterviews,
      avgScore,
      bestScore,
      improvement,
      streak,
      recentTrend,
      skillTrend,
      modeStats,
      weakAreas,
      strongAreas,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to get progress: ${error.message}` });
  }
};
