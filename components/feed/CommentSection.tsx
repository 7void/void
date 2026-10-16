"use client";

import React, { useState, useEffect } from "react";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { CommentWithAuthor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post comment");
        setSubmitting(false);
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch {
      setError("Error adding comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch {
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[#1e1e24]">
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
        <MessageSquare className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* New Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contribute to this discussion..."
            className="flex-1 bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="py-1.5 px-3 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reply</span>
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-500">
          <a href="/login" className="text-[#8B5CF6] hover:underline font-medium">
            Sign in
          </a>{" "}
          to reply.
        </p>
      )}

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-zinc-500 font-mono">Loading discussion thread...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => {
            const isCommentAuthor = user?._id === comment.authorId || user?._id === comment.author?._id;
            return (
              <div
                key={comment._id}
                className="p-3 rounded-lg border border-[#1e1e24] bg-[#0d0d0f] flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <a href={`/profile/${comment.author?.username}`}>
                    <img
                      src={comment.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                      alt={comment.author?.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#282830]"
                    />
                  </a>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/profile/${comment.author?.username}`}
                        className="text-xs font-semibold text-white hover:text-[#a78bfa]"
                      >
                        {comment.author?.name}
                      </a>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        @{comment.author?.username}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {isCommentAuthor && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
