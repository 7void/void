import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 3: Fetch follower/following relationships
 * Demonstrates: Graph/edge queries with $lookup to populate followed developers and followers
 */
export async function runFollowRelationsQuery(targetUsername = "demouser") {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log(`\n=== Query 3: Follower/Following Relationships for @${targetUsername} ===`);

    const user = await db.collection("users").findOne({ username: targetUsername });
    if (!user) {
      console.log(`User @${targetUsername} not found.`);
      return;
    }

    // 1. Fetch who this user is following
    const followingPipeline = [
      { $match: { followerId: user._id } },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "followedUser",
        },
      },
      { $unwind: "$followedUser" },
      {
        $project: {
          _id: "$followedUser._id",
          name: "$followedUser.name",
          username: "$followedUser.username",
          bio: "$followedUser.bio",
          skills: "$followedUser.skills",
        },
      },
    ];

    const following = await db.collection("follows").aggregate(followingPipeline).toArray();

    // 2. Fetch who is following this user
    const followersPipeline = [
      { $match: { followingId: user._id } },
      {
        $lookup: {
          from: "users",
          localField: "followerId",
          foreignField: "_id",
          as: "followerUser",
        },
      },
      { $unwind: "$followerUser" },
      {
        $project: {
          _id: "$followerUser._id",
          name: "$followerUser.name",
          username: "$followerUser.username",
          bio: "$followerUser.bio",
        },
      },
    ];

    const followers = await db.collection("follows").aggregate(followersPipeline).toArray();

    console.log(`\nFollowing (${following.length} developers):`);
    following.forEach((f) => console.log(`  - ${f.name} (@${f.username}): ${f.bio}`));

    console.log(`\nFollowers (${followers.length} developers):`);
    followers.forEach((f) => console.log(`  - ${f.name} (@${f.username}): ${f.bio}`));

    return { following, followers };
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("03-follow-relations")) {
  runFollowRelationsQuery(process.argv[2] || "demouser")
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
