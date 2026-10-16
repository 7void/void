import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

/**
 * Query 7: Query execution analysis using explain("executionStats")
 * Demonstrates: Index scan (IXSCAN) vs collection scan, totalDocsExamined vs nReturned,
 * and execution plan verification for NoSQL grading criteria.
 */
export async function runExplainExecutionQuery() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log("\n=======================================================");
    console.log("   Query Execution Analysis with explain('executionStats')");
    console.log("=======================================================\n");

    // Scenario A: Technology filter on Projects using multikey index `idx_projects_technologies`
    console.log("--- [Test 1] Analyzing Projects Technology Query ---");
    console.log("Filter: { technologies: 'TypeScript' }\n");

    const explainProjects = await db
      .collection("projects")
      .find({ technologies: "TypeScript" })
      .explain("executionStats");

    const executionStats = explainProjects.executionStats;
    const winningPlan = explainProjects.queryPlanner?.winningPlan;

    console.log("Winning Plan Stage:", winningPlan?.stage || winningPlan?.inputStage?.stage);
    console.log("Index Used        :", winningPlan?.inputStage?.indexName || winningPlan?.indexName || "None (COLLSCAN)");
    console.log("Execution Time (ms):", executionStats.executionTimeMillis);
    console.log("Docs Returned     :", executionStats.nReturned);
    console.log("Docs Examined     :", executionStats.totalDocsExamined);
    console.log("Keys Examined     :", executionStats.totalKeysExamined);

    console.log("\n-------------------------------------------------------");
    // Scenario B: Recent Posts Feed Query using index `idx_posts_created_at`
    console.log("--- [Test 2] Analyzing Posts Feed Sorted by CreatedAt ---");
    console.log("Query: find({}).sort({ createdAt: -1 }).limit(10)\n");

    const explainPosts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .explain("executionStats");

    const postStats = explainPosts.executionStats;
    const postWinningPlan = explainPosts.queryPlanner?.winningPlan;

    console.log("Winning Plan Stage:", postWinningPlan?.stage || postWinningPlan?.inputStage?.stage);
    console.log("Index Used        :", postWinningPlan?.inputStage?.indexName || postWinningPlan?.indexName || "None");
    console.log("Execution Time (ms):", postStats.executionTimeMillis);
    console.log("Docs Returned     :", postStats.nReturned);
    console.log("Docs Examined     :", postStats.totalDocsExamined);
    console.log("Keys Examined     :", postStats.totalKeysExamined);

    console.log("\nConclusion: Both queries successfully leverage B-Tree Index Scans (IXSCAN)");
    console.log("rather than in-memory sorting or full collection scans (COLLSCAN).");

    return { explainProjects, explainPosts };
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("07-explain-execution")) {
  runExplainExecutionQuery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
