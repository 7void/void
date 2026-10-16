# VOID — MongoDB Query Guide & Demonstration Scripts

This guide documents the implementation, aggregation pipelines, and execution commands for the required NoSQL database demonstration queries in VOID.

All queries execute directly against MongoDB and can be run individually using `npx tsx scripts/queries/<script-name>.ts` or via their npm script aliases.

---

## Query 1: Paginated Posts with Author Information
- **Script:** `scripts/queries/01-paginated-posts.ts`
- **Command:** `npm run query:posts`
- **NoSQL Features Used:** `$sort`, `$skip`, `$limit`, `$lookup`, `$unwind`, `$project`
- **Purpose:** Fetches the reverse-chronological feed with author profile details joined in a single round-trip without relational N+1 queries.

### Pipeline:
```javascript
[
  { $sort: { createdAt: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "authorDetails"
    }
  },
  { $unwind: "$authorDetails" },
  {
    $project: {
      title: 1,
      type: 1,
      tags: 1,
      likesCount: 1,
      commentsCount: 1,
      createdAt: 1,
      author: {
        name: "$authorDetails.name",
        username: "$authorDetails.username",
        avatar: "$authorDetails.avatar"
      }
    }
  }
]
```

---

## Query 2: Retrieve Projects Filtered by Technology Stack
- **Script:** `scripts/queries/02-filter-projects.ts`
- **Command:** `npm run query:projects` or `npx tsx scripts/queries/02-filter-projects.ts "Rust"`
- **NoSQL Features Used:** Multikey index scan (`idx_projects_technologies`), `$match` with `$in`, `$lookup`, `$unwind`
- **Purpose:** Fast filtering across arrays of technologies in project documents using B-Tree multikey index.

### Pipeline:
```javascript
[
  { $match: { technologies: { $in: [targetTech] } } },
  { $sort: { starsCount: -1 } },
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" }
]
```

---

## Query 3: Follower and Following Relationships
- **Script:** `scripts/queries/03-follow-relations.ts`
- **Command:** `npm run query:follows` or `npx tsx scripts/queries/03-follow-relations.ts "demouser"`
- **NoSQL Features Used:** Graph edge querying, `$match`, `$lookup` from `users`
- **Purpose:** Evaluates social graph edges to retrieve user's followers and following list with populated profile details.

---

## Query 4: Aggregate Popular Posts over Time Range
- **Script:** `scripts/queries/04-popular-posts.ts`
- **Command:** `npm run query:popular`
- **NoSQL Features Used:** `$match` on date range, `$addFields`, `$add`, `$multiply`, `$sort`, `$limit`, `$lookup`
- **Purpose:** Ranks discussions based on a weighted popularity metric: `Score = (likesCount * 2) + (commentsCount * 3)`.

### Pipeline:
```javascript
[
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  {
    $addFields: {
      popularityScore: {
        $add: [
          { $multiply: [{ $ifNull: ["$likesCount", 0] }, 2] },
          { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 3] }
        ]
      }
    }
  },
  { $sort: { popularityScore: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" }
]
```

---

## Query 5: Trending Technologies Across Projects
- **Script:** `scripts/queries/05-trending-tech.ts`
- **Command:** `npm run query:tech`
- **NoSQL Features Used:** `$unwind` on multikey array, `$group` with `$sum`, `$sort`, `$limit`, `$project`
- **Purpose:** Deconstructs project technology arrays into individual stream documents and calculates platform-wide frequency and cumulative stars.

### Pipeline:
```javascript
[
  { $unwind: "$technologies" },
  {
    $group: {
      _id: "$technologies",
      projectCount: { $sum: 1 },
      totalStars: { $sum: "$starsCount" },
      sampleProjects: { $push: "$title" }
    }
  },
  { $sort: { projectCount: -1, totalStars: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      technology: "$_id",
      projectCount: 1,
      totalStars: 1,
      featuredProjects: { $slice: ["$sampleProjects", 2] }
    }
  }
]
```

---

## Query 6: Multi-Collection Global Search
- **Script:** `scripts/queries/06-search.ts`
- **Command:** `npm run query:search` or `npx tsx scripts/queries/06-search.ts "TypeScript"`
- **NoSQL Features Used:** Regex queries, multi-field `$or`, projections
- **Purpose:** Searches across developers (by name, handle, bio, skills), posts (by title, tags, content), and projects (by title, description, technologies).

---

## Query 7: Query Execution Analysis with explain("executionStats")
- **Script:** `scripts/queries/07-explain-execution.ts`
- **Command:** `npm run query:explain`
- **NoSQL Features Used:** `.explain("executionStats")`
- **Purpose:** Evaluates winning query execution plans to verify that queries utilize index scans (`IXSCAN`) rather than full collection scans (`COLLSCAN`), observing `totalDocsExamined` vs `nReturned`.
