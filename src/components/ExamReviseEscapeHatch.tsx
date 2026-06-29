import { useState, useEffect } from "react";
import { BookOpen, AlertTriangle, Play, HelpCircle, Code } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExamReviseEscapeHatchProps {
  onLogMessage: (message: string, type: "feat" | "fix" | "break" | "short") => void;
}

export default function ExamReviseEscapeHatch({ onLogMessage }: ExamReviseEscapeHatchProps) {
  const [activeTab, setActiveTab] = useState<"study" | "code">("code");
  const [studySeconds, setStudySeconds] = useState(0);
  const [glitchedOut, setGlitchedOut] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === "study") {
      setStudySeconds(0);
      setGlitchedOut(false);

      timer = setInterval(() => {
        setStudySeconds((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            // Glitch and force escape!
            setGlitchedOut(true);
            setTimeout(() => {
              setActiveTab("code");
              onLogMessage("[SYSTEM INTERRUPT] Exam study loop crashed due to low retention rate. Redirected to writing physics simulations.", "break");
            }, 1500);
            return 5;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab]);

  return (
    <div className="bg-white brutal-border p-6 brutal-shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b-3 border-black pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-black text-white font-mono text-[10px] uppercase font-black tracking-widest">
              Auckland Escape Valve
            </span>
            <h2 className="font-sans font-black text-lg text-black tracking-tight uppercase">
              Exam Study Escape Valve
            </h2>
          </div>
          <p className="font-sans text-xs text-slate-700 mt-1 font-medium">
            Toggle our attention span between the Auckland NCEA syllabus and Godot scripts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#E0E0E0] p-1.5 brutal-border-sm">
          <button
            onClick={() => setActiveTab("study")}
            className={`font-mono text-xs px-3 py-1.5 transition-all cursor-pointer font-black uppercase ${
              activeTab === "study"
                ? "bg-amber-300 text-black brutal-border-sm shadow-sm"
                : "text-slate-700 hover:text-black"
            }`}
          >
            NCEA Exam Study
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`font-mono text-xs px-3 py-1.5 transition-all cursor-pointer font-black uppercase ${
              activeTab === "code"
                ? "bg-[#00FF00] text-black brutal-border-sm shadow-sm"
                : "text-slate-700 hover:text-black"
            }`}
          >
            Code in Class
          </button>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {activeTab === "study" ? (
            <motion.div
              key="study-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white text-black p-5 brutal-border-sm font-sans relative"
            >
              {glitchedOut && (
                <div className="absolute inset-0 bg-red-500 text-white flex flex-col items-center justify-center p-4 text-center z-20 brutal-border">
                  <AlertTriangle className="w-10 h-10 text-white animate-bounce mb-2" />
                  <span className="font-mono text-sm font-black tracking-wider uppercase">
                    BUFFER OVERFLOW: ATTENTION CAPACITY EXCEEDED!
                  </span>
                  <span className="font-mono text-xs text-white mt-1 font-bold">
                    Bailing out. Writing Godot shaders in 3... 2... 1...
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-3">
                <div className="flex items-center gap-1.5 text-black font-black text-xs font-mono uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>AUCKLAND EXAM PREP WORKBOOK</span>
                </div>
                <div className="font-mono text-xs text-black bg-[#E0E0E0] brutal-border-sm px-2 py-0.5">
                  Study duration: <span className="text-red-500 font-black tabular-nums">{studySeconds}s</span> / 5s LIMIT
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-black">
                <div>
                  <h4 className="font-black text-black text-sm">Question 3: Mechanics & Friction</h4>
                  <p className="text-slate-700 italic mt-0.5 font-medium">
                    A block of mass <span className="font-mono font-bold">m = 5.0 kg</span> is sliding down a slope angled at{" "}
                    <span className="font-mono font-bold">θ = 30°</span>. The coefficient of kinetic friction is{" "}
                    <span className="font-mono font-bold">μ = 0.15</span>. Calculate the acceleration of the block.
                  </p>
                </div>

                <div className="bg-[#F0F0F0] p-3 brutal-border-sm font-mono text-[10px] text-black space-y-1.5">
                  <div className="font-bold uppercase">
                    Your working out:
                  </div>
                  <div className="text-black font-black animate-pulse bg-yellow-200 px-1 py-0.5">
                    &gt; F_net = m*g*sin(theta) - mu*m*g*cos(theta)... wait, I can simulate this with 5 lines of GDScript much faster.
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-black pt-2 text-center italic font-bold">
                  Tip: Use standard formula sheet. Do NOT write games on your calculator.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white brutal-border p-5 font-mono text-xs text-black relative space-y-4"
            >
              {/* Terminal Title */}
              <div className="flex justify-between items-center border-b-2 border-black pb-2 text-[10px] text-black font-black uppercase">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  <span>GODOT PHYSICS OVERRIDE (DURING CLASS)</span>
                </div>
                <span>STATUS: RUNNING (UNCHECKED)</span>
              </div>

              {/* Code Blocks */}
              <div className="space-y-2 text-[11px] leading-relaxed font-bold text-black">
                <div className="text-slate-500"># Collision engine bypassing school-issued guidelines</div>
                <div>
                  <span className="bg-black text-white px-1.5 py-0.5">func</span> <span className="underline">_process</span>(delta):
                </div>
                <div className="pl-4">
                  <span className="bg-black text-white px-1 py-0.5">var</span> physics_broken = <span className="bg-[#00FF00] px-1">true</span>
                </div>
                <div className="pl-4">
                  <span className="bg-black text-white px-1 py-0.5">if</span> physics_broken:
                </div>
                <div className="pl-8 text-slate-500">
                  # Hardcode the player's acceleration to ignore gravity vectors
                </div>
                <div className="pl-8">
                  player_gravity_factor = <span className="bg-yellow-200 px-1">0.0</span>
                </div>
                <div className="pl-8">
                  velocity.y = <span className="bg-yellow-200 px-1">0.0</span> <span className="text-slate-500"># collision solved.</span>
                </div>
              </div>

              {/* Procrastination metrics */}
              <div className="grid grid-cols-2 gap-3 bg-[#E0E0E0] brutal-border-sm p-3 font-mono text-[10px] text-black font-bold uppercase">
                <div>
                  <span className="text-slate-600 block">EXAM REVISION EFFORT:</span>
                  <span className="text-red-600 font-black">Uninstalled</span>
                </div>
                <div>
                  <span className="text-slate-600 block">CURIOSITY MULTIPLIER:</span>
                  <span className="bg-[#00FF00] px-1.5 py-0.5 text-black font-black">11,400% (SPITE POWERED)</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
