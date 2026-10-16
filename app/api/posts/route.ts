import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Filter } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { PostDoc, UserDoc, FollowDoc, LikeDoc, BookmarkDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const feedType = searchParams.get("feed") || "all";
    const postType = searchParams.get("type");
    const tag = searchParams.get("tag");
    const authorUsername = searchParams.get("author");
    const search = searchParams.get("search");

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?._id;

    const matchConditions: Filter<PostDoc> = {};

    if (postType) {
      matchConditions.type = postType as PostDoc["type"];
    }

    if (tag) {
      matchConditions.tags = tag;
    }

    if (search) {
      matchConditions.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (authorUsername) {
      const usersCol = await getCollection<UserDoc>("users");
      const targetUser = await usersCol.findOne({ username: authorUsername });
      if (targetUser) {
        matchConditions.authorId = targetUser._id;
      } else {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
    }

    // Following feed filter
    if (feedType === "following") {
      if (!currentUserId) {
        return NextResponse.json({ error: "Authentication required for following feed" }, { status: 401 });
      }

      const followsCol = await getCollection<FollowDoc>("follows");
      const followingDocs = await followsCol.find({ followerId: currentUserId }).toArray();
      const followingIds = followingDocs.map((f) => f.followingId);

      // Include self and following
      matchConditions.authorId = { $in: [...followingIds, currentUserId] };
    }

    const db = await getDb();
    const postsCol = db.collection<PostDoc>("posts");

    const total = await postsCol.countDocuments(matchConditions);
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: matchConditions },
      { $sort: { createdAt: -1 as const } },
      { $skip: skip },
      { $limit: limit },
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
          updatedAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            username: "$author.username",
            avatar: "$author.avatar",
            bio: "$author.bio",
            skills: "$author.skills",
          },
        },
      },
    ];

    const posts = await postsCol.aggregate(pipeline).toArray();

    // Attach hasLiked and hasBookmarked if user is authenticated
    let likedPostIds = new Set<string>();
    let bookmarkedPostIds = new Set<string>();

    if (currentUserId && posts.length > 0) {
      const postObjectIds = posts.map((p) => p._id);

      const likesCol = await getCollection<LikeDoc>("likes");
      const userLikes = await likesCol
        .find({
          userId: currentUserId,
          targetType: "post",
          targetId: { $in: postObjectIds },
        })
        .toArray();
      likedPostIds = new Set(userLikes.map((l) => l.targetId.toString()));

      const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
      const userBookmarks = await bookmarksCol
        .find({
          userId: currentUserId,
          itemType: "post",
          itemId: { $in: postObjectIds },
        })
        .toArray();
      bookmarkedPostIds = new Set(userBookmarks.map((b) => b.itemId.toString()));
    }

    const formattedPosts = posts.map((p) => ({
      ...p,
      _id: p._id.toString(),
      author: {
        ...p.author,
        _id: p.author._id.toString(),
      },
      hasLiked: likedPostIds.has(p._id.toString()),
      hasBookmarked: bookmarkedPostIds.has(p._id.toString()),
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, title, content, tags, codeSnippet } = result.data;
    const postsCol = await getCollection<PostDoc>("posts");
    const usersCol = await getCollection<UserDoc>("users");

    const newPost: Omit<PostDoc, "_id"> = {
      authorId: currentUser._id,
      type,
      title,
      content,
      tags: tags.map((t) => t.trim().toLowerCase()),
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(codeSnippet && codeSnippet.code.trim() ? { codeSnippet } : {}),
    };

    const insertResult = await postsCol.insertOne(newPost as PostDoc);
    const postId = insertResult.insertedId;

    // Atomically increment user's postsCount
    await usersCol.updateOne({ _id: currentUser._id }, { $inc: { postsCount: 1 } });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          ...newPost,
          _id: postId.toString(),
          author: {
            _id: currentUser._id.toString(),
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
          hasLiked: false,
          hasBookmarked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
