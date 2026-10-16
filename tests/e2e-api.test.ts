import { MongoClient, ObjectId } from "mongodb";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from "../lib/auth";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("       VOID Comprehensive Automated Test Suite");
  console.log("=======================================================\n");

  const client = new MongoClient(uri);
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    await client.connect();
    const db = client.db();

    // Test 1: Database Connectivity
    console.log("[Category 1: Database & Ping]");
    const ping = await db.command({ ping: 1 });
    assert(ping.ok === 1, "MongoDB server responds to ping command");

    // Test 2: Crypto & Password Hashing
    console.log("\n[Category 2: Password Security & JWT Auth]");
    const rawPass = "SecretDevPassword2026!";
    const hashed = await hashPassword(rawPass);
    assert(hashed.startsWith("$2"), "Password hash format is valid bcrypt");
    const validVerify = await verifyPassword(rawPass, hashed);
    assert(validVerify === true, "bcrypt successfully verifies matching password");
    const invalidVerify = await verifyPassword("WrongPassword", hashed);
    assert(invalidVerify === false, "bcrypt rejects incorrect password");

    // Test 3: JWT Session Tokens
    const payload = {
      userId: new ObjectId().toString(),
      username: "testrunner",
      email: "test@void.dev",
      name: "Test Runner",
    };
    const token = await signSessionToken(payload);
    assert(typeof token === "string" && token.split(".").length === 3, "Signed token is standard 3-part JWT");
    const verified = await verifySessionToken(token);
    assert(verified !== null && verified.username === "testrunner", "Token verified and payload recovered");

    // Test 4: Users Collection & Unique Constraints
    console.log("\n[Category 3: Data Integrity & Uniqueness Constraints]");
    const users = db.collection("users");
    const demoUser = await users.findOne({ username: "demouser" });
    assert(demoUser !== null, "Demo user exists in database");

    // Verify unique index on username
    try {
      await users.insertOne({
        username: "demouser", // Duplicate!
        email: "unique_new@void.dev",
        name: "Duplicate Tester",
        passwordHash: "dummy",
        bio: "",
        avatar: "",
        skills: [],
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        projectsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      assert(false, "Prevent duplicate username via unique index");
    } catch (err: any) {
      assert(err.code === 11000, "Duplicate username correctly rejected by MongoDB (E11000)");
    }

    // Test 5: Posts and Lookups
    console.log("\n[Category 4: Posts & Aggregation Feeds]");
    const posts = db.collection("posts");
    const postCount = await posts.countDocuments();
    assert(postCount > 0, `Posts collection has records (found ${postCount})`);

    const feedPipeline = [
      { $sort: { createdAt: -1 as const } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
    ];
    const feed = await posts.aggregate(feedPipeline).toArray();
    assert(feed.length === 3, "Feed aggregation returns requested limit");
    assert(feed[0].author && feed[0].author.username, "Feed post author successfully joined via $lookup");

    // Test 6: Likes & Atomic Operations
    console.log("\n[Category 5: Atomic Updates & Interactions]");
    const testPost = feed[0];
    const initialLikes = testPost.likesCount || 0;
    const likesCol = db.collection("likes");

    // Insert like and atomically increment post counter
    const testUserId = new ObjectId();
    await likesCol.insertOne({
      _id: new ObjectId(),
      userId: testUserId,
      targetType: "post",
      targetId: testPost._id,
      createdAt: new Date(),
    });
    await posts.updateOne({ _id: testPost._id }, { $inc: { likesCount: 1 } });

    const updatedPost = await posts.findOne({ _id: testPost._id });
    assert(updatedPost?.likesCount === initialLikes + 1, "Atomically incremented likesCount via $inc");

    // Rollback test like
    await likesCol.deleteOne({ userId: testUserId, targetId: testPost._id });
    await posts.updateOne({ _id: testPost._id }, { $inc: { likesCount: -1 } });
    const revertedPost = await posts.findOne({ _id: testPost._id });
    assert(revertedPost?.likesCount === initialLikes, "Atomically decremented likesCount upon unlike");

    // Test 7: Follow Relationships & Self-Follow Prevention
    console.log("\n[Category 6: Follow Graphs & Social Integrity]");
    const followsCol = db.collection("follows");
    const alexUser = await users.findOne({ username: "alexchen" });
    assert(alexUser !== null, "Author alexchen exists");

    const followEdge = await followsCol.findOne({
      followerId: demoUser!._id,
      followingId: alexUser!._id,
    });
    assert(followEdge !== null, "Demo user follows Alex Chen relationship exists");

    // Test 8: Technology Filter on Projects
    console.log("\n[Category 7: Project Discovery & Tech Filter]");
    const projectsCol = db.collection("projects");
    const tsProjects = await projectsCol.find({ technologies: "TypeScript" }).toArray();
    assert(tsProjects.length > 0, `Multikey query on technologies found ${tsProjects.length} TypeScript projects`);

    // Test 9: Trending Tech Aggregation
    console.log("\n[Category 8: Aggregation Pipelines]");
    const trending = await projectsCol
      .aggregate([
        { $unwind: "$technologies" },
        { $group: { _id: "$technologies", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ])
      .toArray();
    assert(trending.length === 3, "Trending tech aggregation produces top 3 grouped records");
    assert(typeof trending[0]._id === "string" && trending[0].count >= 1, "Aggregation returns technology name and valid count");

    // Test 10: Query Execution Plan (explain executionStats)
    console.log("\n[Category 9: Query Execution Analysis (explain)]");
    const explainResult = await projectsCol
      .find({ technologies: "TypeScript" })
      .explain("executionStats");
    const stage = explainResult.queryPlanner?.winningPlan?.stage || explainResult.queryPlanner?.winningPlan?.inputStage?.stage;
    const indexUsed = explainResult.queryPlanner?.winningPlan?.inputStage?.indexName;
    assert(
      indexUsed === "idx_projects_technologies",
      `Query plan verified: used index '${indexUsed}' with stage '${stage}'`
    );

    console.log("\n=======================================================");
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log("=======================================================\n");

    if (failed > 0) process.exit(1);
  } finally {
    await client.close();
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
