import { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Cpu, Wifi, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Commit } from "./types";
import Header from "./components/Header";
import Breadboard from "./components/Breadboard";
import TeamGrid from "./components/TeamGrid";
import DoLedger from "./components/DoLedger";
import ExamReviseEscapeHatch from "./components/ExamReviseEscapeHatch";

const INITIAL_COMMITS: Commit[] = [
  {
    id: "h7a32d1",
    message: "docs: works on my machine. ship it.",
    timestamp: "2 mins ago",
    author: "Ga Hing Woo",
    type: "feat",
  },
  {
    id: "b2d8e4f",
    message: "fix: changed tabs to spaces to annoy Andrew during GDScript optimization",
    timestamp: "1 hour ago",
    author: "Jack Trowsdale",
    type: "fix",
  },
  {
    id: "k9d11a4",
    message: "feat: bypassed chemistry classroom Apple TV to host coop LAN party",
    timestamp: "3 hours ago",
    author: "Andrew Pooley",
    type: "feat",
  },
  {
    id: "f83a2c0",
    message: "break: deleted school web-monitor certificate after it blocked linux.org",
    timestamp: "Yesterday",
    author: "Ethan Wright",
    type: "break",
  },
  {
    id: "e44b88a",
    message: "initial commit: initialized repository, wiped default chromebook firmware",
    timestamp: "3 days ago",
    author: "Andrew Pooley",
    type: "feat",
  },
];

export default function App() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchMessage, setGlitchMessage] = useState<string | null>(null);
  const [commits, setCommits] = useState<Commit[]>(INITIAL_COMMITS);
  const [currentPage, setCurrentPage] = useState<"workbench" | "about">(() => {
    const hash = window.location.hash;
    return hash === "#/about" ? "about" : "workbench";
  });

  // Listen to hash changes for full router support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentPage(hash === "#/about" ? "about" : "workbench");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (page: "workbench" | "about") => {
    window.location.hash = page === "about" ? "#/about" : "#/";
  };

  // Load custom commits from localStorage to preserve data
  useEffect(() => {
    const saved = localStorage.getItem("half_baked_commits");
    if (saved) {
      try {
        setCommits(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading saved commits", e);
      }
    }
  }, []);

  const handleAddCommit = (message: string, type: Commit["type"]) => {
    const randomAuthor = ["Ga Hing Woo", "Andrew Pooley", "Ethan Wright", "Jack Trowsdale"][Math.floor(Math.random() * 4)];
    const newCommit: Commit = {
      id: Math.random().toString(16).substring(2, 9),
      message,
      timestamp: "Just now",
      author: randomAuthor,
      type,
    };
    const updated = [newCommit, ...commits];
    setCommits(updated);
    localStorage.setItem("half_baked_commits", JSON.stringify(updated));
  };

  const triggerShortCircuit = (customAlert?: string) => {
    setIsGlitching(true);
    setGlitchMessage(customAlert || "WARNING: HIGH CURRENT SPIKE DETECTED ACROSS GPIO PIN 13! Motherboard cooling fans whining...");

    // Log the short circuit event
    const msg = customAlert || "[ALERT] HIGH CURRENT SPIKE DETECTED: Hardware short on workspace pins.";
    handleAddCommit(msg, "short");

    // Automatically recover from the hardware crash after 4 seconds
    setTimeout(() => {
      setIsGlitching(false);
      setGlitchMessage(null);
    }, 4500);
  };

  const triggerManualShort = () => {
    triggerShortCircuit("MANUAL INTERRUPT: Shorted a virtual jumper pin. Mainframe reporting smell of toasted polymer resistors.");
  };

  return (
    <div className={`min-h-screen bg-[#FFF0E0] text-black font-sans selection:bg-black selection:text-white relative overflow-x-hidden ${isGlitching ? "glitch-active" : ""}`}>
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 opacity-[0.06]" />

      {/* Auckland Header */}
      <Header
        onShortCircuit={triggerManualShort}
        isGlitching={isGlitching}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Splash Title / Hero Section */}
        <section className="relative bg-white brutal-border p-6 sm:p-10 brutal-shadow-lg overflow-hidden flex flex-col md:flex-row gap-8 justify-between items-center text-black">
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="flex items-center gap-2 font-mono text-[10px] text-black font-black uppercase tracking-widest">
              <span className="w-2.5 h-2.5 bg-[#00FF00] brutal-border-sm animate-pulse" />
              <span>AUCKLAND HIGH SCHOOL SOFTWARE CREW</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight uppercase">
              works on my machine<span className="text-red-500">.</span> <br className="hidden sm:block" />
              <span className="bg-[#00FF00] px-3 text-3xl sm:text-4xl font-mono py-1.5 brutal-border-sm inline-block mt-2">ship it.</span>
            </h2>
            
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans font-medium">
              We are a handful of high schoolers in Auckland, New Zealand who build things after class — and, let's be honest, <span className="bg-yellow-200 px-1 font-bold underline decoration-black decoration-2">during class too</span>. We should be revising for our upcoming exams. We are absolutely not.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="bg-[#E0E0E0] brutal-border-sm px-3.5 py-2 flex items-center gap-2 font-mono text-xs text-black font-bold">
                <Cpu className="w-4 h-4 text-black" />
                <span>STACK:</span>
                <span className="bg-white px-1.5 py-0.5 brutal-border-sm font-black">GODOT / KERNEL / ARDUINO</span>
              </div>

              <div className="bg-[#E0E0E0] brutal-border-sm px-3.5 py-2 flex items-center gap-2 font-mono text-xs text-black font-bold">
                <Flame className="w-4 h-4 text-red-500" />
                <span>EXAM REVISION:</span>
                <span className="bg-red-400 px-1.5 py-0.5 brutal-border-sm font-black text-black">0.02% RETENTION</span>
              </div>
            </div>
          </div>

          {/* Glitch Indicator / Diagnostic Window */}
          <div className="w-full md:w-[320px] bg-[#E0E0E0] brutal-border p-4 font-mono text-[11px] text-black relative overflow-hidden flex-shrink-0 self-stretch flex flex-col justify-between brutal-shadow">
            <div>
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-black font-black flex items-center gap-1.5 uppercase">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Workbench Telemetry</span>
                </span>
                <span className="text-[10px] text-black font-black">v0.42</span>
              </div>
              
              <div className="space-y-1.5 text-black font-bold">
                <div className="flex justify-between">
                  <span>SYSTEM_HEALTH:</span>
                  <span className={`px-1.5 py-0.5 brutal-border-sm text-[10px] font-black ${isGlitching ? "bg-red-500 text-white animate-pulse" : "bg-[#00FF00] text-black"}`}>
                    {isGlitching ? "OVERHEAT" : "NOMINAL_SPITE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SCHOOL_FIREWALL:</span>
                  <span className="bg-white px-1 brutal-border-sm">BYPASSED (X2)</span>
                </div>
                <div className="flex justify-between">
                  <span>LOCAL_WEATHER:</span>
                  <span className="bg-blue-300 px-1 brutal-border-sm text-black">RAINY</span>
                </div>
                <div className="flex justify-between">
                  <span>SPITE_CONVERGENCE:</span>
                  <span className="bg-yellow-300 px-1 brutal-border-sm">MAXIMUM</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black text-[10px] text-black flex items-center gap-2 font-black">
              <Wifi className="w-3.5 h-3.5 text-black animate-pulse" />
              <span>Connected to Auckland Central Grid</span>
            </div>
          </div>
        </section>

        {/* Global Hardware Short Alert Toast */}
        <AnimatePresence>
          {isGlitching && glitchMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 max-w-md bg-yellow-300 brutal-border p-4 brutal-shadow-lg flex items-start gap-3.5 text-black"
            >
              <div className="p-2 bg-black text-[#00FF00] brutal-border-sm flex-shrink-0 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-mono text-xs font-black text-black uppercase tracking-widest">
                  [ALERT] SHORT-CIRCUIT ALERT
                </h4>
                <p className="font-sans text-xs text-black mt-1 leading-relaxed font-bold">
                  {glitchMessage}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[9px] text-black font-bold">
                  <span className="w-1.5 h-1.5 rounded-none bg-black animate-ping" />
                  <span>Stabilizing board in 3 seconds...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pages under Router Control */}
        <AnimatePresence mode="wait">
          {currentPage === "workbench" ? (
            <motion.div
              key="workbench-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-12 animate-in fade-in-50 duration-200"
            >
              {/* Interactive Lab Breadboard */}
              <Breadboard onShortCircuit={triggerShortCircuit} onLogMessage={handleAddCommit} />

              {/* What We Do / Don't Do lists */}
              <DoLedger onLogMessage={handleAddCommit} />

              {/* Exam Study vs. Hacking Escape Valve */}
              <ExamReviseEscapeHatch onLogMessage={handleAddCommit} />
            </motion.div>
          ) : (
            <motion.div
              key="about-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-12 animate-in fade-in-50 duration-200"
            >
              {/* Team Grid: Uneven skill distribution */}
              <TeamGrid />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cohesive Footer */}
        <footer className="border-t-3 border-black pt-8 pb-12 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs text-black font-bold uppercase">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-black" />
            <span>half-baked-studios // Auckland, New Zealand</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer bg-red-400 px-2 py-1 brutal-border-sm" onClick={triggerManualShort}>
              [ Trigger Short Circuit ]
            </span>
            <span>|</span>
            <span className="text-slate-700 italic">"Curiosity is our catalyst."</span>
          </div>
        </footer>

      </main>
    </div>
  );
}

