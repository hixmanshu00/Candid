import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "../context/ThemeContext";

function Timer({ timeLeft, totalTime }) {
  const { isDark } = useTheme();
  const percentage = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft <= 15;

  return (
    <div className="w-20 h-20">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: isUrgent ? "#ef4444" : "#14b8a6",
          textColor: isUrgent ? "#ef4444" : isDark ? "#f4f4f5" : "#111827",
          trailColor: isDark ? "#3f3f46" : "#e5e7eb",
        })}
      />
    </div>
  );
}

export default Timer;
