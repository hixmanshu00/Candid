import React from "react";
import { BsRobot } from "react-icons/bs";
import { Globe, Mail, Code2 } from "lucide-react";

function Footer() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 flex justify-center px-4 pb-8 pt-6">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 py-8 px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <BsRobot size={16} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Candid<span className="text-teal-600">.ai</span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                AI-powered interview preparation
              </p>
            </div>
          </div>

          <p className="text-slate-400 dark:text-zinc-500 text-sm text-center max-w-md">
            Practice smarter, interview better. Built to help you land your dream role
            with AI-driven feedback and real-world scenarios.
          </p>

          <div className="flex items-center gap-2">
            {[Globe, Mail, Code2].map((Icon, i) => (
              <button
                key={i}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-400 dark:text-zinc-600">
            © 2026 Candid.ai · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
