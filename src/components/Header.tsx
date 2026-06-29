import { useState, useEffect } from "react";
import { Cpu, Clock, Flame, Terminal, Radio, Users, Wrench } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  onShortCircuit: () => void;
  isGlitching: boolean;
  currentPage: "workbench" | "about";
  onNavigate: (page: "workbench" | "about") => void;
}

export default function Header({ onShortCircuit, isGlitching, currentPage, onNavigate }: HeaderProps) {
  const [aucklandTime, setAucklandTime] = useState("");
  const [examCountdown, setExamCountdown] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: "Pacific/Auckland",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        };
        const formatter = new Intl.DateTimeFormat([], options);
        setAucklandTime(formatter.format(new Date()));
      } catch (e) {
        // Fallback
        const d = new Date();
        setAucklandTime(d.toTimeString().split(" ")[0]);
      }
    };

    const updateCountdown = () => {
      // High school final exams are usually around mid-November. Let's calculate days left until November 10th of the current year (2026).
      const now = new Date();
      const examDate = new Date(now.getFullYear(), 10, 10); // Nov 10
      if (now > examDate) {
        examDate.setFullYear(now.getFullYear() + 1);
      }
      const diffMs = examDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setExamCountdown(`${diffDays} days left`);
    };

    updateTime();
    updateCountdown();
    const interval = setInterval(() => {
      updateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b-3 border-black bg-white sticky top-0 z-50">
      {/* Row 1: Brand & Actions */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 brutal-border bg-[#00FF00] text-black brutal-shadow-sm rotate-[2deg] overflow-hidden group">
            <motion.div
              animate={isGlitching ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Cpu className="w-6 h-6" id="logo-cpu-icon" />
            </motion.div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-black text-[#00FF00] px-1.5 py-0.5">GROUP://</span>
              <h1 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-black select-none bg-black text-white px-3 py-1 brutal-border brutal-shadow-sm rotate-[-1deg]">
                half-baked<span className="text-[#00FF00]">.</span>studios
              </h1>
            </div>
            <p className="font-mono text-xs text-black font-bold mt-1.5 flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 bg-[#00FF00] brutal-border-sm animate-pulse" />
              <span>works on my machine. ship it.</span>
            </p>
          </div>
        </div>

        {/* Interactive Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex gap-1.5 brutal-border bg-[#F0F0F0] p-1 select-none">
            <button
              onClick={() => onNavigate("workbench")}
              id="header-nav-workbench"
              className={`font-mono text-xs px-3 py-1.5 font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === "workbench"
                  ? "bg-black text-[#00FF00] shadow-sm"
                  : "bg-white text-black hover:bg-slate-200"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>LAB_WORKBENCH</span>
            </button>
            <button
              onClick={() => onNavigate("about")}
              id="header-nav-about"
              className={`font-mono text-xs px-3 py-1.5 font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === "about"
                  ? "bg-black text-[#00FF00] shadow-sm"
                  : "bg-white text-black hover:bg-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>CREW_DOSSIER</span>
            </button>
          </nav>

          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShortCircuit}
            id="short-circuit-button"
            className={`font-mono text-xs px-4 py-2.5 brutal-border brutal-shadow-sm transition-all duration-150 flex items-center gap-2 font-bold uppercase cursor-pointer select-none ${
              isGlitching
                ? "bg-red-500 text-white animate-bounce"
                : "bg-[#00FF00] text-black hover:bg-black hover:text-[#00FF00]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{isGlitching ? "STABILIZE SYSTEM" : "SHORT A PIN"}</span>
          </motion.button>
        </div>
      </div>

      {/* Row 2: Unified Telemetry metrics bar */}
      <div className="border-t-2 border-black bg-[#F5F5F5] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch border-l-2 border-r-2 border-b-2 sm:border-b-0 border-black divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-black font-mono text-[11px] text-black font-bold">
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white flex-1 sm:flex-none" title="Auckland Local Time">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span className="text-slate-500">AUCKLAND_TIME:</span>
              <span className="bg-slate-100 border border-black px-1.5 py-0.5 text-black font-bold tabular-nums">
                {aucklandTime || "23:16:25"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 flex-1 sm:flex-none" title="Days left to exams we should be studying for">
              <Flame className="w-3.5 h-3.5 text-black animate-pulse" />
              <span className="text-slate-500">EXAM_REVISION:</span>
              <span className="bg-amber-300 border border-black px-1.5 py-0.5 text-black font-black animate-pulse">
                {examCountdown || "Calculating..."}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 sm:ml-auto" title="System Mode">
              <Radio className="w-3.5 h-3.5 text-black" />
              <span className="text-slate-500">SYSTEM_MODE:</span>
              <span className="bg-[#00FF00] text-black border border-black px-1.5 py-0.5 uppercase tracking-wider font-black">
                NOT_STUDYING
              </span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
