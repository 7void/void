import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { ProjectDoc, UserDoc, BookmarkDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const projectObjectId = new ObjectId(id);
    const db = await getDb();
    const projectsCol = db.collection<ProjectDoc>("projects");

    const pipeline = [
      { $match: { _id: projectObjectId } },
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
          authorId: 1,
          title: 1,
          description: 1,
          technologies: 1,
          githubUrl: 1,
          liveUrl: 1,
          imageUrl: 1,
          starsCount: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            username: "$author.username",
            avatar: "$author.avatar",
            skills: "$author.skills",
            bio: "$author.bio",
          },
        },
      },
    ];

    const results = await projectsCol.aggregate(pipeline).toArray();
    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = results[0];
    const currentUser = await getCurrentUser();
    let hasBookmarked = false;

    if (currentUser) {
      const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
      const existing = await bookmarksCol.findOne({
        userId: currentUser._id,
        itemType: "project",
        itemId: projectObjectId,
      });
      hasBookmarked = !!existing;
    }

    return NextResponse.json({
      project: {
        ...project,
        _id: project._id.toString(),
        authorId: project.authorId.toString(),
        author: {
          ...project.author,
          _id: project.author._id.toString(),
        },
        hasBookmarked,
      },
    });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const projectObjectId = new ObjectId(id);
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const project = await projectsCol.findOne({ _id: projectObjectId });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.authorId.equals(currentUser._id)) {
      return NextResponse.json({ error: "Forbidden: You are not the author" }, { status: 403 });
    }

    const body = await req.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, technologies, githubUrl, liveUrl, imageUrl } = result.data;

    await projectsCol.updateOne(
      { _id: projectObjectId },
      {
        $set: {
          title,
          description,
          technologies: technologies.map((t) => t.trim()),
          githubUrl,
          liveUrl: liveUrl || "",
          imageUrl: imageUrl || project.imageUrl,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const projectObjectId = new ObjectId(id);
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const project = await projectsCol.findOne({ _id: projectObjectId });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.authorId.equals(currentUser._id)) {
      return NextResponse.json({ error: "Forbidden: You are not the author" }, { status: 403 });
    }

    await projectsCol.deleteOne({ _id: projectObjectId });

    // Decrement projectsCount atomically
    const usersCol = await getCollection<UserDoc>("users");
    await usersCol.updateOne({ _id: currentUser._id }, { $inc: { projectsCount: -1 } });

    // Delete bookmarks for this project
    const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
    await bookmarksCol.deleteMany({ itemType: "project", itemId: projectObjectId });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
