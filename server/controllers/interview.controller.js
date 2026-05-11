import fs from "fs";
import crypto from "crypto";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

/* ─────────────────── helpers ─────────────────── */

const parseJsonFromAiResponse = (aiResponse) => {
  if (!aiResponse || typeof aiResponse !== "string") {
    throw new Error("AI returned invalid response.");
  }
  let cleaned = aiResponse
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try { return JSON.parse(objectMatch[0]); } catch {}
    }
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]); } catch {}
    }
    throw new Error("AI returned non-JSON response.");
  }
};

const getDifficultyDistribution = (count, difficulty) => {
  if (difficulty !== "auto") return Array(count).fill(difficulty);
  const easyCount = Math.max(1, Math.floor(count * 0.3));
  const hardCount = Math.max(1, Math.floor(count * 0.3));
  const mediumCount = Math.max(0, count - easyCount - hardCount);
  return [
    ...Array(easyCount).fill("easy"),
    ...Array(mediumCount).fill("medium"),
    ...Array(hardCount).fill("hard"),
  ];
};

const getTimeLimit = (difficulty, timeLimitEnabled) => {
  if (!timeLimitEnabled) return 0;
  return { easy: 60, medium: 90, hard: 120 }[difficulty] || 60;
};

const calculateCreditCost = (questionCount) =>
  50 + Math.max(0, questionCount - 5) * 5;

const getInterviewTypeInstructions = (mode) => {
  const instructions = {
    Technical:
      "Ask deep technical questions testing architecture, coding patterns, debugging, system internals, and technical problem-solving. Reveal actual depth of expertise.",
    HR:
      "Ask behavioral and soft-skill questions: motivation, strengths/weaknesses, teamwork, communication, career goals, and cultural fit. Questions should reveal personality and values.",
    Behavioral:
      "Use STAR-format prompts: 'Tell me about a time when...', 'Describe a situation where...', 'How did you handle...'. Focus on past experiences that demonstrate key competencies.",
    "System Design":
      "Ask about designing large-scale distributed systems: architecture decisions, trade-offs, scalability, database design, caching, load balancing, reliability, and microservices. Keep questions open-ended.",
    DSA:
      "Ask about data structures, algorithms, time/space complexity, problem-solving approach, optimization techniques, and implementation fundamentals. Ask candidates to explain their thinking process.",
    Leadership:
      "Ask about team management, conflict resolution, mentoring junior engineers, making decisions under uncertainty, prioritizing roadmap, and driving technical initiatives from start to finish.",
  };
  return instructions[mode] || instructions.Technical;
};

const getCompanyGuidance = (company) => {
  const lower = company.toLowerCase();
  if (lower.includes("amazon"))
    return " Amazon interviews focus heavily on Leadership Principles (Customer Obsession, Ownership, Bias for Action, Deliver Results). Include scenarios that test these principles.";
  if (lower.includes("google"))
    return " Google interviews emphasize problem-solving clarity, system scalability, Googleyness (collaboration, ambiguity handling), and strong communication.";
  if (lower.includes("microsoft"))
    return " Microsoft values growth mindset, collaboration, passion for technology, and technical depth with empathy for users.";
  if (lower.includes("meta") || lower.includes("facebook"))
    return " Meta focuses on measurable impact, moving fast, technical excellence, and data-driven decision-making.";
  if (lower.includes("apple"))
    return " Apple emphasizes attention to detail, user experience thinking, technical precision, and commitment to quality standards.";
  return ` Tailor questions to reflect ${company}'s engineering culture and expectations.`;
};

const computeAvgScores = (questions) => {
  const count = questions.length || 1;
  return {
    avgConfidence: Number(
      (questions.reduce((s, q) => s + (q.confidence || 0), 0) / count).toFixed(1)
    ),
    avgCommunication: Number(
      (questions.reduce((s, q) => s + (q.communication || 0), 0) / count).toFixed(1)
    ),
    avgCorrectness: Number(
      (questions.reduce((s, q) => s + (q.correctness || 0), 0) / count).toFixed(1)
    ),
    avgFinalScore: Number(
      (questions.reduce((s, q) => s + (q.score || 0), 0) / count).toFixed(1)
    ),
  };
};

/* ─────────────────── controllers ─────────────────── */

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Resume file required." });

    const fileBuffer = await fs.promises.readFile(req.file.path);
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;

    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      resumeText += content.items.map((item) => item.str).join(" ") + "\n";
    }
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `Extract structured data from resume. Return ONLY valid JSON:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1"],
  "skills": ["skill1"]
}`,
      },
      { role: "user", content: resumeText },
    ];

    const aiResponse = await askAi(messages);
    const parsed = parseJsonFromAiResponse(aiResponse);

    fs.unlink(req.file.path, () => {});

    return res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      resumeText,
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ message: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let {
      role,
      experience,
      mode,
      resumeText,
      projects,
      skills,
      questionCount = 5,
      timeLimitEnabled = true,
      difficulty = "auto",
      company,
      jobDescription,
      topic,
    } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    questionCount = Math.min(20, Math.max(5, parseInt(questionCount) || 5));

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const creditCost = calculateCreditCost(questionCount);
    if (user.credits < creditCost) {
      return res.status(400).json({
        message: `Not enough credits. Need ${creditCost}, you have ${user.credits}.`,
      });
    }

    const difficulties = getDifficultyDistribution(questionCount, difficulty);

    const contextParts = [];
    if (jobDescription?.trim())
      contextParts.push(`Job Description:\n${jobDescription.trim().slice(0, 1200)}`);
    if (resumeText?.trim() && resumeText !== "None")
      contextParts.push(`Candidate Resume:\n${resumeText.trim().slice(0, 700)}`);
    if (Array.isArray(skills) && skills.length)
      contextParts.push(`Candidate Skills: ${skills.slice(0, 20).join(", ")}`);
    if (Array.isArray(projects) && projects.length)
      contextParts.push(`Candidate Projects: ${projects.slice(0, 10).join(", ")}`);
    if (topic?.trim()) contextParts.push(`Focus Topic: ${topic.trim()}`);

    const companyNote = company?.trim()
      ? `Target Company: ${company}.${getCompanyGuidance(company)}`
      : "";

    const messages = [
      {
        role: "system",
        content: `You are an expert interviewer at a top technology company.
Generate exactly ${questionCount} interview questions WITH model answers.

Candidate: ${role}, ${experience} experience.
Interview Type: ${mode}.
${companyNote}

Style: ${getInterviewTypeInstructions(mode)}

${contextParts.length ? `Context:\n${contextParts.join("\n\n")}` : ""}

Difficulty per question:
${difficulties.map((d, i) => `Q${i + 1}: ${d}`).join("\n")}

Return ONLY valid JSON (no other text, no markdown fences):
{
  "questions": [
    {
      "question": "Single conversational sentence, 15-30 words, no numbering",
      "modelAnswer": "Ideal answer 80-150 words. Structured, specific, professional. Behavioral: context→action→result. Technical: concept + example + best practice."
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Generate ${questionCount} ${mode} interview questions for a ${experience} ${role}.`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = parseJsonFromAiResponse(aiResponse);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(500).json({ message: "AI returned invalid question format." });
    }

    const questionsArray = parsed.questions.slice(0, questionCount);

    user.credits -= creditCost;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: resumeText?.trim() || "",
      questionCount,
      timeLimitEnabled,
      difficulty,
      company: company?.trim() || "",
      jobDescription: jobDescription?.trim() || "",
      topic: topic?.trim() || "",
      questions: questionsArray.map((q, index) => ({
        question: q.question || "",
        modelAnswer: q.modelAnswer || "",
        difficulty: difficulties[index],
        timeLimit: getTimeLimit(difficulties[index], timeLimitEnabled),
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      creditCost,
      userName: user.name,
      timeLimitEnabled,
      questions: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to create interview: ${error.message}` });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found." });

    const question = interview.questions[questionIndex];
    if (!question) return res.status(404).json({ message: "Question not found." });

    if (!answer?.trim()) {
      question.score = 0;
      question.feedback = "No answer submitted for this question.";
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (interview.timeLimitEnabled && timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer was not evaluated.";
      question.answer = answer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `You are a professional interviewer evaluating a candidate's answer.

Evaluate on three dimensions (0–10 each):
1. Confidence – clarity, conviction, and presentation quality
2. Communication – language clarity, structure, and articulation
3. Correctness – technical accuracy, relevance, and completeness

Rules:
- Be realistic. Weak answers score low; strong, specific answers score high.
- finalScore = average of the three scores (rounded to nearest integer).
- feedback: 12–18 words, natural human tone, may suggest one improvement.

Return ONLY valid JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}`,
      },
      {
        role: "user",
        content: `Question: ${question.question}\nAnswer: ${answer}`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = parseJsonFromAiResponse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence ?? 0;
    question.communication = parsed.communication ?? 0;
    question.correctness = parsed.correctness ?? 0;
    question.score = parsed.finalScore ?? 0;
    question.feedback = parsed.feedback || "Answer evaluated.";
    await interview.save();

    return res.json({ feedback: question.feedback });
  } catch (error) {
    return res.status(500).json({ message: `Failed to submit answer: ${error.message}` });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found." });

    const { avgFinalScore, avgConfidence, avgCommunication, avgCorrectness } =
      computeAvgScores(interview.questions);

    interview.finalScore = avgFinalScore;
    interview.status = "completed";
    await interview.save();

    return res.json({
      interviewId: interview._id,
      role: interview.role,
      mode: interview.mode,
      company: interview.company,
      timeLimitEnabled: interview.timeLimitEnabled,
      finalScore: avgFinalScore,
      confidence: avgConfidence,
      communication: avgCommunication,
      correctness: avgCorrectness,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        modelAnswer: q.modelAnswer || "",
        difficulty: q.difficulty || "medium",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to finish interview: ${error.message}` });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode company topic difficulty finalScore status createdAt questionCount timeLimitEnabled");

    return res.json(interviews);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch interviews: ${error.message}` });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });

    const { avgFinalScore, avgConfidence, avgCommunication, avgCorrectness } =
      computeAvgScores(interview.questions);

    return res.json({
      interviewId: interview._id,
      role: interview.role,
      mode: interview.mode,
      company: interview.company,
      timeLimitEnabled: interview.timeLimitEnabled,
      shareToken: interview.shareToken || null,
      finalScore: interview.finalScore || avgFinalScore,
      confidence: avgConfidence,
      communication: avgCommunication,
      correctness: avgCorrectness,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        modelAnswer: q.modelAnswer || "",
        difficulty: q.difficulty || "medium",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch report: ${error.message}` });
  }
};

export const generateShareToken = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!interview) return res.status(404).json({ message: "Interview not found." });

    if (!interview.shareToken) {
      interview.shareToken = crypto.randomBytes(20).toString("hex");
      await interview.save();
    }

    return res.json({ shareToken: interview.shareToken });
  } catch (error) {
    return res.status(500).json({ message: `Failed to generate share link: ${error.message}` });
  }
};

export const getSharedReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({ shareToken: req.params.token });
    if (!interview) return res.status(404).json({ message: "Shared report not found or link is invalid." });

    const { avgFinalScore, avgConfidence, avgCommunication, avgCorrectness } =
      computeAvgScores(interview.questions);

    return res.json({
      interviewId: interview._id,
      role: interview.role,
      mode: interview.mode,
      company: interview.company,
      finalScore: interview.finalScore || avgFinalScore,
      confidence: avgConfidence,
      communication: avgCommunication,
      correctness: avgCorrectness,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        modelAnswer: q.modelAnswer || "",
        difficulty: q.difficulty || "medium",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch shared report: ${error.message}` });
  }
};
