"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { SidebarTrending } from "@/components/feed/SidebarTrending";
import { PostWithAuthor, PostType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Users, MessageSquare, Plus, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<"all" | "following">("all");
  const [selectedType, setSelectedType] = useState<PostType | "all">("all");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [composerOpen, setComposerOpen] = useState(false);

  const fetchPosts = useCallback(async (currentPage = 1, currentFeed = feedType, currentType = selectedType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        feed: currentFeed,
      });

      if (currentType !== "all") {
        params.append("type", currentType);
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (currentPage === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }
        setTotalPages(data.totalPages || 1);
        setPage(currentPage);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [feedType, selectedType]);

  useEffect(() => {
    fetchPosts(1, feedType, selectedType);
  }, [fetchPosts, feedType, selectedType]);

  const handlePostCreated = (newPost: PostWithAuthor) => {
    setPosts((prev) => [newPost, ...prev]);
    setComposerOpen(false);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const typeFilters: { id: PostType | "all"; label: string }[] = [
    { id: "all", label: "All Posts" },
    { id: "discussion", label: "Discussions" },
    { id: "snippet", label: "Snippets" },
    { id: "question", label: "Questions" },
    { id: "project_update", label: "Updates" },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar onOpenNewPost={() => setComposerOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column (~65%) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Feed Control Bar */}
            <div className="rounded-xl border border-[#242428] bg-[#111113] p-3 shadow-lg shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tab Switcher: All vs Following */}
              <div className="flex items-center gap-1 bg-[#161618] p-1 rounded-lg border border-[#242428]">
                <button
                  type="button"
                  onClick={() => setFeedType("all")}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    feedType === "all"
                      ? "bg-[#2f1f24] text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Global Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      window.location.href = "/login";
                      return;
                    }
                    setFeedType("following");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    feedType === "following"
                      ? "bg-[#2f1f24] text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Following</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                {typeFilters.map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setSelectedType(tf.id)}
                    className={cn(
                      "py-1 px-2.5 rounded-lg text-[11px] font-mono transition-colors shrink-0 cursor-pointer",
                      selectedType === tf.id
                        ? "bg-[#1f1a28] text-[#a78bfa] border border-[#38265a]"
                        : "text-zinc-400 hover:text-white hover:bg-[#18181c]"
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Post Composer */}
            {user && (
              <div className="transition-all">
                {composerOpen ? (
                  <PostComposer
                    onPostCreated={handlePostCreated}
                    onClose={() => setComposerOpen(false)}
                  />
                ) : (
                  <div
                    onClick={() => setComposerOpen(true)}
                    className="rounded-xl border border-[#242428] bg-[#111113] p-3.5 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:border-[#383842] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#282830]"
                      />
                      <span className="text-xs text-zinc-500 font-mono">
                        void ~ $ share code or start a discussion...
                      </span>
                    </div>
                    <button
                      type="button"
                      className="py-1 px-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Posts Stream */}
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-xl border border-[#202024] bg-[#111113]/50 animate-pulse p-5 space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#18181c]"></div>
                      <div className="space-y-2 flex-1">
                        <div className="w-32 h-3.5 rounded bg-[#18181c]"></div>
                        <div className="w-20 h-2.5 rounded bg-[#18181c]"></div>
                      </div>
                    </div>
                    <div className="w-3/4 h-4 rounded bg-[#18181c]"></div>
                    <div className="w-full h-12 rounded bg-[#18181c]"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-[#242428] bg-[#111113] p-10 text-center space-y-3">
                <Terminal className="w-8 h-8 text-[#8B5CF6] mx-auto opacity-70" />
                <h3 className="text-base font-semibold text-white">No posts found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {feedType === "following"
                    ? "You aren't following anyone with recent posts yet. Check out the Global Feed to discover developers!"
                    : "Be the first to start a technical discussion or share a code snippet!"}
                </p>
                {feedType === "following" && (
                  <button
                    type="button"
                    onClick={() => setFeedType("all")}
                    className="py-1.5 px-4 rounded-lg bg-[#8B5CF6] text-white text-xs font-medium cursor-pointer"
                  >
                    Switch to Global Feed
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}

                {/* Pagination button */}
                {page < totalPages && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => fetchPosts(page + 1, feedType, selectedType)}
                      disabled={loading}
                      className="py-2 px-6 rounded-lg border border-[#282830] bg-[#141418] hover:bg-[#1e1e24] text-zinc-200 text-xs font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Load More Posts</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Column (~35%) */}
          <div className="lg:col-span-4 sticky top-20">
            <SidebarTrending />
          </div>
        </div>
      </main>
    </div>
  );
}
