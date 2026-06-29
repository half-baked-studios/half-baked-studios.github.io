import { useState } from "react";
import { User, Sparkles, AlertCircle, RefreshCw, Layers, Cpu, Zap, Gamepad2, Terminal } from "lucide-react";
import { motion } from "motion/react";
import { TeamMember } from "../types";

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "gahingwoo",
    name: "Ga Hing Woo",
    role: "The Core & Security Architect",
    avatar: "cpu",
    bio: "Extremely serious and rigorous. He reads through code lines one by one. After being repeatedly trapped by vendor red herrings during mainline development, he became a master of Rockchip dev boards, porting OP-TEE, TFA, and EDK2 UEFI.",
    quote: "Read the source line-by-line, trace every register access, and ignore vendor blobs. EDK2 and OP-TEE require zero compromise.",
    stack: ["Rockchip SoC", "OP-TEE OS", "TFA/ATF", "EDK2 UEFI", "Device Tree", "C/Assembly"],
    skills: [
      { name: "OP-TEE Security", value: 98, color: "bg-red-500" },
      { name: "EDK2 Porting", value: 95, color: "bg-orange-500" },
      { name: "Rockchip Mainline", value: 92, color: "bg-emerald-500" },
      { name: "Exam Revision", value: 1.5, color: "bg-slate-700" },
    ],
    status: "Porting EDK2 to a custom Rockchip board during chemistry",
  },
  {
    id: "Silverkeybord",
    name: "Andrew Pooley",
    role: "The Hardware Maestro",
    avatar: "zap",
    bio: "Expert in breadboards, sensor integration, and microcontrollers. Has an uncanny ability to find exactly where to wire jumper connections. Fluent in writing custom Python scripts and Godot controllers.",
    quote: "It's not a short circuit. It's a spontaneous thermal-feedback heater system.",
    stack: ["LeetCode", "Godot GDScript", "Python", "Arduino", "Breadboards"],
    skills: [
      { name: "Shorting Pins", value: 99, color: "bg-red-500" },
      { name: "Schematic Origami", value: 95, color: "bg-blue-500" },
      { name: "LeetCode Revision", value: 4.2, color: "bg-slate-700" },
      { name: "PIEZO Buzzing", value: 90, color: "bg-[#00FF00]" },
    ],
    status: "Recovering from a 5V capacitor pop in third period",
  },
  {
    id: "EGaming365",
    name: "Wright Ethan",
    role: "The Codebase General",
    avatar: "gamepad",
    bio: "Mainly studies high-level Physics and Biology while building Godot games on his laptop. Expert at simulating complex motion and ecosystem dynamics in GDScript.",
    quote: "与其担心考试，不如用Godot做一个Temu版的Minecraft。",
    stack: ["Godot GDScript", "Physics Sim", "Biology Models"],
    skills: [
      { name: "Godot Game Dev", value: 96, color: "bg-red-500" },
      { name: "Physics Engine Tuning", value: 88, color: "bg-purple-500" },
      { name: "Biology Diagrams", value: 91, color: "bg-[#00FF00]" },
      { name: "Game Jam Sprints", value: 95, color: "bg-pink-500" },
    ],
    status: "Reversing the bus-card protocols on a library computer",
  },
  {
    id: "747389",
    name: "Jack Trowsdale",
    role: "The Chaos Commander",
    avatar: "terminal",
    bio: "An algorithm expert who understands complex math and Godot systems inside-out. Specializes in spatial partitioning and high-performance layout algorithms.",
    quote: "All hard problems can be solved with the right data structure and a custom physics pass.",
    stack: ["Algorithms", "Godot GDScript", "Math Models"],
    skills: [
      { name: "Algorithm Design", value: 97, color: "bg-red-500" },
      { name: "Godot Physics", value: 95, color: "bg-blue-500" },
      { name: "Chaos Injection", value: 94, color: "bg-[#00FF00]" },
      { name: "Calculus Revision", value: 1.2, color: "bg-slate-700" },
    ],
    status: "Injecting random code hacks from a graphics calculator",
  },
];

export default function TeamGrid() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [isChaotic, setIsChaotic] = useState(false);

  const triggerChaosStats = () => {
    setIsChaotic(true);
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        skills: m.skills.map((s) => {
          if (s.name.includes("Revision")) {
            // Exam study is volatile but always drops near zero
            return { ...s, value: Math.max(0.1, +(Math.random() * 5).toFixed(1)) };
          }
          if (s.name.includes("Spite") || s.name.includes("Shorting") || s.name.includes("Register") || s.name.includes("Godot") || s.name.includes("Algorithm")) {
            // Core motivation fluctuates but remains high
            return { ...s, value: Math.floor(Math.random() * 15) + 85 };
          }
          return { ...s, value: Math.floor(Math.random() * 60) + 40 };
        }),
      }))
    );
    setTimeout(() => setIsChaotic(false), 800);
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-3 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-[#00FF00] text-xs font-mono font-black uppercase">
              [ STACK://SKILL_MATRIX ]
            </span>
            <h2 className="font-sans text-2xl font-black text-black tracking-tight uppercase">
              Uneven Skill Distribution
            </h2>
          </div>
          <p className="font-sans text-sm text-slate-700 mt-1 font-medium">
            A few high schoolers in Auckland who build things after class — and during class too.
          </p>
        </div>

        <button
          onClick={triggerChaosStats}
          id="chaos-stats-btn"
          className="font-mono text-xs bg-black text-white brutal-border px-4 py-2.5 hover:bg-[#00FF00] hover:text-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 flex items-center gap-2 cursor-pointer select-none"
        >
          <RefreshCw className={`w-4 h-4 ${isChaotic ? "animate-spin" : ""}`} />
          <span className="font-bold uppercase">Tweak Procrastination Sliders</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white brutal-border p-5 flex flex-col justify-between brutal-shadow-hover hover:rotate-[-0.5deg] relative group overflow-hidden"
          >
            <div>
              {/* Member Meta */}
              <div className="flex items-center gap-3.5 mb-4 border-b-2 border-black pb-3">
                <span className="p-1 bg-[#00FF00] brutal-border w-12 h-12 flex items-center justify-center select-none shadow-sm rotate-[4deg]">
                  {member.avatar === "cpu" && <Cpu className="w-6 h-6 text-black" />}
                  {member.avatar === "zap" && <Zap className="w-6 h-6 text-black" />}
                  {member.avatar === "gamepad" && <Gamepad2 className="w-6 h-6 text-black" />}
                  {member.avatar === "terminal" && <Terminal className="w-6 h-6 text-black" />}
                </span>
                <div>
                  <h3 className="font-sans font-black text-black text-lg flex flex-wrap items-center gap-1.5 uppercase">
                    <span>{member.name}</span>
                    <a
                      href={`https://github.com/${member.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00FF00] bg-black hover:bg-[#00FF00] hover:text-black text-xs font-mono font-bold px-1.5 py-0.5 transition-colors duration-150 inline-block"
                      title="View GitHub Profile"
                    >
                      @{member.id}
                    </a>
                  </h3>
                  <p className="font-mono text-[11px] text-slate-600 font-black uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Bio & Quote */}
              <div className="space-y-3 font-sans text-xs text-black leading-relaxed mb-5">
                <p className="font-medium">{member.bio}</p>
                <blockquote className="border-l-3 border-black pl-3 italic text-black font-mono text-[11px] py-1 bg-amber-100 brutal-border-sm">
                  "{member.quote}"
                </blockquote>
              </div>

              {/* Tech stack badges */}
              <div className="mb-6">
                <div className="flex items-center gap-1 mb-2">
                  <Layers className="w-3.5 h-3.5 text-black" />
                  <span className="font-mono text-[9px] text-black font-black uppercase tracking-widest">
                    ACTIVE_STACK
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {member.stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] bg-white brutal-border-sm px-2.5 py-0.5 rounded-none text-black font-black"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chaotic Stats */}
            <div>
              <div className="space-y-2.5 pt-4 border-t-2 border-black">
                {member.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="text-black font-bold uppercase">{skill.name}</span>
                      <span className={`font-black ${skill.value < 5 ? "text-red-500 animate-pulse bg-red-100 px-1" : "text-black bg-[#E0E0E0] px-1"}`}>
                        {skill.value}%
                      </span>
                    </div>
                    <div className="h-4 bg-[#E0E0E0] brutal-border-sm rounded-none overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className={`h-full rounded-none ${
                          skill.color.includes("bg-red-500") ? "bg-red-500" :
                          skill.color.includes("bg-orange-500") ? "bg-orange-500" :
                          skill.color.includes("bg-amber-500") ? "bg-amber-400" :
                          skill.color.includes("bg-[#00FF00]") || skill.color.includes("bg-emerald-500") ? "bg-[#00FF00]" : "bg-black"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status footer inside card */}
              <div className="mt-4 bg-[#E0E0E0] brutal-border-sm p-2 rounded-none flex items-start gap-1.5 font-mono text-[9px] text-black font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                <span className="break-words whitespace-normal uppercase text-black font-black" title={member.status}>
                  ACT: {member.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
