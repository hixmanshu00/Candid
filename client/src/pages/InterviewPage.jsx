import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

export default function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Back to dashboard — shown only on step 1 */}
      {step === 1 && (
        <div className="px-4 pt-4 sm:px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      )}

      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && <Step3Report report={interviewData} />}
    </div>
  );
}
