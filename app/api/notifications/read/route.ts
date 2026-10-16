import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { NotificationDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifsCol = await getCollection<NotificationDoc>("notifications");
    await notifsCol.updateMany(
      { recipientId: currentUser._id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("POST /api/notifications/read error:", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
