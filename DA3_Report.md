# VELLORE INSTITUTE OF TECHNOLOGY (VIT)
## SCHOOL OF COMPUTER SCIENCE AND ENGINEERING
### BCSE406L – NoSQL Databases | Fall Semester 2026–2027
**Faculty:** Dr. S. Geetha  
**Digital Assignment – 3: Final Project Report & Demonstration Guide**  
**Due Date:** 10.10.2026  

---

# PROJECT TITLE: VOID — A Developer-First Social Networking & Portfolio Platform

**Project Repository:** [https://github.com/7void/void.git](https://github.com/7void/void.git)  
**Live Application URL:** `http://localhost:3000`  
**Database Engine:** MongoDB Server v7.x / MongoDB Atlas  

---

## 1. Final Project Overview

### 1.1 Problem Statement & Motivation
Mainstream social networking platforms suffer from high signal-to-noise ratios, generic content models, and a complete absence of developer-centric primitives such as native code formatting, execution terminal workflows, and granular technology stack filtering. Traditional portfolio websites, on the other hand, exist in isolation without organic reach or interactive community feedback.

**VOID** bridges this gap by unifying a developer-first social network with portfolio discovery and interactive terminal capabilities:
- **Interactive Technical Posts:** Publishing discussions, questions, code snippets, and release announcements with syntax-styled code blocks and tags.
- **Project Discovery Ecosystem:** Discovering open-source repositories and live web applications filtered by multikey technology stacks (`TypeScript`, `Rust`, `Go`, `Python`, `MongoDB`, `WebGL`, etc.).
- **Dual GUI / CLI Interaction:** Operating through a modern graphical interface or an in-browser interactive terminal (`void shell v1.0.0`) supporting commands like `session.start`, `help`, `tip`, `stats`, and `quote`.
- **Low-Latency Community Graph:** Enabling developers to follow peers, like technical discussions, reply in threaded comments, bookmark items, and receive real-time notifications.

### 1.2 System Architecture
VOID is architected as a high-performance, full-stack application built on **Next.js 16 App Router** (React 19), **Tailwind CSS v4**, and the **official MongoDB Node.js driver** (`mongodb` v7.7).

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  Next.js 16 App Router (React 19 Server & Client Components, Geist Font, Tailwind)|
|  - Preserved Terminal Login Card   - Home Feed & Post Composer                  |
|  - Project Discovery Showcase     - Explore & MongoDB Aggregations Leaderboard  |
|  - Developer Profile & Graph       - Bookmarks & Notifications Stream           |
+---------------------------------------------------------------------------------+
                                       │  HTTP / JSON / Cookies
                                       ▼
+---------------------------------------------------------------------------------+
|                              APPLICATION & API TIER                             |
|  - Next.js Server Route Handlers (/api/auth, /api/posts, /api/projects, etc.)   |
|  - Cryptographic Session Management (jose HS256 JWT in HTTP-Only Cookies)       |
|  - Password Hashing (bcryptjs, 10 salt rounds)                                  |
|  - Schema Validation Layer (Zod v4)                                             |
+---------------------------------------------------------------------------------+
                                       │  MongoDB Wire Protocol (Connection Pool)
                                       ▼
+---------------------------------------------------------------------------------+
|                               DATABASE TIER (MongoDB)                           |
|  Database: void_db                                                              |
|  Collections: users, posts, comments, likes, follows, projects, bookmarks,      |
|               notifications                                                     |
|  Indexes: 12 B-Tree Unique, Compound, and Multikey Array Indexes                |
|  Features: Aggregation Pipelines, Multikey Array Scanning, Atomic $inc Updates  |
+---------------------------------------------------------------------------------+
```

---

## 2. Final NoSQL Database & Data Model

The persistence layer is structured across 8 dedicated collections in MongoDB (`void_db`). The schema avoids monolithic relational joins by leveraging document-oriented embedding for tightly bounded sub-entities, while referencing high-velocity or high-cardinality collections to prevent document bloat.

### 2.1 Collection Schemas

#### A. `users` Collection
Stores developer identities, authentication credentials, profile metadata, competencies, and denormalized counter aggregates.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Unique document identifier |
| `name` | `string` | Required | Developer full display name |
| `username` | `string` | Unique Index (`idx_users_username_unique`), lowercase | Unique handle (e.g., `alexchen`) |
| `email` | `string` | Unique Index (`idx_users_email_unique`), lowercase | Developer email address |
| `passwordHash` | `string` | Required | Salted bcrypt hash |
| `bio` | `string` | Max 300 chars | Developer technical focus / bio |
| `avatar` | `string` | Required | URL to profile avatar image |
| `github` | `string` | Optional | GitHub profile URL |
| `website` | `string` | Optional | Personal website or blog |
| `skills` | `Array<string>` | Multikey indexed | Array of competencies (`["Rust", "MongoDB"]`) |
| `followersCount`| `number` | Maintained via `$inc` | Count of developers following this user |
| `followingCount`| `number` | Maintained via `$inc` | Count of developers this user follows |
| `postsCount` | `number` | Maintained via `$inc` | Total technical posts published |
| `projectsCount` | `number` | Maintained via `$inc` | Total showcase projects published |
| `createdAt` | `Date` | Index (`idx_users_created_at`) | Account registration timestamp |
| `updatedAt` | `Date` | Required | Profile last modified timestamp |

#### B. `posts` Collection
Contains developer technical discussions, questions, code snippets, and release announcements.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Unique document identifier |
| `authorId` | `ObjectId` | Index (`idx_posts_author_created`) | Reference to `users._id` |
| `type` | `string` | Index (`idx_posts_type_created`) | Enum: `"discussion"`, `"snippet"`, `"question"`, `"project_update"` |
| `title` | `string` | Text index | Headline title of the post |
| `content` | `string` | Text index | Main post body (Markdown formatted) |
| `codeSnippet` | `Object` (Embedded) | Bounded sub-document | `{ code: string, language: string }` |
| `tags` | `Array<string>` | Multikey Index (`idx_posts_tags`) | Categorical tags (`["mongodb", "performance"]`) |
| `likesCount` | `number` | Compound Index (`idx_posts_popularity`) | Count updated atomically via `$inc` |
| `commentsCount`| `number` | Compound Index (`idx_posts_popularity`) | Count updated atomically via `$inc` |
| `createdAt` | `Date` | Index (`idx_posts_created_at`: -1) | Reverse-chronological feed sorting |
| `updatedAt` | `Date` | Required | Timestamp of last modification |

#### C. `projects` Collection
Showcase repository portfolio items with technology stacks and external links.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Unique document identifier |
| `authorId` | `ObjectId` | Index (`idx_projects_author_created`) | Reference to author `users._id` |
| `title` | `string` | Text index | Project title (e.g., `AetherKV`) |
| `description` | `string` | Text index | Architectural description and details |
| `technologies` | `Array<string>` | Multikey Index (`idx_projects_technologies`) | Stack array (`["Rust", "gRPC", "Docker"]`) |
| `githubUrl` | `string` | Required | Valid GitHub repository URL |
| `liveUrl` | `string` | Optional | Live deployment URL |
| `imageUrl` | `string` | Optional | Showcase cover image URL |
| `starsCount` | `number` | Default 0 | Total stars received |
| `createdAt` | `Date` | Index (`idx_projects_created_at`) | Creation timestamp |
| `updatedAt` | `Date` | Required | Last update timestamp |

#### D. `comments` Collection
Threaded discussion replies associated with technical posts. Stored separately to eliminate document fragmentation and prevent exceeding the 16MB limit.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Unique comment ID |
| `postId` | `ObjectId` | Index (`idx_comments_post_created`: 1, 1) | Reference to `posts._id` |
| `authorId` | `ObjectId` | Index (`idx_comments_author`) | Reference to author `users._id` |
| `content` | `string` | Required | Reply text message |
| `createdAt` | `Date` | Chronological order | Reply timestamp |
| `updatedAt` | `Date` | Required | Last modified timestamp |

#### E. `likes` Collection
Edge collection capturing post and comment likes. Enforces idempotency and prevents duplicate likes through a compound unique index.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Interaction ID |
| `userId` | `ObjectId` | Compound Unique (`idx_likes_user_target_unique`) | User who liked |
| `targetType` | `string` | Compound Unique | Enum: `"post"`, `"comment"` |
| `targetId` | `ObjectId` | Compound Unique | Referenced post or comment ID |
| `createdAt` | `Date` | Required | Interaction timestamp |

#### F. `follows` Collection
Directed social graph edges between developers.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Edge identifier |
| `followerId` | `ObjectId` | Compound Unique (`idx_follows_pair_unique`), Index | Follower user ID |
| `followingId` | `ObjectId` | Compound Unique, Index | Followed user ID |
| `createdAt` | `Date` | Required | Relationship inception date |

#### G. `bookmarks` Collection
User's private saved library of technical posts and showcase projects.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Bookmark identifier |
| `userId` | `ObjectId` | Compound Unique (`idx_bookmarks_user_item_unique`) | Authenticated user ID |
| `itemType` | `string` | Compound Unique | Enum: `"post"`, `"project"` |
| `itemId` | `ObjectId` | Compound Unique | ID of the saved post or project |
| `createdAt` | `Date` | Index (`idx_bookmarks_user_created`) | Saved timestamp |

#### H. `notifications` Collection
Activity stream alerting developers of relevant interactions.

| Field Name | BSON Type | Constraints / Indexes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Notification ID |
| `recipientId` | `ObjectId` | Compound Index (`idx_notifications_recipient_read_created`) | Target user receiving alert |
| `actorId` | `ObjectId` | Required | User who triggered the action |
| `type` | `string` | Required | Enum: `"like"`, `"comment"`, `"follow"` |
| `entityId` | `ObjectId` | Required | Target entity ID |
| `entityType` | `string` | Required | Enum: `"post"`, `"project"`, `"user"` |
| `message` | `string` | Required | Formatted notification text |
| `read` | `boolean` | Compound Index | Read / Unread status flag |
| `createdAt` | `Date` | Compound Index | Alert timestamp |

---

### 2.2 Embedding vs. Referencing Design Decisions

| Entity | Chosen Pattern | Design Rationale & Trade-off Analysis |
|---|---|---|
| **Code Snippets** | **Embedded** in `posts` | Code snippets are immutable with respect to the post, bounded in size (<10KB), and always retrieved simultaneously with the post body. Embedding eliminates secondary lookups or joins during feed rendering. |
| **Tags & Skills** | **Embedded** in `posts` & `users` | Small, bounded string arrays (typically 2 to 8 items). Multikey B-Tree indexes allow instant filtering without requiring relational junction tables (`post_tags`). |
| **Comments** | **Referenced** in `comments` | In active developer communities, high-traffic posts can receive thousands of replies. Embedding comments as an array inside the post document would risk exceeding MongoDB's 16MB document limit and cause severe write lock contention and memory reallocations. |
| **Likes & Follows**| **Referenced** in edge collections | Independent edge collections allow atomic `$inc` updates and guarantee zero duplicate relationships via unique compound indexes (`userId + targetType + targetId`). |

---

## 3. Important MongoDB Queries

VOID implements 7 individually executable demonstration scripts located in `scripts/queries/`:

### Query 1: Paginated Feed with Author Lookup
- **File:** `scripts/queries/01-paginated-posts.ts` (`npm run query:posts`)
- **NoSQL Operators:** `$sort`, `$skip`, `$limit`, `$lookup`, `$unwind`, `$project`
- **Purpose:** Fetches the reverse-chronological post feed while performing a non-blocking left outer join (`$lookup`) with the `users` collection to retrieve author details in a single database round-trip.

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
      _id: 1,
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

### Query 2: Filter Projects by Technology Stack
- **File:** `scripts/queries/02-filter-projects.ts` (`npm run query:projects`)
- **NoSQL Operators:** Multikey Index Scan (`IXSCAN`), `$match`, `$in`, `$lookup`, `$unwind`
- **Purpose:** Searches project documents where the `technologies` array contains a specified tool (e.g., `"TypeScript"` or `"Rust"`), returning projects ordered by stars.

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

### Query 3: Follower & Following Relationship Graph
- **File:** `scripts/queries/03-follow-relations.ts` (`npm run query:follows`)
- **NoSQL Operators:** Graph edge matching, `$match`, `$lookup`
- **Purpose:** Traverses the directed graph in `follows` to retrieve both the following list and followers list for any given user handle with populated profile biographies.

### Query 4: Time-Range Popular Posts Aggregation
- **File:** `scripts/queries/04-popular-posts.ts` (`npm run query:popular`)
- **NoSQL Operators:** `$match`, `$addFields`, `$add`, `$multiply`, `$sort`, `$limit`, `$lookup`
- **Purpose:** Computes a custom engagement score for all discussions created within the last 30 days:
  $$\text{Score} = (\text{likesCount} \times 2) + (\text{commentsCount} \times 3)$$
  Produces the trending leaderboard in a single aggregation pipeline.

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

### Query 5: Trending Technologies Across Projects
- **File:** `scripts/queries/05-trending-tech.ts` (`npm run query:tech`)
- **NoSQL Operators:** `$unwind`, `$group`, `$sum`, `$sort`, `$limit`, `$project`
- **Purpose:** Deconstructs embedded technology arrays across all showcase repositories, calculates frequency counts and cumulative stars per technology, and returns the top 10 technologies.

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

### Query 6: Multi-Collection Platform Search
- **File:** `scripts/queries/06-search.ts` (`npm run query:search`)
- **NoSQL Operators:** Multi-field `$or`, `$regex`, projections
- **Purpose:** Executes concurrent cross-collection discovery across developers (matching name, username, bio, skills), technical posts (title, content, tags), and projects (title, description, stack).

### Query 7: Query Execution Plan Analysis (`explain("executionStats")`)
- **File:** `scripts/queries/07-explain-execution.ts` (`npm run query:explain`)
- **NoSQL Operators:** `.explain("executionStats")`
- **Purpose:** Evaluates winning query execution plans to verify that indexed queries utilize B-Tree Index Scans (`IXSCAN`) rather than full collection scans (`COLLSCAN`), demonstrating a 1:1 ratio between `totalDocsExamined` and `nReturned`.

---

## 4. Indexing, Aggregation & NoSQL Features Used

### 4.1 Index Definitions Summary

12 specialized indexes were initialized via `scripts/indexes.ts`:
1. `idx_users_username_unique`: `{ username: 1 }` (Unique)
2. `idx_users_email_unique`: `{ email: 1 }` (Unique)
3. `idx_users_created_at`: `{ createdAt: -1 }`
4. `idx_posts_created_at`: `{ createdAt: -1 }`
5. `idx_posts_author_created`: `{ authorId: 1, createdAt: -1 }`
6. `idx_posts_tags`: `{ tags: 1 }` (Multikey Index)
7. `idx_posts_popularity`: `{ likesCount: -1, commentsCount: -1, createdAt: -1 }`
8. `idx_follows_pair_unique`: `{ followerId: 1, followingId: 1 }` (Unique Compound)
9. `idx_projects_technologies`: `{ technologies: 1 }` (Multikey Index)
10. `idx_projects_author_created`: `{ authorId: 1, createdAt: -1 }`
11. `idx_likes_user_target_unique`: `{ userId: 1, targetType: 1, targetId: 1 }` (Unique Compound)
12. `idx_bookmarks_user_item_unique`: `{ userId: 1, itemType: 1, itemId: 1 }` (Unique Compound)

### 4.2 Query Execution Plan Evidence (explain executionStats)
Execution stats gathered directly from the live database:

```text
=======================================================
   Query Execution Analysis with explain('executionStats')
=======================================================

--- [Test 1] Analyzing Projects Technology Query ---
Filter: { technologies: 'TypeScript' }

Winning Plan Stage : FETCH
Input Stage        : IXSCAN
Index Used         : idx_projects_technologies
Execution Time (ms): 2 ms
Docs Returned      : 5
Docs Examined      : 5
Keys Examined      : 5
Ratio (Examined:Returned): 1.0 (Optimal B-Tree Index Scan)
```

---

## 5. Application Screenshots & UI Walkthrough

All screens preserve the original visual identity, retro-terminal aesthetic (`#090909`, `#111113`, `#8B5CF6`), and responsive layouts. Genuine screenshots captured from the running application:

### Screen 1: Authentication & Interactive Terminal Gateway
- **File:** `docs/screenshots/01_login_terminal.png`
- **Features:** Dual GUI / CLI login, "Demo Fill" one-click test credentials, interactive terminal running `void shell v1.0.0` with `session.start` capability.

### Screen 2: Developer Home Feed & Composer
- **File:** `docs/screenshots/02_feed_page.png`
- **Features:** Global feed vs. Following feed switcher, category pills, post composer with syntax-highlighted code editor, like/comment counts, and trending sidebar.

### Screen 3: Project Discovery Showcase
- **File:** `docs/screenshots/03_projects_page.png`
- **Features:** Multikey technology stack filters (`TypeScript`, `Rust`, `Go`, `Python`), repository links, live demo buttons, star counts, and project submission modal.

### Screen 4: Explore & Aggregation Leaderboard
- **File:** `docs/screenshots/04_explore_page.png`
- **Features:** Real-time trending technologies aggregation cards (`TypeScript -> 5 projects`, `React -> 3 projects`), popular discussion ranking, and developer spotlight.

### Screen 5: Developer Profile & Social Graph
- **File:** `docs/screenshots/05_profile_page.png`
- **Features:** Profile header, bio, skills badges, metrics row (Followers, Following, Posts, Projects), follow/unfollow toggle, and authored posts/projects tabs.

---

## 6. Verification Results

### 6.1 Automated Test Suite (`tests/e2e-api.test.ts`)
Run command: `npm run test:api`

```text
=======================================================
       VOID Comprehensive Automated Test Suite
=======================================================

[Category 1: Database & Ping]
  ✓ PASS: MongoDB server responds to ping command

[Category 2: Password Security & JWT Auth]
  ✓ PASS: Password hash format is valid bcrypt
  ✓ PASS: bcrypt successfully verifies matching password
  ✓ PASS: bcrypt rejects incorrect password
  ✓ PASS: Signed token is standard 3-part JWT
  ✓ PASS: Token verified and payload recovered

[Category 3: Data Integrity & Uniqueness Constraints]
  ✓ PASS: Demo user exists in database
  ✓ PASS: Duplicate username correctly rejected by MongoDB (E11000)

[Category 4: Posts & Aggregation Feeds]
  ✓ PASS: Posts collection has records (found 8)
  ✓ PASS: Feed aggregation returns requested limit
  ✓ PASS: Feed post author successfully joined via $lookup

[Category 5: Atomic Updates & Interactions]
  ✓ PASS: Atomically incremented likesCount via $inc
  ✓ PASS: Atomically decremented likesCount upon unlike

[Category 6: Follow Graphs & Social Integrity]
  ✓ PASS: Author alexchen exists
  ✓ PASS: Demo user follows Alex Chen relationship exists

[Category 7: Project Discovery & Tech Filter]
  ✓ PASS: Multikey query on technologies found 5 TypeScript projects

[Category 8: Aggregation Pipelines]
  ✓ PASS: Trending tech aggregation produces top 3 grouped records
  ✓ PASS: Aggregation returns technology name and valid count

[Category 9: Query Execution Analysis (explain)]
  ✓ PASS: Query plan verified: used index 'idx_projects_technologies' with stage 'FETCH'

=======================================================
Test Results: 19 Passed, 0 Failed (100% Pass Rate)
=======================================================
```

### 6.2 Production Build Verification (`npm run build`)
All 24 application routes (11 static pages, 13 dynamic server API routes) compiled cleanly with Next.js Turbopack.

---

## 7. Limitations & Future Scope

### 7.1 Limitations
- **Full-Text Search:** Uses indexed regex and text weights; integration with MongoDB Atlas Search Lucene analyzers would enable advanced fuzzy spell-correction.
- **Real-Time Notification Delivery:** Operates through periodic polling; WebSockets or MongoDB Change Streams can provide sub-second push notifications.

### 7.2 Future Scope
- **Interactive Code Sandboxes:** Embedding WebAssembly-based code runners directly inside code snippet posts.
- **GitHub Webhook Synchronization:** Auto-updating project stars, commit graphs, and release tags directly from GitHub API webhooks.
- **Vector Similarity Search:** Storing post embeddings in MongoDB Atlas Vector Search for semantic developer matching.

---

## 8. Individual Contribution of Team Members

| Registration No. | Student Name | Role / Focus Area | Individual Contributions |
|---|---|---|---|
| **23BCE0001** *(Sample)* | **Lead Developer** | Full-Stack & UI/UX | Designed Next.js App Router structure, preserved terminal login UI, implemented feed & project discovery interfaces. |
| **23BCE0002** *(Sample)* | **Database Architect** | NoSQL & Query Design | Designed MongoDB collections, implemented 12 B-Tree indexes, authored 7 aggregation query pipelines, and analyzed execution plans. |
| **23BCE0003** *(Sample)* | **Backend & QA Engineer** | API & Test Automation | Implemented authentication routes (bcrypt + jose), atomic counter updates, seeding script, and the 19-test automated test suite. |

*(Students can adjust names and registration numbers to match their project group).*

---

## 9. Project Source & Evidence Log

- **GitHub Repository:** [https://github.com/7void/void.git](https://github.com/7void/void.git)
- **Database Scripts:**
  - `scripts/indexes.ts`: Index initialization script.
  - `scripts/seed.ts`: Realistic sample dataset seeder.
  - `scripts/queries/`: 7 standalone demonstration queries.
- **Test File:** `tests/e2e-api.test.ts`
- **Documentation:**
  - `docs/database-design.md`
  - `docs/query-guide.md`
  - `docs/evidence-log.md`
  - `docs/report-outline.md`

---

## 10. Live Demonstration & Viva Guide (For Evaluator Review)

### Step-by-Step Live Demo:
1. **Launch Dev Server:** Run `npm run dev` in terminal (Running on `http://localhost:3000`).
2. **Demonstrate Login & CLI:** Open browser to `/login`. Click **"Demo Fill"** or type `session.start` in the terminal panel.
3. **Demonstrate Home Feed:** View technical posts, click like button (atomic update), and attach a code snippet using the composer.
4. **Demonstrate Project Discovery:** Navigate to `/projects`, click on `"Rust"` or `"TypeScript"` to show multikey filtering.
5. **Demonstrate Aggregations:** Navigate to `/explore` to inspect trending technologies frequency calculations and popularity leaderboards.
6. **Execute Database Scripts Live in Terminal:**
   ```bash
   npm run query:popular   # Executes time-range engagement score aggregation
   npm run query:tech      # Executes $unwind & $group pipeline
   npm run query:explain   # Demonstrates IXSCAN index execution plan
   npm run test:api        # Executes all 19 automated tests
   ```

### Key Viva Q&A:
- **Q: Why choose MongoDB over a Relational Database for VOID?**
  *A:* Developer social platforms involve heterogeneous content types (discussions, code snippets with varying language syntax, and variable technology stack arrays). MongoDB allows embedding bounded code snippets directly while utilizing multikey array indexes on `technologies` and `tags` without complex, costly join tables.
- **Q: How does the application prevent duplicate likes and duplicate follows?**
  *A:* By defining unique compound indexes on `{ userId: 1, targetType: 1, targetId: 1 }` for likes and `{ followerId: 1, followingId: 1 }` for follows. MongoDB atomically enforces uniqueness and rejects duplicates with error code 11000.
- **Q: How do you prove that your indexes are effective?**
  *A:* By running `npm run query:explain`. The query plan reports stage `IXSCAN` on `idx_projects_technologies` with `totalDocsExamined: 5` and `nReturned: 5`, confirming zero unindexed table scans.
