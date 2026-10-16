import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { BookmarkDoc, PostDoc, ProjectDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
    const bookmarks = await bookmarksCol
      .find({ userId: currentUser._id })
      .sort({ createdAt: -1 })
      .toArray();

    const postIds = bookmarks.filter((b) => b.itemType === "post").map((b) => b.itemId);
    const projectIds = bookmarks.filter((b) => b.itemType === "project").map((b) => b.itemId);

    const db = await getDb();

    // Fetch posts with authors
    const postPipeline = [
      { $match: { _id: { $in: postIds } } },
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
          codeSnippet: 1,
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

    // Fetch projects with authors
    const projectPipeline = [
      { $match: { _id: { $in: projectIds } } },
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
      posts: posts.map((p) => ({
        ...p,
        _id: p._id.toString(),
        author: {
          ...p.author,
          _id: p.author._id.toString(),
        },
        hasBookmarked: true,
      })),
      projects: projects.map((pr) => ({
        ...pr,
        _id: pr._id.toString(),
        author: {
          ...pr.author,
          _id: pr.author._id.toString(),
        },
        hasBookmarked: true,
      })),
    });
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, itemType } = body;

    if (!itemId || !ObjectId.isValid(itemId) || !["post", "project"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid itemId or itemType" }, { status: 400 });
    }

    const itemObjectId = new ObjectId(itemId);
    const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");

    const existing = await bookmarksCol.findOne({
      userId: currentUser._id,
      itemType,
      itemId: itemObjectId,
    });

    if (existing) {
      await bookmarksCol.deleteOne({ _id: existing._id });
      return NextResponse.json({ bookmarked: false, message: "Removed from bookmarks" });
    } else {
      await bookmarksCol.insertOne({
        _id: new ObjectId(),
        userId: currentUser._id,
        itemType,
        itemId: itemObjectId,
        createdAt: new Date(),
      });
      return NextResponse.json({ bookmarked: true, message: "Saved to bookmarks" });
    }
  } catch (error) {
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
