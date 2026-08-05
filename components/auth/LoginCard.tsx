"use client";

import React from "react";
import LoginForm, { LoginFormProps } from "./LoginForm";
import TerminalPanel, { TerminalPanelProps } from "../terminal/TerminalPanel";
import { cn } from "@/lib/utils";

export interface LoginCardProps {
  className?: string;
  loginFormProps?: LoginFormProps;
  terminalPanelProps?: TerminalPanelProps;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  className,
  loginFormProps,
  terminalPanelProps,
}) => {
  return (
    <div
      className={cn(
        "w-full max-w-5xl rounded-2xl border border-[#242428] bg-[#111113] p-3.5 sm:p-4 lg:p-5 shadow-2xl shadow-black/90 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-center my-auto overflow-hidden",
        className
      )}
    >
      {/* Left Panel (~38%) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-1 sm:p-2">
        <LoginForm {...loginFormProps} />
      </div>

      {/* Right Panel (~62%) */}
      <div className="lg:col-span-7 flex flex-col overflow-hidden">
        <TerminalPanel {...terminalPanelProps} />
      </div>
    </div>
  );
};

export default LoginCard;
