import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { NotificationDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const notifsCol = db.collection<NotificationDoc>("notifications");

    const pipeline = [
      { $match: { recipientId: currentUser._id } },
      { $sort: { createdAt: -1 as const } },
      { $limit: 30 },
      {
        $lookup: {
          from: "users",
          localField: "actorId",
          foreignField: "_id",
          as: "actor",
        },
      },
      { $unwind: "$actor" },
      {
        $project: {
          _id: 1,
          type: 1,
          entityId: 1,
          entityType: 1,
          message: 1,
          read: 1,
          createdAt: 1,
          actor: {
            _id: "$actor._id",
            name: "$actor.name",
            username: "$actor.username",
            avatar: "$actor.avatar",
          },
        },
      },
    ];

    const notifications = await notifsCol.aggregate(pipeline).toArray();
    const unreadCount = await notifsCol.countDocuments({
      recipientId: currentUser._id,
      read: false,
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id.toString(),
        entityId: n.entityId?.toString(),
        actor: {
          ...n.actor,
          _id: n.actor._id.toString(),
        },
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
