"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { ProjectWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  FolderGit2,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"stars" | "recent">("stars");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithAuthor | null>(null);

  const techFilters = [
    "all",
    "TypeScript",
    "Rust",
    "Go",
    "Python",
    "React",
    "Next.js",
    "Docker",
    "MongoDB",
    "WebGL",
  ];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (selectedTech !== "all") {
        params.append("tech", selectedTech);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTech, sort, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleProjectSaved = (saved: ProjectWithAuthor) => {
    if (editingProject) {
      setProjects((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
    } else {
      setProjects((prev) => [saved, ...prev]);
    }
    setEditingProject(null);
  };

  const handleProjectDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Hero / Header Section */}
        <div className="rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-7 shadow-2xl shadow-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#18181c] border border-[#282830] text-[#8B5CF6]">
                <FolderGit2 className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Project Discovery
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Explore open source libraries, developer tools, and web applications built by the VOID community.
            </p>
          </div>

          <div className="relative z-10">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  window.location.href = "/login";
                  return;
                }
                setEditingProject(null);
                setModalOpen(true);
              }}
              className="py-2 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Showcase Project</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="rounded-xl border border-[#242428] bg-[#111113] p-4 shadow-lg shadow-black/40 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by title, stack, or keyword..."
                className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
            </form>

            {/* Sort Switcher */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <span className="text-xs text-zinc-500 font-mono hidden sm:inline">Sort:</span>
              <div className="flex items-center gap-1 bg-[#161618] p-1 rounded-lg border border-[#242428]">
                <button
                  type="button"
                  onClick={() => setSort("stars")}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    sort === "stars" ? "bg-[#2f1f24] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSort("recent")}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    sort === "recent" ? "bg-[#2f1f24] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Recent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Technology stack filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 custom-scrollbar">
            <span className="text-xs text-zinc-500 font-mono shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#8B5CF6]" />
              <span>Stack:</span>
            </span>
            {techFilters.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTech(t)}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-mono transition-colors shrink-0 cursor-pointer",
                  selectedTech === t
                    ? "bg-[#2f1f24] text-white border border-[#8B5CF6]/50 shadow-sm"
                    : "bg-[#141416] text-zinc-400 hover:text-white border border-[#242428] hover:bg-[#1c1c22]"
                )}
              >
                {t === "all" ? "All Technologies" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl border border-[#202024] bg-[#111113]/50 animate-pulse p-4 space-y-3"
              >
                <div className="h-36 rounded bg-[#18181c]"></div>
                <div className="w-2/3 h-4 rounded bg-[#18181c]"></div>
                <div className="w-full h-8 rounded bg-[#18181c]"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-[#242428] bg-[#111113] p-12 text-center space-y-3">
            <FolderGit2 className="w-10 h-10 text-[#8B5CF6] mx-auto opacity-70" />
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No projects match &apos;{selectedTech !== "all" ? selectedTech : search}&apos;. Try selecting another technology filter or clear your search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTech("all");
                setSearch("");
              }}
              className="py-1.5 px-4 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <ProjectCard
                key={proj._id}
                project={proj}
                onEdit={(p) => {
                  setEditingProject(p);
                  setModalOpen(true);
                }}
                onDelete={handleProjectDeleted}
              />
            ))}
          </div>
        )}
      </main>

      {/* Project Creation/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onProjectSaved={handleProjectSaved}
        initialProject={editingProject}
      />
    </div>
  );
}
