import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 1: Fetch paginated posts with author information
 * Demonstrates: $lookup to join users, projection, sorting by createdAt desc, and limit/skip pagination
 */
export async function runPaginatedPostsQuery(page = 1, limit = 5) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const skip = (page - 1) * limit;

    const pipeline = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: {
          path: "$authorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          type: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          snippetLanguage: "$codeSnippet.language",
          author: {
            name: "$authorDetails.name",
            username: "$authorDetails.username",
            avatar: "$authorDetails.avatar",
          },
        },
      },
    ];

    const results = await db.collection("posts").aggregate(pipeline).toArray();
    console.log(`\n=== Query 1: Paginated Posts (Page ${page}, Limit ${limit}) ===`);
    console.log(`Retrieved ${results.length} posts:\n`);
    results.forEach((p, idx) => {
      console.log(`[${idx + 1}] "${p.title}"`);
      console.log(`    Author: ${p.author?.name} (@${p.author?.username})`);
      console.log(`    Type: ${p.type} | Tags: [${p.tags?.join(", ")}] | Likes: ${p.likesCount} | Comments: ${p.commentsCount}`);
      console.log(`    Created: ${p.createdAt.toISOString()}`);
    });

    return results;
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("01-paginated-posts")) {
  runPaginatedPostsQuery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
