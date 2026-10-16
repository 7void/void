"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  Zap,
  Terminal,
  UserPlus,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface TrendingTech {
  technology: string;
  projectCount: number;
  totalStars: number;
}

interface DeveloperItem {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  skills: string[];
  followersCount: number;
}

export const SidebarTrending: React.FC = () => {
  const { user } = useAuth();
  const [techList, setTechList] = useState<TrendingTech[]>([]);
  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [stats, setStats] = useState<{
    totalDevelopers: number;
    totalProjects: number;
    totalPosts: number;
    uptime: string;
  } | null>(null);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await fetch("/api/explore");
        if (res.ok) {
          const data = await res.json();
          setTechList(data.trendingTech || []);
          setDevelopers((data.topDevelopers || []).filter((d: DeveloperItem) => d.username !== user?.username).slice(0, 4));
          setStats(data.stats || null);
        }
      } catch {
        // ignore
      }
    };
    fetchExplore();
  }, [user]);

  return (
    <aside className="space-y-4">
      {/* 1. Trending Technologies */}
      <div className="rounded-xl border border-[#242428] bg-[#111113] p-4 shadow-lg shadow-black/40 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e24]">
          <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-300">
            Trending Technologies
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {techList.length > 0 ? (
            techList.map((item) => (
              <a
                key={item.technology}
                href={`/projects?tech=${encodeURIComponent(item.technology)}`}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#242428] bg-[#141416] hover:bg-[#1c1c22] hover:border-[#8B5CF6]/50 transition-all text-xs"
              >
                <span className="font-mono text-zinc-300 group-hover:text-white">
                  {item.technology}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {item.projectCount}
                </span>
              </a>
            ))
          ) : (
            <p className="text-xs text-zinc-500 font-mono">Aggregating...</p>
          )}
        </div>
      </div>

      {/* 2. Top Developers to Follow */}
      <div className="rounded-xl border border-[#242428] bg-[#111113] p-4 shadow-lg shadow-black/40 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e24]">
          <Users className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-300">
            Developers to Discover
          </h3>
        </div>

        <div className="space-y-2.5">
          {developers.map((dev) => (
            <div key={dev._id} className="flex items-center justify-between gap-2">
              <a
                href={`/profile/${dev.username}`}
                className="flex items-center gap-2.5 min-w-0 group"
              >
                <img
                  src={dev.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                  alt={dev.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#282830] group-hover:border-[#8B5CF6] transition-colors"
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-white group-hover:text-[#a78bfa] transition-colors truncate">
                    {dev.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    @{dev.username}
                  </p>
                </div>
              </a>

              <a
                href={`/profile/${dev.username}`}
                className="py-1 px-2 text-[11px] font-medium border border-[#26262e] bg-[#141418] hover:bg-[#1e1e24] text-zinc-300 hover:text-white rounded-lg transition-colors shrink-0"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Platform Health / Stats */}
      <div className="rounded-xl border border-[#242428] bg-[#111113] p-4 shadow-lg shadow-black/40 space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e24]">
          <Terminal className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-300">
            Platform Metrics
          </h3>
        </div>

        <div className="font-mono text-xs space-y-1.5 text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Developers</span>
            <span className="text-emerald-400 font-semibold">{stats?.totalDevelopers || "6"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Projects</span>
            <span className="text-emerald-400 font-semibold">{stats?.totalProjects || "7"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discussions</span>
            <span className="text-blue-400 font-semibold">{stats?.totalPosts || "8"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Engine Uptime</span>
            <span className="text-amber-400 font-semibold">99.98%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarTrending;
