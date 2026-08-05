"use client";

import React from "react";
import TerminalHeader, { TerminalHeaderProps } from "./TerminalHeader";
import TerminalWindow, { TerminalWindowProps } from "./TerminalWindow";
import { cn } from "@/lib/utils";

export interface TerminalPanelProps {
  className?: string;
  headerProps?: TerminalHeaderProps;
  windowProps?: TerminalWindowProps;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  className,
  headerProps,
  windowProps,
}) => {
  return (
    <div
      className={cn(
        "bg-[#111114] border border-[#242428] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-xl h-full overflow-hidden",
        className
      )}
    >
      {/* <TerminalHeader {...headerProps} /> */}
      <TerminalWindow {...windowProps} />
    </div>
  );
};

export default TerminalPanel;
