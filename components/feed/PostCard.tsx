"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  Copy,
  Check,
  Code2,
  HelpCircle,
  Sparkles,
  Rocket,
} from "lucide-react";
import { PostWithAuthor, PostType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostWithAuthor;
  onPostDeleted?: (postId: string) => void;
  showCommentsInline?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  showCommentsInline = false,
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post.hasBookmarked || false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Type configuration
  const typeConfig: Record<PostType, { label: string; icon: React.ElementType; color: string }> = {
    discussion: { label: "Discussion", icon: MessageSquare, color: "text-[#a78bfa] border-[#38265a] bg-[#1a1228]" },
    snippet: { label: "Code Snippet", icon: Code2, color: "text-emerald-400 border-emerald-900/60 bg-emerald-950/20" },
    question: { label: "Question", icon: HelpCircle, color: "text-amber-400 border-amber-900/60 bg-amber-950/20" },
    project_update: { label: "Project Update", icon: Rocket, color: "text-blue-400 border-blue-900/60 bg-blue-950/20" },
  };

  const currentType = typeConfig[post.type] || typeConfig.discussion;
  const TypeIcon = currentType.icon;

  const handleLike = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const prevLiked = liked;
    const prevCount = likesCount;

    // Optimistic update
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: post._id, targetType: "post" }),
      });
      if (!res.ok) {
        // Rollback
        setLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const prevBookmarked = bookmarked;
    setBookmarked(!prevBookmarked);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: post._id, itemType: "post" }),
      });
      if (!res.ok) {
        setBookmarked(prevBookmarked);
      }
    } catch {
      setBookmarked(prevBookmarked);
    }
  };

  const handleCopyCode = () => {
    if (post.codeSnippet?.code) {
      navigator.clipboard.writeText(post.codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(url);
    alert("Post link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok && onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch {
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = user?._id === post.authorId || user?._id === post.author?._id;

  return (
    <article className="rounded-xl border border-[#242428] bg-[#111113] p-4 sm:p-5 shadow-lg shadow-black/40 transition-all hover:border-[#34343d] flex flex-col justify-between space-y-3.5">
      {/* Header: Author & Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href={`/profile/${post.author?.username}`} className="shrink-0">
            <img
              src={post.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={post.author?.name || "Developer"}
              className="w-10 h-10 rounded-full object-cover border border-[#282830] hover:border-[#8B5CF6] transition-colors"
            />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <a
                href={`/profile/${post.author?.username}`}
                className="font-semibold text-sm text-white hover:text-[#a78bfa] transition-colors"
              >
                {post.author?.name}
              </a>
              <span className="text-zinc-500 font-mono text-xs">@{post.author?.username}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              <span>•</span>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium", currentType.color)}>
                <TypeIcon className="w-3 h-3" />
                <span>{currentType.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action: Delete if owner */}
        {isAuthor && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1a1416] transition-colors cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Post Title & Content */}
      <div className="space-y-2">
        <a href={`/posts/${post._id}`} className="group block">
          <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-[#a78bfa] transition-colors leading-snug">
            {post.title}
          </h2>
        </a>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Code Snippet Block (if present) */}
      {post.codeSnippet && post.codeSnippet.code && (
        <div className="rounded-xl border border-[#1e1e24] bg-[#0a0a0c] overflow-hidden my-2 shadow-inner">
          <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#18181f] bg-[#0e0e12] text-xs">
            <div className="flex items-center gap-2 text-zinc-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-1 text-[11px] text-zinc-400 font-medium">
                {post.codeSnippet.language || "code"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-[#16161c] hover:bg-[#202028] border border-[#262630] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed custom-scrollbar selection:bg-[#8B5CF6]/40">
            <code>{post.codeSnippet.code}</code>
          </pre>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <a
              key={tag}
              href={`/feed?tag=${encodeURIComponent(tag)}`}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#161618] hover:bg-[#1f1f26] border border-[#242428] text-zinc-400 hover:text-[#a78bfa] transition-colors"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}

      {/* Interactions Footer */}
      <div className="pt-2.5 border-t border-[#1e1e24] flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors cursor-pointer",
              liked
                ? "text-rose-400 bg-rose-950/30"
                : "hover:text-rose-400 hover:bg-[#1a1416]"
            )}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-rose-500 text-rose-500")} />
            <span className="font-medium font-mono text-xs">{likesCount}</span>
          </button>

          {/* Comment Button */}
          <a
            href={`/posts/${post._id}`}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-[#a78bfa] hover:bg-[#1a1528] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium font-mono text-xs">{post.commentsCount || 0}</span>
          </a>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-white hover:bg-[#161618] transition-colors cursor-pointer"
            title="Share post"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer",
            bookmarked
              ? "text-[#8B5CF6] bg-[#2f1f24]"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-[#161618]"
          )}
          title={bookmarked ? "Remove bookmark" : "Save bookmark"}
        >
          <Bookmark className={cn("w-4 h-4", bookmarked && "fill-[#8B5CF6]")} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
