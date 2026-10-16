import { NextRequest, NextResponse } from "next/server";
import { Filter } from "mongodb";
import { getCollection, getDb } from "@/lib/db";
import { ProjectDoc, UserDoc, BookmarkDoc } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tech = searchParams.get("tech");
    const search = searchParams.get("search");
    const authorUsername = searchParams.get("author");
    const sort = searchParams.get("sort") || "stars"; // "stars" or "recent"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    const matchConditions: Filter<ProjectDoc> = {};

    if (tech) {
      matchConditions.technologies = tech;
    }

    if (search) {
      matchConditions.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { technologies: { $regex: search, $options: "i" } },
      ];
    }

    if (authorUsername) {
      const usersCol = await getCollection<UserDoc>("users");
      const targetUser = await usersCol.findOne({ username: authorUsername });
      if (targetUser) {
        matchConditions.authorId = targetUser._id;
      } else {
        return NextResponse.json({ projects: [], total: 0, page, totalPages: 0 });
      }
    }

    const sortStage = sort === "recent" ? { createdAt: -1 as const } : { starsCount: -1 as const };
    const skip = (page - 1) * limit;

    const db = await getDb();
    const projectsCol = db.collection<ProjectDoc>("projects");
    const total = await projectsCol.countDocuments(matchConditions);

    const pipeline = [
      { $match: matchConditions },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
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
          },
        },
      },
    ];

    const projects = await projectsCol.aggregate(pipeline).toArray();

    const currentUser = await getCurrentUser();
    let bookmarkedProjectIds = new Set<string>();

    if (currentUser && projects.length > 0) {
      const bookmarksCol = await getCollection<BookmarkDoc>("bookmarks");
      const projectIds = projects.map((p) => p._id);
      const userBookmarks = await bookmarksCol
        .find({
          userId: currentUser._id,
          itemType: "project",
          itemId: { $in: projectIds },
        })
        .toArray();
      bookmarkedProjectIds = new Set(userBookmarks.map((b) => b.itemId.toString()));
    }

    const formatted = projects.map((p) => ({
      ...p,
      _id: p._id.toString(),
      authorId: p.authorId.toString(),
      author: {
        ...p.author,
        _id: p.author._id.toString(),
      },
      hasBookmarked: bookmarkedProjectIds.has(p._id.toString()),
    }));

    return NextResponse.json({
      projects: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const usersCol = await getCollection<UserDoc>("users");

    const newProject: Omit<ProjectDoc, "_id"> = {
      authorId: currentUser._id,
      title,
      description,
      technologies: technologies.map((t) => t.trim()),
      githubUrl,
      liveUrl: liveUrl || "",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      starsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await projectsCol.insertOne(newProject as ProjectDoc);
    const projectId = insertResult.insertedId;

    // Atomically increment user's projectsCount
    await usersCol.updateOne({ _id: currentUser._id }, { $inc: { projectsCount: 1 } });

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: {
          ...newProject,
          _id: projectId.toString(),
          author: {
            _id: currentUser._id.toString(),
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
          hasBookmarked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
