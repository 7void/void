import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 2: Retrieve projects filtered by technology stack
 * Demonstrates: Multikey index usage on array field `technologies`, $in / $all filters, and author projection
 */
export async function runFilterProjectsQuery(tech = "TypeScript") {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log(`\n=== Query 2: Filter Projects by Technology ('${tech}') ===`);

    const pipeline = [
      {
        $match: {
          technologies: { $in: [tech] },
        },
      },
      { $sort: { starsCount: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          technologies: 1,
          githubUrl: 1,
          starsCount: 1,
          authorName: "$author.name",
          authorUsername: "$author.username",
        },
      },
    ];

    const results = await db.collection("projects").aggregate(pipeline).toArray();
    console.log(`Found ${results.length} projects matching technology: "${tech}"\n`);
    results.forEach((p, idx) => {
      console.log(`[${idx + 1}] ${p.title} (Stars: ${p.starsCount})`);
      console.log(`    Author: ${p.authorName} (@${p.authorUsername})`);
      console.log(`    Stack: [${p.technologies.join(", ")}]`);
      console.log(`    Repo: ${p.githubUrl}`);
      console.log(`    Desc: ${p.description.substring(0, 80)}...\n`);
    });

    return results;
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("02-filter-projects")) {
  runFilterProjectsQuery(process.argv[2] || "TypeScript")
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
