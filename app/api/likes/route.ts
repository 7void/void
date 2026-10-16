import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { LikeDoc, PostDoc, NotificationDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetId, targetType = "post" } = body;

    if (!targetId || !ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Valid targetId is required" }, { status: 400 });
    }

    const targetObjectId = new ObjectId(targetId);
    const likesCol = await getCollection<LikeDoc>("likes");
    const postsCol = await getCollection<PostDoc>("posts");

    const existingLike = await likesCol.findOne({
      userId: currentUser._id,
      targetType,
      targetId: targetObjectId,
    });

    if (existingLike) {
      // Unlike
      await likesCol.deleteOne({ _id: existingLike._id });
      if (targetType === "post") {
        await postsCol.updateOne({ _id: targetObjectId }, { $inc: { likesCount: -1 } });
      }
      return NextResponse.json({ liked: false, message: "Unliked successfully" });
    } else {
      // Like
      await likesCol.insertOne({
        _id: new ObjectId(),
        userId: currentUser._id,
        targetType,
        targetId: targetObjectId,
        createdAt: new Date(),
      });

      if (targetType === "post") {
        const post = await postsCol.findOneAndUpdate(
          { _id: targetObjectId },
          { $inc: { likesCount: 1 } },
          { returnDocument: "after" }
        );

        // Notify post author if not self
        if (post && !post.authorId.equals(currentUser._id)) {
          const notifsCol = await getCollection<NotificationDoc>("notifications");
          await notifsCol.insertOne({
            _id: new ObjectId(),
            recipientId: post.authorId,
            actorId: currentUser._id,
            type: "like",
            entityId: targetObjectId,
            entityType: "post",
            message: `liked your post "${post.title.substring(0, 40)}${post.title.length > 40 ? "..." : ""}"`,
            read: false,
            createdAt: new Date(),
          });
        }
      }

      return NextResponse.json({ liked: true, message: "Liked successfully" });
    }
  } catch (error) {
    console.error("POST /api/likes error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
