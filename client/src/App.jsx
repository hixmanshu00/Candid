import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";
import Profile from "./pages/Profile";
import SharedReport from "./pages/SharedReport";

export const ServerUrl = (import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:8000`).replace(/\/$/, "");

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Restore token on page load
const savedToken = localStorage.getItem("authToken");
if (savedToken) setAuthToken(savedToken);

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
      // Check existing session via stored token
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user");
        dispatch(setUserData(result.data));
      } catch {
        setAuthToken(null);
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
