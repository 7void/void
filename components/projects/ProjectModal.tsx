"use client";

import React, { useState, useEffect } from "react";
import { X, FolderGit2, Sparkles, ExternalLink, Image as ImageIcon } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { ProjectWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (project: ProjectWithAuthor) => void;
  initialProject?: ProjectWithAuthor | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectSaved,
  initialProject,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setTechnologies(initialProject.technologies.join(", "));
      setGithubUrl(initialProject.githubUrl);
      setLiveUrl(initialProject.liveUrl || "");
      setImageUrl(initialProject.imageUrl || "");
    } else {
      setTitle("");
      setDescription("");
      setTechnologies("TypeScript, Next.js, MongoDB");
      setGithubUrl("https://github.com/");
      setLiveUrl("");
      setImageUrl("");
    }
    setError(null);
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !githubUrl.trim()) {
      setError("Please fill in title, description, and GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError(null);

    const techArray = technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      technologies: techArray.length > 0 ? techArray : ["TypeScript"],
      githubUrl: githubUrl.trim(),
      liveUrl: liveUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      const url = initialProject ? `/api/projects/${initialProject._id}` : "/api/projects";
      const method = initialProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save project");
        setLoading(false);
        return;
      }

      onProjectSaved(data.project || { ...initialProject, ...payload });
      onClose();
    } catch {
      setError("Network error while saving project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-6 shadow-2xl shadow-black/90 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#202026]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6]">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-white">
                {initialProject ? "Edit Project" : "Showcase New Project"}
              </h2>
              <p className="text-xs text-zinc-400">
                Share your open source tools, frameworks, and demos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HyperGrid WebGL"
              required
              className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem it solves, architecture, and performance..."
              rows={3}
              required
              className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Technology Stack (comma separated) *
            </label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Rust, Tokio, gRPC, Docker"
              required
              className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                GitHub Repository URL *
              </label>
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  required
                  className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
                <GithubIcon className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Live Demo URL (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
                <ExternalLink className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Cover Image URL (Optional)
            </label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <ImageIcon className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e1e24]">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg border border-[#242428] text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
            >
              {loading ? "Saving..." : initialProject ? "Update Project" : "Publish Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
