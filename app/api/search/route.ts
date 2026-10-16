import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { UserDoc, PostDoc, ProjectDoc } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ users: [], posts: [], projects: [] });
    }

    const regex = new RegExp(q, "i");
    const db = await getDb();

    // 1. Search Users
    const users = await db
      .collection<UserDoc>("users")
      .find({
        $or: [{ name: regex }, { username: regex }, { skills: regex }, { bio: regex }],
      })
      .project({
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        bio: 1,
        skills: 1,
        followersCount: 1,
      })
      .limit(6)
      .toArray();

    // 2. Search Posts with author lookup
    const postPipeline = [
      {
        $match: {
          $or: [{ title: regex }, { tags: regex }, { content: regex }],
        },
      },
      { $sort: { createdAt: -1 as const } },
      { $limit: 8 },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          content: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            username: "$author.username",
            avatar: "$author.avatar",
          },
        },
      },
    ];
    const posts = await db.collection<PostDoc>("posts").aggregate(postPipeline).toArray();

    // 3. Search Projects with author lookup
    const projectPipeline = [
      {
        $match: {
          $or: [{ title: regex }, { description: regex }, { technologies: regex }],
        },
      },
      { $sort: { starsCount: -1 as const } },
      { $limit: 8 },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          technologies: 1,
          githubUrl: 1,
          liveUrl: 1,
          imageUrl: 1,
          starsCount: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            username: "$author.username",
            avatar: "$author.avatar",
          },
        },
      },
    ];
    const projects = await db.collection<ProjectDoc>("projects").aggregate(projectPipeline).toArray();

    return NextResponse.json({
      users: users.map((u) => ({ ...u, _id: u._id.toString() })),
      posts: posts.map((p) => ({
        ...p,
        _id: p._id.toString(),
        author: { ...p.author, _id: p.author._id.toString() },
      })),
      projects: projects.map((pr) => ({
        ...pr,
        _id: pr._id.toString(),
        author: { ...pr.author, _id: pr.author._id.toString() },
      })),
    });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
