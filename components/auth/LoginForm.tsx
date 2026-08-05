"use client";

import React, { useState } from "react";
import { Mail, Eye, EyeOff, Terminal } from "lucide-react";
import AuthToggle from "./AuthToggle";
import SocialLoginButtons from "./SocialLoginButtons";
import { cn } from "@/lib/utils";

export interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className={cn("flex flex-col justify-between h-full space-y-3", className)}>
      <div>
        {/* Logo Section */}

        {/* Header Titles */}
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
            Welcome!
          </h1>
        </div>

        {/* GUI / CLI Toggle */}
        <div className="mb-3">
          <AuthToggle />
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-300 mb-1"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@void.dev"
                required
                className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-9 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
              />
              <Mail className="w-3.5 h-3.5 absolute right-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-300 mb-1"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-9 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-1 py-2 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 shadow-md shadow-purple-600/20 active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            Sign in
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#242428] w-full"></div>
          <span className="bg-[#111113] px-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Social OAuth Buttons */}
        <SocialLoginButtons />

        {/* Links row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs mt-3 gap-1 sm:gap-0">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#8B5CF6] hover:text-[#a78bfa] hover:underline font-medium transition-colors text-xs"
          >
            Forgot password?
          </a>
          <span className="text-zinc-400 text-xs">
            Don&apos;t have an account?{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#8B5CF6] hover:text-[#a78bfa] hover:underline font-medium transition-colors"
            >
              Register
            </a>
          </span>
        </div>
      </div>

      {/* Footer terms */}
      <div className="pt-2 border-t border-[#1e1e22]/50">
        <p className="text-[10px] text-zinc-500 leading-tight">
          By continuing, you agree to Void&apos;s{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
