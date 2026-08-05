"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type AuthMode = "gui" | "cli";

export interface AuthToggleProps {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  className?: string;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({
  initialMode = "gui",
  onModeChange,
  className,
}) => {
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode);

  const handleModeSelect = (mode: AuthMode) => {
    setActiveMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-[#161618] p-1 rounded-xl border border-[#242428] flex items-center gap-1 select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => handleModeSelect("gui")}
        className={cn(
          "flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-center relative",
          activeMode === "gui"
            ? "bg-[#2f1f24] text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1e]"
        )}
      >
        GUI Login
      </button>

      <button
        type="button"
        onClick={() => handleModeSelect("cli")}
        className={cn(
          "flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-center relative",
          activeMode === "cli"
            ? "bg-[#2f1f24] text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1e]"
        )}
      >
        CLI Login
      </button>
    </div>
  );
};

export default AuthToggle;
