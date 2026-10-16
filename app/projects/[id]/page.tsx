"use client";

import React, { useState, useEffect, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Bookmark,
  Calendar,
  FolderGit2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          setBookmarked(data.project.hasBookmarked || false);
        } else {
          setError("Project not found");
        }
      } catch {
        setError("Error loading project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const prev = bookmarked;
    setBookmarked(!prev);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, itemType: "project" }),
      });
      if (!res.ok) setBookmarked(prev);
    } catch {
      setBookmarked(prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        <a
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg border border-[#242428] bg-[#111113]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </a>

        {loading ? (
          <div className="h-96 rounded-2xl border border-[#242428] bg-[#111113] animate-pulse"></div>
        ) : error || !project ? (
          <div className="rounded-2xl border border-[#242428] bg-[#111113] p-12 text-center space-y-3">
            <FolderGit2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Project Not Found</h2>
            <p className="text-xs text-zinc-400">{error || "Could not retrieve project."}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#242428] bg-[#111113] overflow-hidden shadow-2xl shadow-black/80 space-y-6">
            {project.imageUrl && (
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#16161a]">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-black/40 to-transparent"></div>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428]">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                    <a
                      href={`/profile/${project.author?.username}`}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <img
                        src={project.author?.avatar}
                        alt={project.author?.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#2c2c34]"
                      />
                      <span>{project.author?.name}</span>
                      <span className="font-mono text-zinc-500">@{project.author?.username}</span>
                    </a>
                    <span>•</span>
                    <div className="flex items-center gap-1 font-mono text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBookmark}
                    className={cn(
                      "p-2 rounded-lg border border-[#26262e] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono",
                      bookmarked ? "bg-[#2f1f24] text-[#8B5CF6]" : "bg-[#161618] text-zinc-400 hover:text-white"
                    )}
                  >
                    <Bookmark className={cn("w-4 h-4", bookmarked && "fill-[#8B5CF6]")} />
                    <span>{bookmarked ? "Saved" : "Save"}</span>
                  </button>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 bg-[#161618] hover:bg-[#1f1f26] border border-[#282830] text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-colors font-mono"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 font-mono"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <a
                      key={t}
                      href={`/projects?tech=${encodeURIComponent(t)}`}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-[#16161a] border border-[#282830] text-zinc-200 hover:text-[#a78bfa] hover:border-[#8B5CF6]/50 transition-colors"
                    >
                      {t}
                    </a>
                  ))}
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Overview & Architecture
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
