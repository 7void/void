"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/feed/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  Compass,
  Search,
  TrendingUp,
  Flame,
  Users,
  FolderGit2,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { PostWithAuthor, ProjectWithAuthor } from "@/lib/types";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<{
    users: Array<{ _id: string; name: string; username: string; avatar: string; bio: string; skills: string[] }>;
    posts: PostWithAuthor[];
    projects: ProjectWithAuthor[];
  } | null>(null);

  const [trendingTech, setTrendingTech] = useState<Array<{ technology: string; projectCount: number; totalStars: number }>>([]);
  const [popularPosts, setPopularPosts] = useState<PostWithAuthor[]>([]);
  const [topDevelopers, setTopDevelopers] = useState<Array<{ _id: string; name: string; username: string; avatar: string; bio: string; skills: string[]; followersCount: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch explore aggregation data
    const fetchExplore = async () => {
      try {
        const res = await fetch("/api/explore");
        if (res.ok) {
          const data = await res.json();
          setTrendingTech(data.trendingTech || []);
          setPopularPosts(data.popularPosts || []);
          setTopDevelopers(data.topDevelopers || []);
        }
      } catch (err) {
        console.error("Explore fetch error:", err);
      }
    };
    fetchExplore();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#242428] bg-[#111113] p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6]">
            <Compass className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Explore VOID Ecosystem
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Search across developers, technical posts, and showcase projects. Powered by real-time MongoDB aggregations.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic, keyword, or developer name (e.g. 'MongoDB', 'Rust', 'Alex')..."
            className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* When Search Query is Active: Show Grouped Results */}
      {query.trim() ? (
        <div className="space-y-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Search Results for &quot;{query}&quot;</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              Querying MongoDB collections...
            </div>
          ) : searchResults ? (
            <div className="space-y-6">
              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Developers ({searchResults.users.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.users.map((u) => (
                      <a
                        key={u._id}
                        href={`/profile/${u.username}`}
                        className="p-3.5 rounded-xl border border-[#242428] bg-[#111113] hover:border-[#8B5CF6]/50 transition-colors flex items-center gap-3 group"
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#2c2c34]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-[#a78bfa] truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono truncate">
                            @{u.username}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {u.skills.join(", ")}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {searchResults.projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Projects ({searchResults.projects.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.projects.map((proj) => (
                      <ProjectCard key={proj._id} project={proj} />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchResults.posts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Posts ({searchResults.posts.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {searchResults.posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.users.length === 0 &&
                searchResults.projects.length === 0 &&
                searchResults.posts.length === 0 && (
                  <div className="p-10 rounded-2xl border border-[#242428] bg-[#111113] text-center text-zinc-400 text-xs">
                    No matching developers, posts, or projects found for &quot;{query}&quot;.
                  </div>
                )}
            </div>
          ) : null}
        </div>
      ) : (
        /* Default Explore View: Aggregations & Discoveries */
        <div className="space-y-8">
          {/* Trending Technologies Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Trending Technologies Across Showcase Projects
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trendingTech.map((t, idx) => (
                <a
                  key={t.technology}
                  href={`/projects?tech=${encodeURIComponent(t.technology)}`}
                  className="p-3.5 rounded-xl border border-[#242428] bg-[#111113] hover:border-[#8B5CF6]/50 hover:bg-[#16161a] transition-all group"
                >
                  <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px] mb-1">
                    <span>#{idx + 1}</span>
                    <span>{t.totalStars} stars</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">
                    {t.technology}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {t.projectCount} {t.projectCount === 1 ? "project" : "projects"}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Popular Discussions (Weighted Score) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Top Discussions This Month (MongoDB Pipeline Score)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularPosts.map((post) => (
                <a
                  key={post._id}
                  href={`/posts/${post._id}`}
                  className="p-4 rounded-xl border border-[#242428] bg-[#111113] hover:border-[#383842] transition-colors flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#a78bfa] bg-[#1d1628] px-2 py-0.5 rounded border border-[#34244a]">
                      {post.type}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors mt-2">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pt-2 border-t border-[#1e1e24]">
                    <span>By @{post.author?.username}</span>
                    <div className="flex items-center gap-3">
                      <span>{post.likesCount} likes</span>
                      <span>{post.commentsCount} comments</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Active Developers Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Developer Spotlight
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topDevelopers.map((dev) => (
                <div
                  key={dev._id}
                  className="p-4 rounded-xl border border-[#242428] bg-[#111113] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#2c2c34]"
                    />
                    <div className="min-w-0">
                      <a
                        href={`/profile/${dev.username}`}
                        className="text-xs font-semibold text-white hover:text-[#a78bfa] truncate block"
                      >
                        {dev.name}
                      </a>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        @{dev.username}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {dev.bio}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dev.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono bg-[#18181c] px-2 py-0.5 rounded text-zinc-400 border border-[#26262e]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/profile/${dev.username}`}
                    className="w-full text-center py-1.5 rounded-lg border border-[#26262e] bg-[#161618] hover:bg-[#1f1f26] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-mono">Loading Explore...</div>}>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
