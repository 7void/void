"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Code2,
  HelpCircle,
  Rocket,
  Code,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { PostType, PostWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface PostComposerProps {
  onPostCreated?: (newPost: PostWithAuthor) => void;
  onClose?: () => void;
  className?: string;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onPostCreated,
  onClose,
  className,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className={cn("rounded-xl border border-[#242428] bg-[#111113] p-5 text-center space-y-3", className)}>
        <p className="text-zinc-400 text-sm">Sign in to join developer discussions and share snippets.</p>
        <a
          href="/login"
          className="inline-flex py-1.5 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-medium text-xs rounded-lg transition-colors"
        >
          Sign in to VOID
        </a>
      </div>
    );
  }

  const postTypes: { id: PostType; label: string; icon: React.ElementType }[] = [
    { id: "discussion", label: "Discussion", icon: MessageSquare },
    { id: "snippet", label: "Snippet", icon: Code2 },
    { id: "question", label: "Question", icon: HelpCircle },
    { id: "project_update", label: "Update", icon: Rocket },
  ];

  const languages = [
    "typescript",
    "javascript",
    "python",
    "rust",
    "go",
    "sql",
    "html",
    "css",
    "bash",
    "json",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        type,
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ["webdev"],
      };

      if ((showCodeSnippet || type === "snippet") && code.trim()) {
        payload.codeSnippet = {
          code: code.trim(),
          language,
        };
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setSubmitting(false);
        return;
      }

      // Reset form
      setTitle("");
      setContent("");
      setCode("");
      setTagsInput("");
      setShowCodeSnippet(false);

      if (onPostCreated) {
        onPostCreated(data.post);
      }
      if (onClose) {
        onClose();
      }
    } catch {
      setError("Network error while creating post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border border-[#242428] bg-[#111113] p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4", className)}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover border border-[#282830]"
          />
          <span className="text-xs font-semibold text-white">Create New Post</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Type Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {postTypes.map((pt) => {
          const Icon = pt.icon;
          const isActive = type === pt.id;
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => {
                setType(pt.id);
                if (pt.id === "snippet") setShowCodeSnippet(true);
              }}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                isActive
                  ? "bg-[#2f1f24] text-white border border-[#8B5CF6]/40 shadow-sm"
                  : "bg-[#161618] text-zinc-400 hover:text-white border border-[#242428] hover:bg-[#1a1a20]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#a78bfa]" : "text-zinc-500")} />
              <span>{pt.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title: What are you building or discussing?"
            required
            className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, architectural decisions, questions, or details..."
            rows={4}
            required
            className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all resize-y min-h-[90px]"
          />
        </div>

        {/* Toggle Code Snippet Area */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCodeSnippet(!showCodeSnippet)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#a78bfa] transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>{showCodeSnippet ? "Hide code snippet" : "Attach code snippet"}</span>
          </button>

          {showCodeSnippet && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#141416] border border-[#26262a] rounded-lg px-2.5 py-1 text-xs text-zinc-300 outline-none font-mono"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Code Snippet Box */}
        {showCodeSnippet && (
          <div className="rounded-xl border border-[#1e1e24] bg-[#0a0a0c] p-2 space-y-2">
            <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500">
              <span>void // code editor ({language})</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code snippet here..."
              rows={5}
              spellCheck={false}
              className="w-full bg-transparent border-none text-xs font-mono text-zinc-200 placeholder-zinc-600 outline-none resize-y p-2 leading-relaxed"
            />
          </div>
        )}

        {/* Tags Field */}
        <div>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags: mongodb, typescript, rust (comma-separated)"
            className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-all font-mono"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-500 font-mono">
            Markdown formatted
          </span>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-1.5 px-3 rounded-lg border border-[#242428] text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="py-1.5 px-4 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-60 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Publishing..." : "Publish Post"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
