import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { PostDoc, UserDoc, LikeDoc, BookmarkDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const postObjectId = new ObjectId(id);
    const db = await getDb();
    const postsCol = db.collection<PostDoc>("posts");

    const pipeline = [
      { $match: { _id: postObjectId } },
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

    const results = await postsCol.aggregate(pipeline).toArray();
    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = results[0];
    const currentUser = await getCurrentUser();
    let hasLiked = false;
    let hasBookmarked = false;

    if (currentUser) {
      const likesCol = await getCollection<LikeDoc>("likes");
      const existingLike = await likesCol.findOne({
        userId: currentUser._id,
        targetType: "post",
        targetId: postObjectId,
      });
      hasLiked = !!existingLike;

      const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
      const existingBookmark = await bookmarksCol.findOne({
        userId: currentUser._id,
        itemType: "post",
        itemId: postObjectId,
      });
      hasBookmarked = !!existingBookmark;
    }

    return NextResponse.json({
      post: {
        ...post,
        _id: post._id.toString(),
        author: {
          ...post.author,
          _id: post.author._id.toString(),
        },
        hasLiked,
        hasBookmarked,
      },
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const postObjectId = new ObjectId(id);
    const postsCol = await getCollection<PostDoc>("posts");
    const post = await postsCol.findOne({ _id: postObjectId });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.authorId.equals(currentUser._id)) {
      return NextResponse.json({ error: "Forbidden: You are not the author" }, { status: 403 });
    }

    // Delete post
    await postsCol.deleteOne({ _id: postObjectId });

    // Decrement user's postsCount atomically
    const usersCol = await getCollection<UserDoc>("users");
    await usersCol.updateOne({ _id: currentUser._id }, { $inc: { postsCount: -1 } });

    // Cleanup associated comments, likes, and bookmarks
    const db = await getDb();
    await db.collection("comments").deleteMany({ postId: postObjectId });
    await db.collection("likes").deleteMany({ targetType: "post", targetId: postObjectId });
    await db.collection("bookmarks").deleteMany({ itemType: "post", itemId: postObjectId });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
