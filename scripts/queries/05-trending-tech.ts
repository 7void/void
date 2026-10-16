import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 5: Aggregate the most frequently used technologies across projects
 * Demonstrates: $unwind on technologies array, $group by technology with $sum count,
 * $sort by projectCount desc, $limit top N, and $project formatting
 */
export async function runTrendingTechQuery(limit = 10) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log(`\n=== Query 5: Trending Technologies Across Projects (Top ${limit}) ===`);

    const pipeline = [
      { $unwind: "$technologies" },
      {
        $group: {
          _id: "$technologies",
          projectCount: { $sum: 1 },
          totalStars: { $sum: "$starsCount" },
          sampleProjects: { $push: "$title" },
        },
      },
      { $sort: { projectCount: -1, totalStars: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          technology: "$_id",
          projectCount: 1,
          totalStars: 1,
          featuredProjects: { $slice: ["$sampleProjects", 2] },
        },
      },
    ];

    const results = await db.collection("projects").aggregate(pipeline).toArray();
    console.log(`Aggregated ${results.length} technologies:\n`);
    results.forEach((tech, idx) => {
      console.log(`[#${idx + 1}] ${tech.technology.padEnd(16)} -> ${tech.projectCount} projects | Total Stars: ${tech.totalStars}`);
      console.log(`     Featured: ${tech.featuredProjects.join(", ")}`);
    });

    return results;
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("05-trending-tech")) {
  runTrendingTechQuery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
