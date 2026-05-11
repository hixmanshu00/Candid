import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Step3Report from "../components/Step3Report";
import { BsRobot } from "react-icons/bs";

export default function SharedReport() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/shared/${token}`);
        setReport(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "This report link is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm">Loading shared report…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="text-gray-800 font-bold text-lg mb-2">Report Not Found</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Go to Candid.ai
          </button>
        </div>
      </div>
    );
  }

  return <Step3Report report={report} isSharedView={true} />;
}
