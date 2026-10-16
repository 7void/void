import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { CommentDoc, PostDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

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
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    const commentObjectId = new ObjectId(id);
    const commentsCol = await getCollection<CommentDoc>("comments");
    const comment = await commentsCol.findOne({ _id: commentObjectId });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!comment.authorId.equals(currentUser._id)) {
      return NextResponse.json({ error: "Forbidden: You are not the author" }, { status: 403 });
    }

    await commentsCol.deleteOne({ _id: commentObjectId });

    // Decrement commentsCount on the post atomically
    const postsCol = await getCollection<PostDoc>("posts");
    await postsCol.updateOne({ _id: comment.postId }, { $inc: { commentsCount: -1 } });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DELETE comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
