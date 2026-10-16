"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/feed/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { PostWithAuthor, ProjectWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Bookmark, MessageSquare, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "projects">("posts");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [projects, setProjects] = useState<ProjectWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const res = await fetch("/api/bookmarks");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-7 shadow-2xl shadow-black/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6]">
            <Bookmark className="w-5 h-5 fill-[#8B5CF6]/30" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Saved Bookmarks
            </h1>
            <p className="text-xs text-zinc-400">
              Technical posts and showcase projects saved for later reference.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-b border-[#242428] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
              activeTab === "posts"
                ? "bg-[#2f1f24] text-white border border-[#8B5CF6]/50"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
            <span>Saved Posts ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
              activeTab === "projects"
                ? "bg-[#2f1f24] text-white border border-[#8B5CF6]/50"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <FolderGit2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>Saved Projects ({projects.length})</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 rounded-xl border border-[#242428] bg-[#111113] animate-pulse"></div>
        ) : activeTab === "posts" ? (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
                />
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl border border-[#242428] bg-[#111113] text-zinc-400 space-y-2">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-medium">No saved posts yet</p>
                <p className="text-xs text-zinc-500">
                  Click the bookmark icon on any post in your feed to save it here.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  onDelete={(id) => setProjects((prev) => prev.filter((p) => p._id !== id))}
                />
              ))
            ) : (
              <div className="col-span-full p-12 text-center rounded-2xl border border-[#242428] bg-[#111113] text-zinc-400 space-y-2">
                <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-medium">No saved projects yet</p>
                <p className="text-xs text-zinc-500">
                  Save interesting repositories and demos from the Project Discovery page.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
