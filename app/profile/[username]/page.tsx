"use client";

import React, { useState, useEffect, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileView } from "@/components/profile/ProfileView";
import { UserPublicProfile, PostWithAuthor, ProjectWithAuthor } from "@/lib/types";
import { Terminal } from "lucide-react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [projects, setProjects] = useState<ProjectWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setPosts(data.posts || []);
          setProjects(data.projects || []);
        } else {
          setError("Developer profile not found");
        }
      } catch {
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {loading ? (
          <div className="h-80 rounded-2xl border border-[#242428] bg-[#111113] animate-pulse"></div>
        ) : error || !profile ? (
          <div className="p-12 text-center rounded-2xl border border-[#242428] bg-[#111113] space-y-3">
            <Terminal className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Developer Not Found</h2>
            <p className="text-xs text-zinc-400">
              The user @{username} does not exist on VOID.
            </p>
            <a
              href="/explore"
              className="inline-block py-1.5 px-4 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg"
            >
              Discover Developers
            </a>
          </div>
        ) : (
          <ProfileView
            initialProfile={profile}
            initialPosts={posts}
            initialProjects={projects}
          />
        )}
      </main>
    </div>
  );
}
