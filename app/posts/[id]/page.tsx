"use client";

import React, { useState, useEffect, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/CommentSection";
import { SidebarTrending } from "@/components/feed/SidebarTrending";
import { PostWithAuthor } from "@/lib/types";
import { ArrowLeft, Terminal } from "lucide-react";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        } else {
          setError("Post not found");
        }
      } catch {
        setError("Error loading post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            {/* Back button */}
            <a
              href="/feed"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg border border-[#242428] bg-[#111113] hover:bg-[#161618]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Feed</span>
            </a>

            {loading ? (
              <div className="h-64 rounded-xl border border-[#242428] bg-[#111113] animate-pulse p-6"></div>
            ) : error || !post ? (
              <div className="rounded-2xl border border-[#242428] bg-[#111113] p-10 text-center space-y-3">
                <Terminal className="w-8 h-8 text-rose-400 mx-auto" />
                <h2 className="text-lg font-bold text-white">Post Not Found</h2>
                <p className="text-xs text-zinc-400">{error || "This post may have been removed."}</p>
                <a
                  href="/feed"
                  className="inline-block py-1.5 px-4 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg"
                >
                  Return to Feed
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <PostCard
                  post={post}
                  onPostDeleted={() => {
                    window.location.href = "/feed";
                  }}
                />
                <div className="rounded-xl border border-[#242428] bg-[#111113] p-4 sm:p-5 shadow-lg shadow-black/40">
                  <CommentSection postId={post._id} />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 sticky top-20">
            <SidebarTrending />
          </div>
        </div>
      </main>
    </div>
  );
}
