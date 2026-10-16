import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { UserDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, bio, skills, github, website, avatar } = result.data;
    const updateFields: Partial<UserDoc> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (skills !== undefined) updateFields.skills = skills.map((s) => s.trim());
    if (github !== undefined) updateFields.github = github;
    if (website !== undefined) updateFields.website = website;
    if (avatar !== undefined && avatar.trim()) updateFields.avatar = avatar;

    const usersCol = await getCollection<UserDoc>("users");
    await usersCol.updateOne({ _id: currentUser._id }, { $set: updateFields });

    const updatedUser = await usersCol.findOne({ _id: currentUser._id });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        username: updatedUser?.username,
        email: updatedUser?.email,
        bio: updatedUser?.bio,
        avatar: updatedUser?.avatar,
        github: updatedUser?.github,
        website: updatedUser?.website,
        skills: updatedUser?.skills,
      },
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
