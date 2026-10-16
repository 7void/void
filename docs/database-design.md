# VOID — Database Architecture & Document Design

## 1. Overview & System Goals

**VOID** is a developer-first social network combining real-time developer feeds, portfolio showcases, follow graphs, and technical discussions.
The underlying persistence layer is built on **MongoDB** using the official Node.js driver (`mongodb`).

The primary architectural goals for the NoSQL schema design are:
1. **Low-Latency Feed Generation:** Sub-10ms feed reads under high concurrent queries.
2. **Predictable Document Growth:** Bounded sub-documents that prevent document relocation overhead.
3. **Atomic Consistency:** Leveraging `$inc`, `$addToSet`, and `$pull` for race-condition-free likes, follows, and counters.
4. **Rich Aggregation Capabilities:** High-performance analytics for trending technologies and weighted popularity leaderboards.

---

## 2. Collections & Schemas

### A. `users` Collection
Stores developer identities, authentication hashes, biographical details, skills, and denormalized counter aggregates.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `name` | `string` | Developer's display name |
| `username` | `string` | Unique alphanumeric handle (indexed, lowercase) |
| `email` | `string` | Unique email address (indexed, lowercase) |
| `passwordHash` | `string` | bcrypt salted password hash (10 rounds) |
| `bio` | `string` | Short developer bio / technical focus (max 300 chars) |
| `avatar` | `string` | Public URL to profile image |
| `github` | `string` | GitHub profile link |
| `website` | `string` | Personal blog or portfolio link |
| `skills` | `string[]` | Array of technical competencies (e.g. `["Rust", "MongoDB"]`) |
| `followersCount`| `number` | Counter maintained via atomic `$inc` |
| `followingCount`| `number` | Counter maintained via atomic `$inc` |
| `postsCount` | `number` | Total posts published |
| `projectsCount` | `number` | Total showcase projects published |
| `createdAt` | `Date` | Timestamp of registration |
| `updatedAt` | `Date` | Timestamp of last modification |

**Indexes:**
- `{ username: 1 }` (Unique)
- `{ email: 1 }` (Unique)
- `{ createdAt: -1 }`
- `{ name: "text", username: "text", skills: "text", bio: "text" }` (Full-text search)

---

### B. `posts` Collection
Contains developer technical discussions, questions, code snippets, and release announcements.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `authorId` | `ObjectId` | Referenced user ID (`users._id`) |
| `type` | `string` | Enum: `"discussion"`, `"question"`, `"snippet"`, `"project_update"` |
| `title` | `string` | Post headline |
| `content` | `string` | Technical post content (Markdown supported) |
| `codeSnippet` | `Object` | Optional embedded snippet: `{ code: string, language: string }` |
| `tags` | `string[]` | Multikey tag array (e.g. `["mongodb", "nextjs"]`) |
| `likesCount` | `number` | Denormalized count updated via atomic `$inc` |
| `commentsCount`| `number` | Denormalized count updated via atomic `$inc` |
| `createdAt` | `Date` | Timestamp of publication |
| `updatedAt` | `Date` | Timestamp of last update |

**Indexes:**
- `{ createdAt: -1 }` (Main reverse-chronological feed)
- `{ authorId: 1, createdAt: -1 }` (Author profile feed)
- `{ tags: 1 }` (Multikey index for tag filtering)
- `{ type: 1, createdAt: -1 }` (Feed category tab filtering)
- `{ likesCount: -1, commentsCount: -1, createdAt: -1 }` (Trending ranking)
- `{ title: "text", content: "text", tags: "text" }` (Text search)

---

### C. `projects` Collection
Developer project showcases, repositories, and live demos.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `authorId` | `ObjectId` | Referenced user ID (`users._id`) |
| `title` | `string` | Project name |
| `description` | `string` | Architecture overview & problem statement |
| `technologies` | `string[]` | Multikey array of languages/tools (e.g. `["TypeScript", "WebGL"]`) |
| `githubUrl` | `string` | Public repository link |
| `liveUrl` | `string` | Optional live demo URL |
| `imageUrl` | `string` | Optional showcase banner image URL |
| `starsCount` | `number` | Star / bookmark count |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last updated timestamp |

**Indexes:**
- `{ technologies: 1 }` (Multikey index for stack filtering)
- `{ authorId: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- `{ title: "text", description: "text", technologies: "text" }`

---

### D. `comments` Collection
Comments on technical posts. Stored in a separate collection to avoid the 16MB document size limit and unbounded array growth.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `postId` | `ObjectId` | Referenced post ID (`posts._id`) |
| `authorId` | `ObjectId` | Referenced user ID (`users._id`) |
| `content` | `string` | Comment message |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modified timestamp |

**Indexes:**
- `{ postId: 1, createdAt: 1 }` (Chronological thread display)
- `{ authorId: 1 }`

---

### E. `likes` Collection
Edge collection capturing user likes on posts.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `userId` | `ObjectId` | User who liked |
| `targetType` | `string` | Enum: `"post"`, `"comment"` |
| `targetId` | `ObjectId` | Target post or comment ID |
| `createdAt` | `Date` | Timestamp of interaction |

**Indexes:**
- `{ userId: 1, targetType: 1, targetId: 1 }` (Unique compound index; guarantees zero duplicate likes)
- `{ targetId: 1, targetType: 1 }`

---

### F. `follows` Collection
Directed graph relationships representing follower/following edges.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `followerId` | `ObjectId` | Follower user ID |
| `followingId` | `ObjectId` | Followed user ID |
| `createdAt` | `Date` | Follow timestamp |

**Indexes:**
- `{ followerId: 1, followingId: 1 }` (Unique compound index; prevents duplicate follows)
- `{ followerId: 1 }` (Quick lookup of who user follows)
- `{ followingId: 1 }` (Quick lookup of user's followers)

---

### G. `bookmarks` Collection
Saves posts or projects to a user's private library.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `userId` | `ObjectId` | Authenticated user ID |
| `itemType` | `string` | Enum: `"post"`, `"project"` |
| `itemId` | `ObjectId` | Post ID or Project ID |
| `createdAt` | `Date` | Timestamp saved |

**Indexes:**
- `{ userId: 1, itemType: 1, itemId: 1 }` (Unique compound index)
- `{ userId: 1, createdAt: -1 }`

---

### H. `notifications` Collection
Activity stream notifying developers when other users like, comment, or follow.

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Primary Key |
| `recipientId` | `ObjectId` | Targeted developer |
| `actorId` | `ObjectId` | Developer who triggered event |
| `type` | `string` | Enum: `"like"`, `"comment"`, `"follow"` |
| `entityId` | `ObjectId` | Target entity ID |
| `entityType` | `string` | Enum: `"post"`, `"project"`, `"user"` |
| `message` | `string` | Readable notification text |
| `read` | `boolean` | Read/unread flag |
| `createdAt` | `Date` | Event timestamp |

**Indexes:**
- `{ recipientId: 1, read: 1, createdAt: -1 }` (Optimized for badge query and stream loading)

---

## 3. Modeling Decisions: Embedding vs. Referencing

### What We Embedded:
1. **Code Snippets in `posts`:** Code content and language syntax are bounded and intrinsically tied to the post document. Embedding eliminates a secondary lookup during feed scrolling.
2. **Tags & Skills Arrays:** Post tags (`tags: string[]`) and user competencies (`skills: string[]`) are small, bounded arrays (typically 2 to 8 items). They are embedded directly and indexed with multikey indexes.

### What We Referenced:
1. **Comments as Independent Documents:** If comments were embedded directly inside posts, popular posts with thousands of replies would exceed MongoDB's 16MB document size limit and cause severe page fragmentation from frequent document growth. Referencing enables paginated thread loading (`postId: 1, createdAt: 1`).
2. **Likes & Bookmarks in Separate Collections:** Allows atomic insertions without concurrency contention on the main post document.
3. **Follow Relationships in an Edge Collection:** Avoids unbounded arrays of `followers: ObjectId[]` inside `users`.

---

## 4. Atomic Updates & Concurrency Control

To guarantee consistency under concurrent requests without multi-document distributed locks, VOID uses atomic operators:
- **`$inc`**: Used to update counters (`followersCount`, `followingCount`, `likesCount`, `commentsCount`, `postsCount`, `projectsCount`).
- **Unique Indexes**: Used in conjunction with atomic inserts to prevent duplicate likes, duplicate follows, and duplicate bookmarks.
