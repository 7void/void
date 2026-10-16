import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PostDoc, ProjectDoc, UserDoc } from "@/lib/types";

export async function GET() {
  try {
    const db = await getDb();

    // 1. Trending technologies aggregation across projects
    const techPipeline = [
      { $unwind: "$technologies" },
      {
        $group: {
          _id: "$technologies",
          projectCount: { $sum: 1 },
          totalStars: { $sum: "$starsCount" },
        },
      },
      { $sort: { projectCount: -1 as const, totalStars: -1 as const } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          technology: "$_id",
          projectCount: 1,
          totalStars: 1,
        },
      },
    ];
    const trendingTech = await db.collection<ProjectDoc>("projects").aggregate(techPipeline).toArray();

    // 2. Popular posts aggregation (weighted score = likes * 2 + comments * 3)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const popularPostsPipeline = [
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $ifNull: ["$likesCount", 0] }, 2] },
              { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 3] },
            ],
          },
        },
      },
      { $sort: { score: -1 as const } },
      { $limit: 5 },
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
          type: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          score: 1,
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
    const popularPosts = await db.collection<PostDoc>("posts").aggregate(popularPostsPipeline).toArray();

    // 3. Featured / Top Developers
    const topDevelopers = await db
      .collection<UserDoc>("users")
      .find({})
      .sort({ followersCount: -1, postsCount: -1 })
      .limit(6)
      .project({
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        bio: 1,
        skills: 1,
        followersCount: 1,
        projectsCount: 1,
      })
      .toArray();

    // 4. Platform Metrics
    const totalDevelopers = await db.collection("users").countDocuments();
    const totalProjects = await db.collection("projects").countDocuments();
    const totalPosts = await db.collection("posts").countDocuments();

    return NextResponse.json({
      trendingTech,
      popularPosts: popularPosts.map((p) => ({
        ...p,
        _id: p._id.toString(),
        author: {
          ...p.author,
          _id: p.author._id.toString(),
        },
      })),
      topDevelopers: topDevelopers.map((d) => ({
        ...d,
        _id: d._id.toString(),
      })),
      stats: {
        totalDevelopers,
        totalProjects,
        totalPosts,
        uptime: "99.98%",
      },
    });
  } catch (error) {
    console.error("GET /api/explore error:", error);
    return NextResponse.json({ error: "Failed to fetch explore metrics" }, { status: 500 });
  }
}
