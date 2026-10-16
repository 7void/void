"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth-context";
import {
  Settings,
  User,
  AtSign,
  Mail,
  Code2,
  Globe,
  Image,
  LogOut,
  Save,
  Check,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

export default function SettingsPage() {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setName(user.name || "");
    setBio(user.bio || "");
    setSkills((user.skills || []).join(", "));
    setGithub(user.github || "");
    setWebsite(user.website || "");
    setAvatar(user.avatar || "");
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          skills: skillsArray,
          github: github.trim(),
          website: website.trim(),
          avatar: avatar.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await refreshUser();
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-7 shadow-2xl shadow-black/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Profile & Settings
              </h1>
              <p className="text-xs text-zinc-400">
                Manage your public developer profile, tech stack, and links.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="py-1.5 px-3 rounded-lg border border-rose-950/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-950/30 border-emerald-900/60 text-emerald-300"
                : "bg-rose-950/30 border-rose-900/60 text-rose-300"
            }`}
          >
            {message.type === "success" && <Check className="w-4 h-4 text-emerald-400" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <div className="rounded-2xl border border-[#242428] bg-[#111113] p-6 sm:p-8 shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <User className="w-3.5 h-3.5 absolute right-2.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Username (Fixed)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="w-full bg-[#161618] border border-[#242428] text-zinc-400 rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm outline-none font-mono cursor-not-allowed opacity-80"
                  />
                  <AtSign className="w-3.5 h-3.5 absolute right-2.5 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Bio / Technical Focus
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Staff Engineer. Building distributed storage engines and high-throughput microservices..."
                rows={3}
                maxLength={300}
                className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-y"
              />
              <span className="text-[10px] text-zinc-500 font-mono">
                {bio.length} / 300 characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Skills & Technologies (comma separated)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="TypeScript, Next.js, Rust, MongoDB, Docker"
                  className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-mono"
                />
                <Code2 className="w-3.5 h-3.5 absolute right-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  GitHub Profile Link
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg px-3 py-1.5 pr-8 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                  />
                  <GithubIcon className="w-3.5 h-3.5 absolute right-2.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Website / Portfolio Link
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg px-3 py-1.5 pr-8 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                  />
                  <Globe className="w-3.5 h-3.5 absolute right-2.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Avatar Image URL
              </label>
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg px-3 py-1.5 pr-8 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                />
                <Image className="w-3.5 h-3.5 absolute right-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e1e24] flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-2 px-5 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
