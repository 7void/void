"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Star,
  Bookmark,
  Trash2,
  Edit,
  FolderGit2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { ProjectWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectWithAuthor;
  onEdit?: (project: ProjectWithAuthor) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(project.hasBookmarked || false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        body: JSON.stringify({ itemId: project._id, itemType: "project" }),
      });
      if (!res.ok) setBookmarked(prev);
    } catch {
      setBookmarked(prev);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method: "DELETE" });
      if (res.ok && onDelete) {
        onDelete(project._id);
      }
    } catch {
      alert("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = user?._id === project.authorId || user?._id === project.author?._id;

  return (
    <div className="group rounded-xl border border-[#242428] bg-[#111113] overflow-hidden shadow-lg shadow-black/40 hover:border-[#383842] transition-all flex flex-col justify-between">
      {/* Optional Project Banner Image */}
      {project.imageUrl && (
        <a href={`/projects/${project._id}`} className="block relative h-40 w-full overflow-hidden bg-[#16161a]">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent"></div>
        </a>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header row: Author and Bookmark */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <a
              href={`/profile/${project.author?.username}`}
              className="flex items-center gap-2 group/author"
            >
              <img
                src={project.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                alt={project.author?.name}
                className="w-6 h-6 rounded-full object-cover border border-[#282830]"
              />
              <span className="text-xs text-zinc-400 group-hover/author:text-white font-mono">
                @{project.author?.username}
              </span>
            </a>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleBookmark}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  bookmarked ? "text-[#8B5CF6] bg-[#2f1f24]" : "text-zinc-500 hover:text-zinc-300"
                )}
                title={bookmarked ? "Bookmarked" : "Bookmark project"}
              >
                <Bookmark className={cn("w-3.5 h-3.5", bookmarked && "fill-[#8B5CF6]")} />
              </button>

              {isAuthor && (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Project Title */}
          <a href={`/projects/${project._id}`} className="block">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#a78bfa] transition-colors leading-snug">
              {project.title}
            </h3>
          </a>

          {/* Project Description */}
          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((tech) => (
              <a
                key={tech}
                href={`/projects?tech=${encodeURIComponent(tech)}`}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#16161a] hover:bg-[#202028] border border-[#242428] text-zinc-300 hover:text-[#a78bfa] transition-colors"
              >
                {tech}
              </a>
            ))}
            {project.technologies.length > 5 && (
              <span className="text-[10px] text-zinc-500 font-mono self-center">
                +{project.technologies.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Links & Stats */}
      <div className="px-4 sm:px-5 py-3 border-t border-[#1e1e24] bg-[#0c0c0e] flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>{project.starsCount || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg border border-[#26262e] bg-[#141418] hover:bg-[#1e1e24] text-zinc-200 hover:text-white text-xs font-mono transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/30 text-[#a78bfa] hover:text-white text-xs font-mono transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
