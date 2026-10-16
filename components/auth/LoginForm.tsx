"use client";

import React, { useState } from "react";
import { Mail, Eye, EyeOff, User, AtSign, Code, Sparkles } from "lucide-react";
import AuthToggle, { AuthMode } from "./AuthToggle";
import SocialLoginButtons from "./SocialLoginButtons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
  onModeToggle?: (mode: AuthMode) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  onSuccess,
  onModeToggle,
}) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [skills, setSkills] = useState("");

  const handleFillDemo = () => {
    setEmail("demo@void.dev");
    setPassword("password123");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const skillsArray = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const res = await register({
          name,
          username,
          email,
          password,
          skills: skillsArray.length > 0 ? skillsArray : ["TypeScript", "WebDev"],
        });

        if (!res.success) {
          setError(res.error || "Registration failed");
          setLoading(false);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Invalid credentials");
          setLoading(false);
          return;
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col justify-between h-full space-y-3", className)}>
      <div>
        {/* Header Titles */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
              {isRegister ? "Create Account" : "Welcome!"}
            </h1>
            <p className="text-xs text-zinc-400">
              {isRegister
                ? "Join the developer network built for builders."
                : "Enter your credentials or CLI session."}
            </p>
          </div>
          {!isRegister && (
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 text-[11px] font-medium bg-[#1a1a20] hover:bg-[#252530] text-[#a78bfa] hover:text-white border border-[#2e2640] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Auto-fill demo user credentials"
            >
              <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
              <span>Demo Fill</span>
            </button>
          )}
        </div>

        {/* GUI / CLI Toggle */}
        <div className="mb-3">
          <AuthToggle onModeChange={onModeToggle} />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-2.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-1.5 animate-in fade-in duration-200">
            <span className="font-semibold shrink-0">[Error]</span>
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {isRegister && (
            <>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    required
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-9 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
                  />
                  <User className="w-3.5 h-3.5 absolute right-3 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="adalovelace"
                    required
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-9 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
                  />
                  <AtSign className="w-3.5 h-3.5 absolute right-3 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label
                  htmlFor="skills"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Skills (comma separated)
                </label>
                <div className="relative flex items-center">
                  <input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Rust, Next.js, Go"
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-9 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
                  />
                  <Code className="w-3.5 h-3.5 absolute right-3 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </>
          )}

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
                minLength={6}
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
            disabled={loading}
            className="w-full mt-1 py-2 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 shadow-md shadow-purple-600/20 active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            {loading
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
              ? "Create account"
              : "Sign in"}
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
        <SocialLoginButtons
          onGitHubClick={() => {
            setEmail("alex@void.dev");
            setPassword("password123");
            setError(null);
          }}
          onGoogleClick={() => {
            setEmail("sarah@void.dev");
            setPassword("password123");
            setError(null);
          }}
        />

        {/* Links row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs mt-3 gap-1 sm:gap-0">
          {!isRegister && (
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#8B5CF6] hover:text-[#a78bfa] hover:underline font-medium transition-colors text-xs"
            >
              Use demo login?
            </button>
          )}
          <span className="text-zinc-400 text-xs">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-[#8B5CF6] hover:text-[#a78bfa] hover:underline font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-[#8B5CF6] hover:text-[#a78bfa] hover:underline font-medium transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Footer terms */}
      <div className="pt-2 border-t border-[#1e1e22]/50">
        <p className="text-[10px] text-zinc-500 leading-tight">
          By continuing, you agree to Void&apos;s{" "}
          <span className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
