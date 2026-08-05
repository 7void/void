"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TerminalHeaderProps {
  title?: string;
  className?: string;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  title = "Void CLI",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-3 border-b border-[#202026]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#18181c] border border-[#282830] text-[#8B5CF6]">
          <Terminal className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-white tracking-wide leading-none mb-1">
            {title}
          </h2>
        </div>
      </div>

    </div>
  );
};

export default TerminalHeader;
