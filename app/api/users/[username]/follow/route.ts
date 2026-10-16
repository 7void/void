import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { UserDoc, FollowDoc, NotificationDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const usersCol = await getCollection<UserDoc>("users");
    const targetUser = await usersCol.findOne({ username: username.toLowerCase() });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const followsCol = await getCollection<FollowDoc>("follows");
    const existingFollow = await followsCol.findOne({
      followerId: currentUser._id,
      followingId: targetUser._id,
    });

    if (existingFollow) {
      // Unfollow
      await followsCol.deleteOne({ _id: existingFollow._id });

      // Atomic decrements
      await usersCol.updateOne({ _id: currentUser._id }, { $inc: { followingCount: -1 } });
      await usersCol.updateOne({ _id: targetUser._id }, { $inc: { followersCount: -1 } });

      return NextResponse.json({
        following: false,
        message: `Unfollowed @${targetUser.username}`,
      });
    } else {
      // Follow
      await followsCol.insertOne({
        _id: new ObjectId(),
        followerId: currentUser._id,
        followingId: targetUser._id,
        createdAt: new Date(),
      });

      // Atomic increments
      await usersCol.updateOne({ _id: currentUser._id }, { $inc: { followingCount: 1 } });
      await usersCol.updateOne({ _id: targetUser._id }, { $inc: { followersCount: 1 } });

      // Create notification
      const notifsCol = await getCollection<NotificationDoc>("notifications");
      await notifsCol.insertOne({
        _id: new ObjectId(),
        recipientId: targetUser._id,
        actorId: currentUser._id,
        type: "follow",
        entityId: currentUser._id,
        entityType: "user",
        message: "started following you",
        read: false,
        createdAt: new Date(),
      });

      return NextResponse.json({
        following: true,
        message: `Now following @${targetUser.username}`,
      });
    }
  } catch (error) {
    console.error("POST follow error:", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}
