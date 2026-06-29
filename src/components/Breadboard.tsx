import { useState, useRef, useEffect } from "react";
import { Zap, Play, RotateCcw, AlertTriangle, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Pin {
  id: string;
  name: string;
  type: "power" | "gnd" | "digital" | "analog" | "ic";
  color: string;
  description: string;
}

interface Wire {
  id: string;
  from: string;
  to: string;
  color: string;
}

interface BreadboardProps {
  onShortCircuit: (message: string) => void;
  onLogMessage: (message: string, type: "feat" | "fix" | "break" | "short") => void;
}

const PINS: Pin[] = [
  { id: "5v", name: "5V", type: "power", color: "bg-red-500", description: "Constant +5V DC Rail. Smells warm." },
  { id: "gnd_1", name: "GND", type: "gnd", color: "bg-blue-600", description: "Ground Zero reference node." },
  { id: "d13", name: "D13", type: "digital", color: "bg-amber-500", description: "Digital Pin 13 (Built-in Orange LED)." },
  { id: "d9", name: "D9", type: "digital", color: "bg-teal-500", description: "PWM Digital Pin 9 (Piezo Speaker Node)." },
  { id: "a0", name: "A0", type: "analog", color: "bg-purple-500", description: "Analog Input 0 (Reads stray high school static electricity)." },
  { id: "silicon_rx", name: "RX", type: "ic", color: "bg-emerald-500", description: "Mystery Silicon UART Receive Pin." },
  { id: "silicon_tx", name: "TX", type: "ic", color: "bg-emerald-500", description: "Mystery Silicon UART Transmit Pin." },
  { id: "gnd_2", name: "GND", type: "gnd", color: "bg-blue-600", description: "Auxiliary Ground reference." },
];

const WIRE_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function Breadboard({ onShortCircuit, onLogMessage }: BreadboardProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [activeLed, setActiveLed] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(false);
  const [analogValue, setAnalogValue] = useState(213);
  const [voltageAlert, setVoltageAlert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinCoordinates, setPinCoordinates] = useState<Record<string, { x: number; y: number }>>({});
  const [d13BlinkState, setD13BlinkState] = useState(false);
  const [uartLogs, setUartLogs] = useState<string[]>(["[UART]: Bus ready. Waiting for RX <-> TX loopback..."]);
  const [isUartLoopback, setIsUartLoopback] = useState(false);
  const [measurementMode, setMeasurementMode] = useState<string>("FLOATING COAXIAL STATICS");

  // Find any transitive path of pins connecting pinA and pinB using wires.
  // Returns list of wire IDs representing the path, or null if no path exists.
  const findTransitivePath = (pinA: string, pinB: string, currentWires = wires): string[] | null => {
    if (pinA === pinB) return [];
    
    interface QueueItem {
      pin: string;
      path: string[];
    }
    
    const queue: QueueItem[] = [{ pin: pinA, path: [] }];
    const visited = new Set<string>([pinA]);
    
    while (queue.length > 0) {
      const { pin, path } = queue.shift()!;
      if (pin === pinB) {
        return path;
      }
      
      for (const wire of currentWires) {
        if (wire.from === pin && !visited.has(wire.to)) {
          visited.add(wire.to);
          queue.push({ pin: wire.to, path: [...path, wire.id] });
        } else if (wire.to === pin && !visited.has(wire.from)) {
          visited.add(wire.from);
          queue.push({ pin: wire.from, path: [...path, wire.id] });
        }
      }
    }
    
    return null;
  };

  const checkConnection = (pinA: string, pinB: string, currentWires = wires): boolean => {
    return findTransitivePath(pinA, pinB, currentWires) !== null;
  };

  // Recalculate physical positions of pins for drawing SVG wire lines
  const updatePinCoordinates = () => {
    if (!containerRef.current) return;
    const coords: Record<string, { x: number; y: number }> = {};
    const containerRect = containerRef.current.getBoundingClientRect();

    PINS.forEach((pin) => {
      const el = document.getElementById(`pin-element-${pin.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        coords[pin.id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      }
    });
    setPinCoordinates(coords);
  };

  useEffect(() => {
    updatePinCoordinates();
    window.addEventListener("resize", updatePinCoordinates);
    const t = setTimeout(updatePinCoordinates, 100);
    return () => {
      window.removeEventListener("resize", updatePinCoordinates);
      clearTimeout(t);
    };
  }, [wires]);

  // Microcontroller clock to blink the built-in LED 13
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setD13BlinkState((prev) => !prev);
    }, 1000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Compute all board states whenever wires change or microcontroller LED blinks
  useEffect(() => {
    // 1. Check GND to 5V (SHORT CIRCUIT!)
    const shortPathGnd1 = findTransitivePath("5v", "gnd_1");
    const shortPathGnd2 = findTransitivePath("5v", "gnd_2");
    const isShorted = shortPathGnd1 !== null || shortPathGnd2 !== null;

    if (isShorted) {
      if (!voltageAlert) {
        setVoltageAlert(true);
        onShortCircuit("CRITICAL: GND TO 5V RAIL SHORTED! USB hub triggered overcurrent shutdown. Auckland Central grid humming.");
        onLogMessage("[ALERT] SHORT CIRCUIT DETECTED: 5V rail connected to Ground reference. Overcurrent protector active.", "short");
      }
      setActiveLed(false);
      setActiveSpeaker(false);
      setIsUartLoopback(false);
      return;
    } else {
      if (voltageAlert) {
        setVoltageAlert(false);
        onLogMessage("[RESOLVED] Short circuit cleared. Polyfuse cooled down. Board power rail active.", "fix");
      }
    }

    // 2. Compute UART Loopback & Pin Faults
    const loopbackActive = checkConnection("silicon_rx", "silicon_tx");
    const isTxToGnd = checkConnection("silicon_tx", "gnd_1") || checkConnection("silicon_tx", "gnd_2");
    const isRxToGnd = checkConnection("silicon_rx", "gnd_1") || checkConnection("silicon_rx", "gnd_2");
    const isTxTo5v = checkConnection("silicon_tx", "5v");
    const isRxTo5v = checkConnection("silicon_rx", "5v");

    let currentUartStatus: "idle" | "active" | "error_gnd" | "error_5v" = "idle";
    if (isTxToGnd || isRxToGnd) {
      currentUartStatus = "error_gnd";
    } else if (isTxTo5v || isRxTo5v) {
      currentUartStatus = "error_5v";
    } else if (loopbackActive) {
      currentUartStatus = "active";
    }

    setIsUartLoopback(currentUartStatus === "active");

    if (currentUartStatus === "active" && !isUartLoopback) {
      onLogMessage("[COMM] LOOPBACK ACTIVE: Mystery UART Silicon Transmit looped directly to Receive.", "feat");
    }

    // 3. Compute LED State (D13)
    const hasD13To5V = checkConnection("d13", "5v");
    const hasD13ToGnd = checkConnection("d13", "gnd_1") || checkConnection("d13", "gnd_2");

    let d13State = false;
    if (hasD13ToGnd) {
      d13State = false;
    } else if (hasD13To5V) {
      d13State = true;
    } else if (checkConnection("d13", "silicon_tx") && currentUartStatus === "active") {
      // Flashes matching the serial transmission stream
      d13State = Math.random() > 0.4;
    } else {
      // Default: Blinks as programmed by the internal microcontroller loop
      d13State = d13BlinkState;
    }
    setActiveLed(d13State);

    // 4. Compute PWM Speaker State (D9)
    const hasD9To5V = checkConnection("d9", "5v");
    const hasD9ToGnd = checkConnection("d9", "gnd_1") || checkConnection("d9", "gnd_2");
    const hasD9ToD13 = checkConnection("d9", "d13");
    const hasD9ToTx = checkConnection("d9", "silicon_tx") || checkConnection("d9", "silicon_rx");

    let speakerState = false;
    if (hasD9ToGnd) {
      speakerState = false;
    } else if (hasD9To5V) {
      speakerState = true;
    } else if (hasD9ToD13 && d13State) {
      speakerState = true;
    } else if (hasD9ToTx && currentUartStatus === "active") {
      speakerState = true;
    }
    setActiveSpeaker(speakerState);

    // 5. Alert if someone shorts digital GPIO to GND or 5V incorrectly (high current risk)
    const hasGPIOFault = 
      (checkConnection("d13", "gnd_1") || checkConnection("d13", "gnd_2")) ||
      (checkConnection("d9", "gnd_1") || checkConnection("d9", "gnd_2"));
    if (hasGPIOFault) {
      onLogMessage("[WARN] GPIO Pin pulled directly to ground reference without current-limiting series resistor.", "fix");
    }

  }, [wires, d13BlinkState, voltageAlert]);

  // Periodic UART data logs generator
  useEffect(() => {
    if (!isUartLoopback) return;
    const interval = setInterval(() => {
      const phrases = [
        "[RX]: Packet incoming from bypass-script...",
        "[TX]: Packet ACK sent (0x06). Baud OK.",
        "[UART]: bypassing school-firewall.pac...",
        "[RX]: 0xDEADBEEF received at GPIO registers",
        "[TX]: Heartbeat pulse OK (uptime: 45m)",
        "[UART]: school library computer handshake accepted",
        "[RX]: 'works-on-my-machine' firmware signature verified!"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      setUartLogs((prev) => [...prev.slice(-8), `[${timestamp}] ${randomPhrase}`]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isUartLoopback]);

  // Periodic dynamic Voltmeter flickering simulation (A0)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalogValue((prev) => {
        const shortPathGnd1 = findTransitivePath("5v", "gnd_1");
        const shortPathGnd2 = findTransitivePath("5v", "gnd_2");
        const isShorted = shortPathGnd1 !== null || shortPathGnd2 !== null;

        if (isShorted) {
          setMeasurementMode("SYSTEM OVERLOAD SHUTDOWN (0V)");
          return 0;
        }

        const isA0To5V = checkConnection("a0", "5v");
        const isA0ToGnd = checkConnection("a0", "gnd_1") || checkConnection("a0", "gnd_2");
        const isA0ToD9 = checkConnection("a0", "d9");
        const isA0ToD13 = checkConnection("a0", "d13");
        const isA0ToTx = checkConnection("a0", "silicon_tx") || checkConnection("a0", "silicon_rx");

        if (isA0To5V) {
          setMeasurementMode("STABLE +5V DC RAIL");
          return 1023;
        } else if (isA0ToGnd) {
          setMeasurementMode("GROUND REFERENCE (0V)");
          return 0;
        } else if (isA0ToD9) {
          setMeasurementMode("D9 PIEZO OUT MONITOR");
          return activeSpeaker ? (Math.random() > 0.5 ? 880 : 120) : 0;
        } else if (isA0ToD13) {
          setMeasurementMode("D13 DIGITAL OUT MONITOR");
          return activeLed ? (980 + Math.floor(Math.random() * 10)) : (14 + Math.floor(Math.random() * 5));
        } else if (isA0ToTx) {
          setMeasurementMode("UART CHIP BUS MONITOR");
          const loopbackActive = checkConnection("silicon_rx", "silicon_tx");
          const isTxToGnd = checkConnection("silicon_tx", "gnd_1") || checkConnection("silicon_tx", "gnd_2") || checkConnection("silicon_rx", "gnd_1") || checkConnection("silicon_rx", "gnd_2");
          const isTxTo5v = checkConnection("silicon_tx", "5v") || checkConnection("silicon_rx", "5v");
          
          if (isTxToGnd) return 0;
          if (isTxTo5v) return 1023;
          if (loopbackActive) return Math.floor(Math.random() * 800) + 100;
          return 1010; // UART idle high
        } else if (wires.some(w => w.from === "a0" || w.to === "a0")) {
          setMeasurementMode("HIGH IMPEDANCE NOISE");
          return Math.floor(Math.random() * 200) + 400;
        } else {
          setMeasurementMode("FLOATING COAXIAL STATICS");
          const drift = Math.floor(Math.random() * 21) - 10;
          return Math.max(100, Math.min(250, prev + drift));
        }
      });
    }, 250);
    return () => clearInterval(interval);
  }, [wires, activeLed, activeSpeaker]);

  const handlePinClick = (pinId: string) => {
    if (selectedPinId === null) {
      setSelectedPinId(pinId);
    } else {
      if (selectedPinId !== pinId) {
        // Prevent duplicate wires
        const exists = wires.some(
          (w) =>
              (w.from === selectedPinId && w.to === pinId) ||
              (w.from === pinId && w.to === selectedPinId)
        );

        if (!exists) {
          const wireColor = WIRE_COLORS[wires.length % WIRE_COLORS.length];
          const newWire: Wire = {
            id: `wire-${Date.now()}`,
            from: selectedPinId,
            to: pinId,
            color: wireColor,
          };
          setWires((prev) => [...prev, newWire]);
          onLogMessage(`[CONN] Placed jumper wire from ${selectedPinId.toUpperCase()} to ${pinId.toUpperCase()}.`, "feat");
        }
      }
      setSelectedPinId(null);
    }
  };

  const removeWire = (wireId: string) => {
    const wire = wires.find((w) => w.id === wireId);
    if (wire) {
      setWires((prev) => prev.filter((w) => w.id !== wireId));
      onLogMessage(`[SNIP] Snipped jumper wire connecting ${wire.from.toUpperCase()} and ${wire.to.toUpperCase()}.`, "fix");
    }
  };

  const clearBoard = () => {
    setWires([]);
    setSelectedPinId(null);
    onLogMessage("[CLEAN] Swept workbench. All jumper wires pulled out.", "fix");
  };

  return (
    <div className="bg-white brutal-border p-6 brutal-shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b-3 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-black text-[#00FF00] font-mono text-[10px] uppercase font-black tracking-widest">
              VIRTUAL LAB // AUCKLAND
            </span>
            <h2 className="font-sans font-black text-xl text-black tracking-tight uppercase">Interactive Auckland Workbench</h2>
          </div>
          <p className="font-sans text-xs text-slate-700 mt-1 font-medium">
            Click two pins sequentially to wire up the custom hardware schematic. Hover or tap a connection line to snip it.
          </p>
        </div>

        <button
          onClick={clearBoard}
          id="clear-breadboard-btn"
          className="font-mono text-xs text-black font-bold bg-[#00FF00] hover:bg-black hover:text-[#00FF00] brutal-border px-4 py-2 brutal-shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="uppercase">Reset Workbench</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Physical Board Layout */}
        <div className="lg:col-span-8 flex flex-col justify-between" ref={containerRef}>
          <div className="relative bg-[#F0F0F0] brutal-border p-6 shadow-inner min-h-[220px]">
            {/* SVG Wire Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <AnimatePresence>
                {wires.map((wire) => {
                  const fromCoord = pinCoordinates[wire.from];
                  const toCoord = pinCoordinates[wire.to];
                  if (!fromCoord || !toCoord) return null;

                  // Curved control points for elegant wire representation
                  const dx = toCoord.x - fromCoord.x;
                  const dy = toCoord.y - fromCoord.y;
                  const midX = fromCoord.x + dx / 2;
                  const midY = fromCoord.y + dy / 2 - Math.abs(dx) * 0.2; // slight arch

                  const pathData = `M ${fromCoord.x} ${fromCoord.y} Q ${midX} ${midY} ${toCoord.x} ${toCoord.y}`;

                  return (
                    <g key={wire.id} className="pointer-events-auto cursor-crosshair">
                      {/* Interactive hover padding */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={16}
                        className="cursor-pointer hover:stroke-red-500/20"
                        onClick={() => removeWire(wire.id)}
                      />
                      {/* Inner copper wire glow */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        d={pathData}
                        fill="none"
                        stroke={wire.color === "#ef4444" ? "#000000" : wire.color} // Make wires fit brutalist palette
                        strokeWidth={4}
                        className="cursor-pointer"
                      />
                      {/* Active Current Flow Dot */}
                      <motion.circle
                        r={4}
                        fill="#00FF00"
                        animate={{
                          offsetDistance: ["0%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          offsetPath: `path('${pathData}')`,
                          filter: `drop-shadow(0 0 2px #000000)`,
                        }}
                      />
                    </g>
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Simulated Microcontroller Board PCB */}
            <div className="brutal-border bg-white rounded-none p-4 relative mb-4">
              <div className="absolute top-1 left-2 font-mono text-[9px] text-black font-black uppercase tracking-wider">
                HALF-BAKED UNO v0.42 (REVISED: NEVER)
              </div>

              {/* Pins Container */}
              <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-between items-center gap-4 mt-4">
                {PINS.map((pin) => {
                  const isSelected = selectedPinId === pin.id;
                  const pinConnected = wires.some((w) => w.from === pin.id || w.to === pin.id);

                  return (
                    <div
                      key={pin.id}
                      className="flex flex-col items-center gap-1.5"
                      title={`${pin.name}: ${pin.description}`}
                    >
                      <span className="font-mono text-[10px] font-black text-black uppercase">{pin.name}</span>
                      <button
                        id={`pin-element-${pin.id}`}
                        onClick={() => handlePinClick(pin.id)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-none brutal-border flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                          isSelected
                            ? "bg-[#00FF00] text-black scale-110"
                            : pinConnected
                            ? `${pin.color} text-white`
                            : "bg-white text-black hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-none ${pinConnected ? "bg-white" : "bg-black"}`} />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF00]"></span>
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breadboard Visual Components area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {/* D13 LED Component */}
              <div className="bg-white brutal-border p-3 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-[10px] font-mono text-black font-bold uppercase tracking-wider mb-2">Built-in LED (13)</span>
                <div className="relative">
                  {/* Visual LED Node */}
                  <motion.div
                    animate={activeLed ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`w-10 h-10 rounded-none brutal-border flex items-center justify-center transition-all duration-300 ${
                      activeLed
                        ? "bg-[#00FF00] text-black shadow-lg"
                        : "bg-white text-slate-300"
                    }`}
                  >
                    <Zap className={`w-5 h-5 ${activeLed ? "text-black animate-pulse" : "opacity-30"}`} />
                  </motion.div>
                </div>
                <span className="text-[9px] font-mono mt-2 text-black font-bold uppercase">
                  STATUS: {activeLed ? "GLOWING" : "OFFLINE"}
                </span>
              </div>

              {/* PWM Buzzer Component */}
              <div className="bg-white brutal-border p-3 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-black font-bold uppercase tracking-wider mb-2">Buzzer (Pin 9)</span>
                <div className="relative w-12 h-12 rounded-none bg-white brutal-border-sm flex items-center justify-center">
                  <div className="w-8 h-8 rounded-none bg-black flex items-center justify-center">
                    <div className="w-3 h-3 rounded-none bg-[#00FF00]" />
                  </div>
                  {activeSpeaker && (
                    <span className="absolute -inset-1 border-2 border-black rounded-none animate-ping pointer-events-none" />
                  )}
                </div>
                <span className="text-[9px] font-mono mt-2 text-black font-bold flex items-center gap-1">
                  {activeSpeaker ? (
                    <>
                      <span className="text-black font-black animate-pulse">BZZZZZT!</span>
                    </>
                  ) : (
                    "QUIET"
                  )}
                </span>
              </div>

              {/* High School Ambient Voltmeter */}
              <div className="bg-white brutal-border p-3 flex flex-col items-center justify-center relative">
                {voltageAlert && (
                  <div className="absolute inset-0 bg-red-500 text-white flex flex-col items-center justify-center p-1 text-[10px] font-mono text-center z-20 brutal-border">
                    <AlertTriangle className="w-5 h-5 text-white animate-bounce mb-1" />
                    <span className="font-bold">OVERCURRENT!!</span>
                  </div>
                )}
                <span className="text-[10px] font-mono text-black font-bold uppercase tracking-wider mb-1 text-center truncate w-full" title={measurementMode}>
                  {measurementMode.split(" (")[0]}
                </span>
                <span className="text-2xl font-mono font-black text-black tracking-tight tabular-nums mt-1">
                  {analogValue}
                </span>
                <span className="text-[8px] font-mono mt-1 text-slate-500 text-center font-bold uppercase truncate w-full" title={measurementMode}>
                  {measurementMode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workbench Control Console Sidepanel */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-[#E0E0E0] brutal-border p-4 flex-1 flex flex-col justify-between h-full brutal-shadow">
            <div>
              <div className="flex items-center gap-1.5 mb-3 font-mono text-xs text-black font-bold uppercase">
                <Radio className="w-4 h-4" />
                <span>MULTIMETER DUMP</span>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-black">
                <div className="bg-white p-3 brutal-border-sm">
                  <div className="text-[10px] text-slate-600 font-bold uppercase">CURRENT_CONNECTION_LIST:</div>
                  <div className="mt-1.5 space-y-1 max-h-[120px] overflow-y-auto">
                    {wires.length === 0 ? (
                      <div className="text-slate-500 italic">No jumper wires attached.</div>
                    ) : (
                      wires.map((w) => (
                        <div key={w.id} className="flex justify-between items-center bg-slate-100 px-2 py-1 border-b border-black">
                          <span className="text-black font-bold">
                            {w.from.toUpperCase()} ⟷ {w.to.toUpperCase()}
                          </span>
                          <button
                            onClick={() => removeWire(w.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer font-bold text-[10px]"
                          >
                            [Snip]
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* UART Loopback Serial Terminal Monitor */}
                <div className="bg-black text-[#00FF00] p-3 brutal-border-sm font-mono text-[10px] space-y-1.5 min-h-[140px] flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-[#00FF00]/40 pb-1">
                    <span className="font-black text-[9px] tracking-wider">LIVE_UART_SERIAL_MONITOR:</span>
                    <span className={`w-2 h-2 rounded-full ${isUartLoopback ? "bg-[#00FF00] animate-pulse" : "bg-red-500"}`} />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-[9px] leading-tight space-y-1 max-h-[100px]">
                    {isUartLoopback ? (
                      uartLogs.map((log, idx) => (
                        <div key={idx} className="truncate">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic py-2 text-center">
                        UART RX/TX disconnected.<br />Connect RX to TX to close serial loopback.
                      </div>
                    )}
                  </div>

                  {isUartLoopback && (
                    <div className="text-[8px] text-[#00FF00]/60 border-t border-[#00FF00]/20 pt-1 text-right italic animate-pulse">
                      ▲ Baud rate: 9600 bps | Stream: Live
                    </div>
                  )}
                </div>

                <div className="bg-white p-3 brutal-border-sm space-y-1.5">
                  <div className="text-[10px] text-slate-600 font-bold uppercase">HARDWARE SCHEMATIC TIPS:</div>
                  <ul className="list-disc list-inside space-y-1 text-black text-[10px]">
                    <li>
                      Connect <span className="bg-red-200 px-1 font-bold">5V</span> to{" "}
                      <span className="bg-amber-200 px-1 font-bold">D13</span> to illuminate built-in LED.
                    </li>
                    <li>
                      Connect <span className="bg-red-200 px-1 font-bold">5V</span> to{" "}
                      <span className="bg-teal-200 px-1 font-bold">D9</span> to activate the hardware piezo buzzer.
                    </li>
                    <li>
                      Connect <span className="bg-red-200 px-1 font-bold">5V</span> to{" "}
                      <span className="bg-blue-200 px-1 font-bold">GND</span> to short the board.
                    </li>
                    <li>
                      Connect <span className="bg-emerald-200 px-1 font-bold">RX</span> to{" "}
                      <span className="bg-emerald-200 px-1 font-bold">TX</span> to enable the live UART feedback loop.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black">
              <div className="flex items-center gap-1.5 text-xs text-black font-black font-mono uppercase">
                <div className="w-2.5 h-2.5 bg-[#00FF00] brutal-border-sm animate-pulse" />
                <span>Uptime: 45m (During Chemistry)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
