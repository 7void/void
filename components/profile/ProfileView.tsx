"use client";

import React, { useState } from "react";
import {
  Globe,
  Calendar,
  Users,
  Code2,
  FolderGit2,
  UserPlus,
  Check,
  Edit,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { UserPublicProfile, PostWithAuthor, ProjectWithAuthor } from "@/lib/types";
import { PostCard } from "@/components/feed/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  initialProfile: UserPublicProfile;
  initialPosts: PostWithAuthor[];
  initialProjects: ProjectWithAuthor[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialProfile,
  initialPosts,
  initialProjects,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserPublicProfile>(initialProfile);
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [projects, setProjects] = useState<ProjectWithAuthor[]>(initialProjects);
  const [isFollowing, setIsFollowing] = useState(initialProfile.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(initialProfile.followersCount || 0);
  const [activeTab, setActiveTab] = useState<"posts" | "projects">("posts");
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setFollowLoading(true);
    const prev = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!prev);
    setFollowersCount(prev ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/users/${profile.username}/follow`, { method: "POST" });
      if (!res.ok) {
        setIsFollowing(prev);
        setFollowersCount(prevCount);
      }
    } catch {
      setIsFollowing(prev);
      setFollowersCount(prevCount);
    } finally {
      setFollowLoading(false);
    }
  };

  const isSelf = user?._id === profile._id || user?.username === profile.username;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#2c2c34] shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile.name}
                </h1>
                <span className="font-mono text-xs sm:text-sm text-zinc-400 bg-[#18181c] px-2.5 py-0.5 rounded-md border border-[#26262e]">
                  @{profile.username}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                {profile.bio || "Developer building on VOID."}
              </p>

              {/* Meta links */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono pt-1">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#a78bfa] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button: Follow / Unfollow or Edit */}
          <div>
            {isSelf ? (
              <a
                href="/settings"
                className="py-2 px-4 rounded-lg border border-[#242428] bg-[#161618] hover:bg-[#1d1d22] text-zinc-200 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={cn(
                  "py-2 px-4 rounded-lg text-xs font-medium transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5 cursor-pointer",
                  isFollowing
                    ? "border border-[#26262e] bg-[#161618] text-zinc-300 hover:text-rose-400 hover:border-rose-900/50"
                    : "bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-purple-600/20"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skills Pills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1e1e24] flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-mono mr-1">Skills:</span>
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#16161a] border border-[#26262e] text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1e1e24] font-mono">
          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#1e1e24] text-center">
            <p className="text-base sm:text-lg font-bold text-white">{followersCount}</p>
            <p className="text-[11px] text-zinc-500">Followers</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#1e1e24] text-center">
            <p className="text-base sm:text-lg font-bold text-white">{profile.followingCount || 0}</p>
            <p className="text-[11px] text-zinc-500">Following</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#1e1e24] text-center">
            <p className="text-base sm:text-lg font-bold text-white">{posts.length}</p>
            <p className="text-[11px] text-zinc-500">Posts</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#1e1e24] text-center">
            <p className="text-base sm:text-lg font-bold text-white">{projects.length}</p>
            <p className="text-[11px] text-zinc-500">Projects</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Posts / Projects */}
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
          <Code2 className="w-4 h-4 text-[#8B5CF6]" />
          <span>Posts ({posts.length})</span>
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
          <span>Projects ({projects.length})</span>
        </button>
      </div>

      {/* Content Feed */}
      {activeTab === "posts" ? (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={{
                  ...post,
                  author: {
                    _id: profile._id,
                    name: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                  },
                }}
                onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))
          ) : (
            <div className="p-8 text-center rounded-xl border border-[#242428] bg-[#111113] text-zinc-500">
              No technical posts published yet.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={{
                  ...project,
                  author: {
                    _id: profile._id,
                    name: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                  },
                }}
                onDelete={(id) => setProjects((prev) => prev.filter((p) => p._id !== id))}
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-center rounded-xl border border-[#242428] bg-[#111113] text-zinc-500">
              No showcase projects added yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
