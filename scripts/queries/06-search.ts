import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 6: Search developers, posts, or projects
 * Demonstrates: Cross-collection search utilizing $regex (or text index) with projections and limits
 */
export async function runSearchQuery(searchTerm = "MongoDB") {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log(`\n=== Query 6: Global Platform Search for: "${searchTerm}" ===`);
    const regex = new RegExp(searchTerm, "i");

    // 1. Search Users (by name, username, or skills)
    const matchingUsers = await db
      .collection("users")
      .find({
        $or: [{ name: regex }, { username: regex }, { skills: regex }, { bio: regex }],
      })
      .project({ name: 1, username: 1, bio: 1, skills: 1 })
      .limit(3)
      .toArray();

    // 2. Search Posts (by title, tags, or content)
    const matchingPosts = await db
      .collection("posts")
      .find({
        $or: [{ title: regex }, { tags: regex }, { content: regex }],
      })
      .project({ title: 1, type: 1, tags: 1, likesCount: 1 })
      .limit(3)
      .toArray();

    // 3. Search Projects (by title, description, or technologies)
    const matchingProjects = await db
      .collection("projects")
      .find({
        $or: [{ title: regex }, { description: regex }, { technologies: regex }],
      })
      .project({ title: 1, technologies: 1, githubUrl: 1, starsCount: 1 })
      .limit(3)
      .toArray();

    console.log(`\n[Users Matched: ${matchingUsers.length}]`);
    matchingUsers.forEach((u) => console.log(`  - ${u.name} (@${u.username}) | Skills: [${u.skills.join(", ")}]`));

    console.log(`\n[Posts Matched: ${matchingPosts.length}]`);
    matchingPosts.forEach((p) => console.log(`  - [${p.type}] "${p.title}" | Tags: [${p.tags.join(", ")}]`));

    console.log(`\n[Projects Matched: ${matchingProjects.length}]`);
    matchingProjects.forEach((pr) => console.log(`  - "${pr.title}" | Stack: [${pr.technologies.join(", ")}] | Stars: ${pr.starsCount}`));

    return { users: matchingUsers, posts: matchingPosts, projects: matchingProjects };
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("06-search")) {
  runSearchQuery(process.argv[2] || "MongoDB")
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
