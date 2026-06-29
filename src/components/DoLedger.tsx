import { useState } from "react";
import { CheckCircle2, XCircle, Code, HelpCircle, AlertOctagon, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DoLedgerProps {
  onLogMessage: (message: string, type: "feat" | "fix" | "break" | "short") => void;
}

export default function DoLedger({ onLogMessage }: DoLedgerProps) {
  // Tabs vs Spaces state
  const [indentOption, setIndentOption] = useState<"tabs" | "spaces" | "spite">("tabs");
  const [indentClicks, setIndentClicks] = useState(0);

  // Bisect Game State
  const [bisectActive, setBisectActive] = useState(false);
  const [commits, setCommits] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [targetBug, setTargetBug] = useState(5);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(7);
  const [bisectLogs, setBisectLogs] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);

  // General code generation state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleTabsToggle = () => {
    const nextClicks = indentClicks + 1;
    setIndentClicks(nextClicks);

    if (nextClicks > 4) {
      setIndentOption("spite");
      onLogMessage("[ALERT] INDENTATION WAR CRITICAL: Tabs and spaces banned. Indentations now handled via raw carriage-return hex characters.", "short");
    } else if (indentOption === "tabs") {
      setIndentOption("spaces");
      onLogMessage("Andrew changed indentation to SPACES. Jack is writing a git-hook to convert them back.", "fix");
    } else {
      setIndentOption("tabs");
      onLogMessage("Jack restored TABS. Andrew is crying in GDScript syntax.", "feat");
    }
  };

  const handleWriteCode = () => {
    const codeSnippets = [
      `// Written during 3rd period Physics\n#include <SPI.h>\nvoid setup() {\n  pinMode(13, OUTPUT);\n  while(!ReviseForExams()) {\n    digitalWrite(13, HIGH); // procrastination loops\n  }\n}`,
      `# Godot GDScript collision hack\nextends KinematicBody2D\nfunc _physics_process(delta):\n  var motion = Vector2(100, 0)\n  move_and_slide(motion)\n  if is_on_floor():\n    # Collision is hard, just skip gravity\n    motion.y = 0`,
      `/* Silicon Register Hack */\n#define GLITCH_ADDR 0x40021000\nvoid bypass_firewall() {\n  volatile uint32_t *reg = (uint32_t *)GLITCH_ADDR;\n  *reg |= 0xDEADBEEF; // Bypasses chemistry quiz\n}`
    ];
    const rand = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    setGeneratedCode(rand);
    onLogMessage("[CODE] Generated clean compilation-warning-filled hack code.", "feat");
  };

  const startBisectGame = () => {
    const bugIdx = Math.floor(Math.random() * 8);
    setTargetBug(bugIdx);
    setLow(0);
    setHigh(7);
    setBisectLogs([`git bisect start`, `git bisect bad v1.0.8`, `git bisect good v1.0.0`, `Testing midpoint...`]);
    setBisectActive(true);
    setGameWon(false);
  };

  const handleBisectStep = (isBad: boolean) => {
    const mid = Math.floor((low + high) / 2);
    let newLow = low;
    let newHigh = high;

    if (isBad) {
      newHigh = mid;
    } else {
      newLow = mid + 1;
    }

    const nextMid = Math.floor((newLow + newHigh) / 2);
    const newLogs = [...bisectLogs];
    newLogs.push(`Commit #${mid + 1} is marked as ${isBad ? "BAD" : "GOOD"}`);

    if (newLow >= newHigh) {
      setGameWon(true);
      newLogs.push(`BUG LOCATED: Commit #${newLow + 1} is the culprit!`);
      newLogs.push(`Bug info: "feat: exam revision notes" broke compilation because it imported real work. Reverted.`);
      onLogMessage(`[SUCCESS] Bisected bug successfully! Found culprit at Commit #${newLow + 1}.`, "fix");
    } else {
      newLogs.push(`Bisecting: ${newHigh - newLow + 1} revisions left to test.`);
    }

    setLow(newLow);
    setHigh(newHigh);
    setBisectLogs(newLogs);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* What We Do */}
      <div className="bg-white brutal-border p-6 brutal-shadow-lg relative flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b-3 border-black pb-3">
            <CheckCircle2 className="w-5 h-5 text-black" />
            <h3 className="font-sans font-black text-black text-lg uppercase tracking-tight">WHAT_WE_DO.md</h3>
          </div>

          <ul className="space-y-4 font-sans text-xs text-black">
            {/* write code */}
            <li className="flex items-start gap-3">
              <span className="text-black bg-[#00FF00] brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[+]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Write Code</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">Godot GDScript, Arduino sketches, bare-metal assembly.</p>
                <button
                  onClick={handleWriteCode}
                  id="write-code-hack-btn"
                  className="font-mono text-[9px] text-black font-bold bg-[#00FF00] hover:bg-black hover:text-[#00FF00] brutal-border px-3 py-1.5 mt-2 cursor-pointer flex items-center gap-1.5 uppercase"
                >
                  <Code className="w-3 h-3" />
                  <span>[ Inject Random Hack ]</span>
                </button>
              </div>
            </li>

            {/* break code, then bisect */}
            <li className="flex items-start gap-3">
              <span className="text-black bg-[#00FF00] brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[+]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Break Code, Then Bisect It</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  We write fast, break things, and find the bug using binary search with complete seriousness.
                </p>
                {!bisectActive ? (
                  <button
                    onClick={startBisectGame}
                    id="bisect-game-btn"
                    className="font-mono text-[9px] text-black font-bold bg-white hover:bg-black hover:text-white brutal-border px-3 py-1.5 mt-2 cursor-pointer flex items-center gap-1.5 uppercase"
                  >
                    <Terminal className="w-3 h-3 animate-pulse" />
                    <span>[ Run Git Bisect ]</span>
                  </button>
                ) : (
                  <div className="mt-2.5 p-3 bg-[#E0E0E0] brutal-border font-mono text-[10px] space-y-3 text-black">
                    <div className="flex justify-between items-center border-b-2 border-black pb-1.5 text-black font-black uppercase">
                      <span>BISECTING 8 COMMITS</span>
                      {gameWon && <span className="text-emerald-700 font-black">FOUND!</span>}
                    </div>

                    {/* Commit nodes visualization */}
                    <div className="flex justify-between px-1">
                      {commits.map((c, idx) => {
                        const isMidpoint = idx === Math.floor((low + high) / 2) && !gameWon;
                        const isExcluded = idx < low || idx > high;
                        return (
                          <div
                            key={c}
                            className={`w-7 h-7 rounded-none flex items-center justify-center font-black text-[10px] brutal-border-sm transition-all ${
                              gameWon && idx === targetBug
                                ? "bg-[#00FF00] text-black animate-bounce"
                                : isMidpoint
                                ? "bg-black text-white"
                                : isExcluded
                                ? "bg-white text-slate-400 opacity-40 line-through"
                                : "bg-white text-black"
                            }`}
                          >
                            #{c}
                          </div>
                        );
                      })}
                    </div>

                    {!gameWon ? (
                      <div className="space-y-1.5">
                        <p className="text-black font-bold text-center">
                          Is commit <span className="bg-black text-white px-1.5 py-0.5 font-black">#{Math.floor((low + high) / 2) + 1}</span> buggy?
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleBisectStep(true)}
                            id="bisect-bad-btn"
                            className="bg-red-400 hover:bg-red-600 text-black font-black brutal-border px-3 py-1 cursor-pointer uppercase text-[10px]"
                          >
                            Yes (Bad)
                          </button>
                          <button
                            onClick={() => handleBisectStep(false)}
                            id="bisect-good-btn"
                            className="bg-[#00FF00] hover:bg-[#00cc00] text-black font-black brutal-border px-3 py-1 cursor-pointer uppercase text-[10px]"
                          >
                            No (Good)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={startBisectGame}
                        id="bisect-restart-btn"
                        className="w-full bg-[#00FF00] hover:bg-black hover:text-[#00FF00] text-black py-1.5 brutal-border text-center cursor-pointer font-black uppercase text-[10px]"
                      >
                        Reset & Try Again
                      </button>
                    )}

                    <div className="bg-white p-2.5 brutal-border-sm text-[8px] text-black space-y-0.5 overflow-y-auto max-h-[80px] font-bold">
                      {bisectLogs.map((log, i) => (
                        <div key={i} className="truncate">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>

            {/* tutorials */}
            <li className="flex items-start gap-3">
              <span className="text-black bg-[#00FF00] brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[+]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Serious Research</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  Treat register dumps, STM32 datasheets, and 14-view YouTube tutorials with equal scientific rigor.
                </p>
              </div>
            </li>

            {/* short a pin */}
            <li className="flex items-start gap-3">
              <span className="text-black bg-[#00FF00] brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[+]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Short pins & ship anyway</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  If it sparks, that means electric charge is moving. Movement is progress.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Code Output Box if generated */}
        <AnimatePresence>
          {generatedCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-amber-100 brutal-border rounded-none relative overflow-hidden"
            >
              <button
                onClick={() => setGeneratedCode(null)}
                className="absolute top-1.5 right-2 text-[9px] font-mono text-black font-bold hover:underline cursor-pointer"
              >
                [Hide]
              </button>
              <div className="text-[10px] font-mono text-black font-black uppercase tracking-widest border-b border-black pb-1.5 mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span>Injectable Hack Stack</span>
              </div>
              <pre className="font-mono text-[10px] text-black overflow-x-auto whitespace-pre leading-normal font-bold">
                {generatedCode}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What We Don't Do */}
      <div className="bg-white brutal-border p-6 brutal-shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b-3 border-black pb-3">
            <XCircle className="w-5 h-5 text-black" />
            <h3 className="font-sans font-black text-black text-lg uppercase tracking-tight">WHAT_WE_DONT_DO.md</h3>
          </div>

          <ul className="space-y-4 font-sans text-xs text-black">
            {/* no tests */}
            <li className="flex items-start gap-3">
              <span className="text-white bg-black brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[-]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Write Tests</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  Why write a test to find out what's broken when we can just push it and wait for Andrew's computer to lock up?
                </p>
              </div>
            </li>

            {/* finish first try */}
            <li className="flex items-start gap-3">
              <span className="text-white bg-black brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[-]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Finish on the First Try</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  That's mathematically impossible. Success is an asymptotic limit approached over 12 cold coffees.
                </p>
              </div>
            </li>

            {/* pay attention */}
            <li className="flex items-start gap-3">
              <span className="text-white bg-black brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[-]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Pay Attention in Class</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  If the school curriculum was more interesting than reverse-engineering the bus-card protocol, we might.
                </p>
              </div>
            </li>

            {/* tabs vs spaces */}
            <li className="flex items-start gap-3">
              <span className="text-white bg-black brutal-border-sm px-1.5 font-mono text-xs font-black select-none">[-]</span>
              <div className="flex-1">
                <p className="font-black text-black uppercase text-sm">Agree on Tabs vs. Spaces</p>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  An ongoing theological conflict. We solve this by compiling via custom scripts that merge both.
                </p>

                <div className="mt-3 flex items-center gap-3 bg-[#E0E0E0] brutal-border-sm p-2.5">
                  <span className="font-mono text-[10px] text-black font-black uppercase">INDENTATION:</span>
                  <button
                    onClick={handleTabsToggle}
                    id="tabs-spaces-war-btn"
                    className={`font-mono text-[10px] px-3 py-1.5 brutal-border-sm transition-all cursor-pointer font-black select-none ${
                      indentOption === "tabs"
                        ? "bg-white text-black"
                        : indentOption === "spaces"
                        ? "bg-black text-white"
                        : "bg-red-500 text-white animate-pulse"
                    }`}
                  >
                    {indentOption === "tabs" && "TABS"}
                    {indentOption === "spaces" && "SPACES"}
                    {indentOption === "spite" && "SPITE (CRITICAL)"}
                  </button>
                  <span className="font-mono text-[9px] text-black font-bold">
                    Clicks: {indentClicks}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Procrastination quote */}
        <div className="mt-6 pt-4 border-t-2 border-black flex items-center gap-2 text-black text-[11px] font-mono italic font-bold">
          <HelpCircle className="w-4 h-4 text-black flex-shrink-0" />
          <span>"We are not professionals. The commit history is evidence."</span>
        </div>
      </div>
    </div>
  );
}
