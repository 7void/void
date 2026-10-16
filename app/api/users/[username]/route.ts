import { NextRequest, NextResponse } from "next/server";
import { getCollection, getDb } from "@/lib/db";
import { UserDoc, FollowDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const usersCol = await getCollection<UserDoc>("users");
    const user = await usersCol.findOne({ username: username.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    let isFollowing = false;
    let isSelf = false;

    if (currentUser) {
      isSelf = currentUser._id.equals(user._id);
      if (!isSelf) {
        const followsCol = await getCollection<FollowDoc>("follows");
        const existing = await followsCol.findOne({
          followerId: currentUser._id,
          followingId: user._id,
        });
        isFollowing = !!existing;
      }
    }

    const db = await getDb();
    // Fetch recent posts by this author
    const posts = await db
      .collection("posts")
      .find({ authorId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Fetch showcase projects by this author
    const projects = await db
      .collection("projects")
      .find({ authorId: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        github: user.github,
        website: user.website,
        skills: user.skills,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        projectsCount: user.projectsCount,
        createdAt: user.createdAt.toISOString(),
        isFollowing,
        isSelf,
      },
      posts: posts.map((p) => ({
        ...p,
        _id: p._id.toString(),
        authorId: p.authorId.toString(),
      })),
      projects: projects.map((pr) => ({
        ...pr,
        _id: pr._id.toString(),
        authorId: pr.authorId.toString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/users/[username] error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
