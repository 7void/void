import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { UserDoc } from "@/lib/types";
import { registerSchema } from "@/lib/validations";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, username, email, password, bio, skills, github } = result.data;
    const users = await getCollection<UserDoc>("users");

    // Check if username or email already exists
    const existing = await users.findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      if (existing.username === username) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
      }
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    const newUser: Omit<UserDoc, "_id"> = {
      name,
      username,
      email,
      passwordHash,
      bio: bio || "",
      avatar: defaultAvatar,
      github: github || "",
      website: "",
      skills: skills || [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      projectsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await users.insertOne(newUser as UserDoc);
    const userId = insertResult.insertedId.toString();

    // Sign session token and set HTTP-only cookie
    const token = await signSessionToken({
      userId,
      username,
      email,
      name,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          _id: userId,
          name,
          username,
          email,
          bio: newUser.bio,
          avatar: newUser.avatar,
          skills: newUser.skills,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
