import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { PostDoc, CommentDoc, NotificationDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

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
    const commentsCol = db.collection<CommentDoc>("comments");

    const pipeline = [
      { $match: { postId: postObjectId } },
      { $sort: { createdAt: 1 as const } },
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
          postId: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            username: "$author.username",
            avatar: "$author.avatar",
          },
        },
      },
    ];

    const comments = await commentsCol.aggregate(pipeline).toArray();

    return NextResponse.json({
      comments: comments.map((c) => ({
        ...c,
        _id: c._id.toString(),
        postId: c.postId.toString(),
        author: {
          ...c.author,
          _id: c.author._id.toString(),
        },
      })),
    });
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
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

    const body = await req.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const commentsCol = await getCollection<CommentDoc>("comments");
    const newComment: Omit<CommentDoc, "_id"> = {
      postId: postObjectId,
      authorId: currentUser._id,
      content: result.data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await commentsCol.insertOne(newComment as CommentDoc);
    const commentId = insertResult.insertedId;

    // Increment commentsCount atomically
    await postsCol.updateOne({ _id: postObjectId }, { $inc: { commentsCount: 1 } });

    // Create notification for post author if not commenting on own post
    if (!post.authorId.equals(currentUser._id)) {
      const notifsCol = await getCollection<NotificationDoc>("notifications");
      await notifsCol.insertOne({
        _id: new ObjectId(),
        recipientId: post.authorId,
        actorId: currentUser._id,
        type: "comment",
        entityId: postObjectId,
        entityType: "post",
        message: `commented on your post "${post.title.substring(0, 40)}${post.title.length > 40 ? "..." : ""}"`,
        read: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: {
          ...newComment,
          _id: commentId.toString(),
          postId: id,
          author: {
            _id: currentUser._id.toString(),
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
