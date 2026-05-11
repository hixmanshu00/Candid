import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  modelAnswer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    mode: {
      type: String,
      enum: ["HR", "Technical", "Behavioral", "System Design", "DSA", "Leadership"],
      required: true,
    },
    resumeText: { type: String, default: "" },
    questionCount: { type: Number, default: 5 },
    timeLimitEnabled: { type: Boolean, default: true },
    difficulty: {
      type: String,
      enum: ["auto", "easy", "medium", "hard"],
      default: "auto",
    },
    company: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    topic: { type: String, default: "" },
    shareToken: { type: String, unique: true, sparse: true },
    questions: [questionsSchema],
    finalScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
