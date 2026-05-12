import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { ThemeProvider } from "./context/ThemeContext";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./utils/firebase";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";
import Profile from "./pages/Profile";
import SharedReport from "./pages/SharedReport";

export const ServerUrl = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

function Spinner() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RootRoute() {
  const { userData, authChecked } = useSelector((s) => s.user);
  if (!authChecked) return <Spinner />;
  return userData ? <Navigate to="/dashboard" replace /> : <Home />;
}

function ProtectedRoute({ children }) {
  const { userData, authChecked } = useSelector((s) => s.user);
  if (!authChecked) return <Spinner />;
  if (!userData) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      // Handle Google redirect result first
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          const { displayName: name, email } = redirectResult.user;
          const res = await axios.post(
            ServerUrl + "/api/auth/google",
            { name, email },
            { withCredentials: true }
          );
          dispatch(setUserData(res.data));
          return;
        }
      } catch (e) {
        console.error("Redirect sign-in error:", e);
      }

      // Check existing session
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch {
        dispatch(setUserData(null));
      }
    };
    init();
  }, [dispatch]);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "12px",
            background: "#18181b",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #3f3f46",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/shared/:token" element={<SharedReport />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </ThemeProvider>
  );
}
