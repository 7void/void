"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  Lightbulb,
  Users,
  Briefcase,
  MessageSquare,
  Zap,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface CommandOutput {
  id: string;
  command?: string;
  type: "banner" | "text" | "session" | "tip" | "stats" | "quote" | "error" | "help";
  customContent?: React.ReactNode;
}

const TIPS_DATABASE = [
  { id: 42, text: "Use cursor-based pagination instead of OFFSET for large datasets." },
  { id: 88, text: "Prefer immutable data structures to simplify state updates in React." },
  { id: 104, text: "Keep server actions modular and validate all inputs with Zod." },
  { id: 15, text: "Index high-cardinality columns in PostgreSQL for fast lookup queries." },
];

const QUOTES_DATABASE = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The most dangerous phrase is, 'We've always done it this way.'", author: "Grace Hopper" },
];

export interface TerminalWindowProps {
  className?: string;
  onCommandRun?: (cmd: string) => void;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  className,
  onCommandRun,
}) => {
  const router = useRouter();
  const { login } = useAuth();
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: "init-banner",
      type: "banner",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Directly set container.scrollTop to bottom on output update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const rawCmd = inputVal.trim();
      if (!rawCmd) return;

      setCmdHistory((prev) => [...prev, rawCmd]);
      setHistoryIdx(-1);
      setInputVal("");

      if (onCommandRun) {
        onCommandRun(rawCmd);
      }

      executeCommand(rawCmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx < cmdHistory.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal("");
      }
    }
  };

  const executeCommand = (fullCmd: string) => {
    const parts = fullCmd.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    if (cmd === "clear") {
      setHistory([]);
      return;
    }

    const newId = `cmd-${Date.now()}`;

    if (cmd === "help") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "help",
        },
      ]);
    } else if (cmd === "session.start" || cmd === "session") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "session",
        },
      ]);
      // Authenticate via demo session
      setTimeout(async () => {
        try {
          await login("demo@void.dev", "password123");
        } catch (err) {
          console.error("CLI session error", err);
        }
      }, 1200);
    } else if (cmd === "login") {
      const loginParts = args.split(" ");
      const emailArg = loginParts[0] || "demo@void.dev";
      const passArg = loginParts[1] || "password123";
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "text",
          customContent: <p className="text-purple-400">Authenticating CLI user {emailArg}...</p>,
        },
      ]);
      setTimeout(async () => {
        const res = await login(emailArg, passArg);
        if (!res.success) {
          setHistory((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              type: "error",
              customContent: <p className="text-rose-400">Authentication failed: {res.error}</p>,
            },
          ]);
        }
      }, 800);
    } else if (cmd === "feed") {
      router.push("/feed");
    } else if (cmd === "projects") {
      router.push("/projects");
    } else if (cmd === "explore") {
      router.push("/explore");
    } else if (cmd === "tip") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "tip",
        },
      ]);
    } else if (cmd === "stats") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "stats",
        },
      ]);
    } else if (cmd === "quote") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "quote",
        },
      ]);
    } else if (cmd === "whoami") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "text",
          customContent: <p className="text-zinc-300">guest@void.dev (unauthenticated)</p>,
        },
      ]);
    } else if (cmd === "version") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "text",
          customContent: <p className="text-zinc-400">void shell v1.0.0 (x86_64-pc-void-os)</p>,
        },
      ]);
    } else if (cmd === "echo") {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "text",
          customContent: <p className="text-zinc-300">{args || ""}</p>,
        },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          id: newId,
          command: fullCmd,
          type: "error",
          customContent: (
            <p className="text-rose-400">
              Command not found: &apos;{fullCmd}&apos;. Type &apos;<span className="text-purple-400 underline">help</span>&apos; to see available commands.
            </p>
          ),
        },
      ]);
    }
  };

  const getRandomTip = () => {
    return TIPS_DATABASE[Math.floor(Math.random() * TIPS_DATABASE.length)];
  };

  const getRandomQuote = () => {
    return QUOTES_DATABASE[Math.floor(Math.random() * QUOTES_DATABASE.length)];
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={cn(
        "w-full bg-[#0a0a0c] border border-[#1e1e24] rounded-xl p-3.5 sm:p-4 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-y-auto select-none space-y-3 shadow-inner cursor-text h-[350px] max-h-[350px] shrink-0 custom-scrollbar",
        className
      )}
    >
      {history.map((item) => (
        <div key={item.id} className="space-y-2">
          {item.command && (
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-semibold">void ~ $</span>
              <span className="text-white font-medium">{item.command}</span>
            </div>
          )}

          {item.type === "banner" && (
            <div className="text-zinc-500 space-y-0.5 pb-1 border-b border-[#18181f]">
              <p className="text-zinc-400 font-medium">void shell v1.0.0</p>
              <p>Type &apos;help&apos; to see available commands.</p>
            </div>
          )}

          {item.type === "help" && (
            <div className="pl-2 sm:pl-3 space-y-1 text-zinc-400 text-xs">
              <p className="text-purple-400 font-semibold mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Available Commands:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <div><span className="text-white font-medium">session.start</span> - Authenticate session</div>
                <div><span className="text-white font-medium">tip</span> - Display developer tip</div>
                <div><span className="text-white font-medium">stats</span> - View platform metrics</div>
                <div><span className="text-white font-medium">quote</span> - Display programming quote</div>
                <div><span className="text-white font-medium">whoami</span> - Show active user info</div>
                <div><span className="text-white font-medium">version</span> - Show CLI version</div>
                <div><span className="text-white font-medium">clear</span> - Clear terminal output</div>
                <div><span className="text-white font-medium">echo &lt;text&gt;</span> - Print input text</div>
              </div>
            </div>
          )}

          {item.type === "session" && (
            <div className="pl-2 sm:pl-3 space-y-1 text-zinc-400">
              <div className="flex items-center justify-between gap-4">
                <span>&gt; authenticating user...</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-xs">[ok]</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>&gt; loading feed modules...</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-xs">[ok]</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>&gt; syncing projects, posts, and replies...</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-xs">[ok]</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>&gt; ready.</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-xs">[ok]</span>
                </span>
              </div>
            </div>
          )}

          {item.type === "tip" && (() => {
            const tip = getRandomTip();
            return (
              <div className="ml-2 sm:ml-3 p-2.5 rounded-lg border border-[#2d2140] bg-[#140e20]/60 space-y-1">
                <div className="flex items-center gap-2 text-[#a78bfa] font-semibold text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>TIP #{tip.id}</span>
                </div>
                <p className="text-zinc-300 text-xs leading-normal">{tip.text}</p>
              </div>
            );
          })()}

          {item.type === "stats" && (
            <div className="pl-2 sm:pl-3 space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Developers online :</span>
                <span className="text-emerald-400 font-semibold">18,241</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Projects shared   :</span>
                <span className="text-emerald-400 font-semibold">7,932</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Discussions active:</span>
                <span className="text-blue-400 font-semibold">3,461</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Uptime            :</span>
                <span className="text-amber-400 font-semibold">12d 7h 18m</span>
              </div>
            </div>
          )}

          {item.type === "quote" && (() => {
            const q = getRandomQuote();
            return (
              <div className="pl-2 sm:pl-3 space-y-0.5">
                <p className="text-emerald-400 italic">&quot;{q.text}&quot;</p>
                <p className="text-zinc-500 not-italic text-xs">- {q.author}</p>
              </div>
            );
          })()}

          {(item.type === "text" || item.type === "error") && (
            <div className="pl-2 sm:pl-3">{item.customContent}</div>
          )}
        </div>
      ))}

      {/* Active Command Prompt Input */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[#8B5CF6] font-semibold shrink-0">void ~ $</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          placeholder="Type a command (e.g. 'help', 'session.start', 'stats')...."
          className="w-full bg-transparent text-white outline-none border-none font-mono text-xs sm:text-sm placeholder-zinc-600 caret-[#8B5CF6]"
        />
      </div>
    </div>
  );
};

export default TerminalWindow;
