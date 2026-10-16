import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 4: Aggregate popular posts over a defined time range
 * Demonstrates: $match with date filter, computed popularity score using $add and $multiply,
 * $sort by score, $limit, and $lookup for author metadata
 */
export async function runPopularPostsQuery(days = 30, limit = 5) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    console.log(`\n=== Query 4: Aggregate Popular Posts (Last ${days} days, Since ${sinceDate.toLocaleDateString()}) ===`);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: sinceDate },
        },
      },
      {
        $addFields: {
          // Weighted popularity score: Likes (x2) + Comments (x3)
          popularityScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$likesCount", 0] }, 2] },
              { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 3] },
            ],
          },
        },
      },
      { $sort: { popularityScore: -1 } },
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
          title: 1,
          type: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          popularityScore: 1,
          createdAt: 1,
          authorName: "$author.name",
          authorUsername: "$author.username",
        },
      },
    ];

    const results = await db.collection("posts").aggregate(pipeline).toArray();
    console.log(`Top ${results.length} Trending Posts:\n`);
    results.forEach((p, idx) => {
      console.log(`[Rank #${idx + 1}] Score: ${p.popularityScore} pts | "${p.title}"`);
      console.log(`   By: ${p.authorName} (@${p.authorUsername})`);
      console.log(`   Likes: ${p.likesCount} | Comments: ${p.commentsCount} | Tags: [${p.tags.join(", ")}]`);
      console.log(`   Posted: ${p.createdAt.toISOString()}`);
    });

    return results;
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("04-popular-posts")) {
  runPopularPostsQuery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
