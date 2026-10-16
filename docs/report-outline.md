# VOID — Academic Report & Viva Presentation Outline

This report outline provides the formal structure and content summaries for the NoSQL Databases course project report and viva evaluation.

---

## 1. Project Overview & Motivation
- **Title:** VOID — A Developer-First Social Networking & Portfolio Platform
- **Problem Statement:** Mainstream social platforms suffer from high noise, lack of native code formatting, disconnected portfolio links, and inability to filter projects by granular technical stacks.
- **Solution:** A specialized developer community combining real-time feeds, code snippet sharing, interactive terminal sessions, GitHub repository discovery, and low-latency MongoDB document queries.
- **Target Audience:** Software engineers, open-source contributors, student developers, and recruiters.

---

## 2. Technology Stack & Architectural Rationale
- **Frontend & Routing:** Next.js 16 App Router (React 19, Server Components & Client Hooks).
- **Styling System:** Tailwind CSS v4, custom retro-terminal dark mode tokens (`#090909`, `#111113`, `#8B5CF6`).
- **Icons:** Lucide React icons with custom SVG enhancements.
- **Database:** MongoDB Server / MongoDB Atlas.
- **Database Driver:** Official MongoDB Node.js Driver (`mongodb` v7.7).
- **Validation:** Zod v4 schemas for end-to-end request validation.
- **Security & Session:** bcryptjs for salted hashing (10 rounds); jose for HS256 JWT sessions stored in HTTP-only cookies.

---

## 3. Final NoSQL Data Model & Collections
- **Document Schemas:**
  - `users`: Developer profile, credentials, counters (`followersCount`, `followingCount`, `postsCount`, `projectsCount`).
  - `posts`: Technical discussions, embedded code snippets, multikey tags.
  - `comments`: Relational thread references with fast chronological queries.
  - `likes`: Compound unique edge records for idempotency.
  - `follows`: Directed graph edges with follower/following indices.
  - `projects`: Repositories, technology arrays, demo links.
  - `bookmarks`: User private bookmarks library.
  - `notifications`: Activity alerts stream with unread index.
- **Embedding vs. Referencing Discussion:**
  - Why code snippets are embedded (bounded, 1-to-1 relationship, eliminates joins).
  - Why comments and follows are referenced (prevents 16MB limit, avoids unbounded document expansion).

---

## 4. Key MongoDB Database Queries & Implementation
1. **Feed Aggregation with User Join (`$lookup`, `$unwind`, `$sort`, `$skip`, `$limit`).**
2. **Technology Filtering via Multikey Array Indexing (`$match`, `$in`).**
3. **Follower Graph Traversal (`$match` with `$lookup`).**
4. **Weighted Popularity Scoring (`$addFields`, `$add`, `$multiply`, `$sort`).**
5. **Trending Technologies Aggregation Pipeline (`$unwind`, `$group`, `$sort`, `$limit`, `$project`).**
6. **Multi-Field Text & Regex Search across 3 collections.**
7. **Query Optimization & Execution Plan Analysis using `.explain("executionStats")`.**

---

## 5. Indexes & Performance Optimization
- **Index Definitions:** 12 specialized indexes across 8 collections.
- **Execution Plan Evidence:** Demonstrating `IXSCAN` over `COLLSCAN`.
- **Atomic Concurrency Control:** Utilization of `$inc` for counters and unique compound keys for zero race-condition duplicates.

---

## 6. Verification & Test Results
- **Automated Test Suite:** 19/19 passing tests (`tests/e2e-api.test.ts`).
- **Turbopack Build:** 24 routes successfully compiled with zero errors.
- **Interactive Verification:** Login form, terminal CLI login, post composer, project showcase, like/comment actions, search, and bookmarks.

---

## 7. Limitations & Future Scope
- **Current Limitations:**
  - Full-text search uses indexed regex and text weights; Atlas Search can provide fuzzy spell-correction.
  - Real-time notifications operate via polling rather than WebSockets.
- **Future Scope:**
  - Live collaboration on code snippets via WebRTC / CRDTs.
  - Direct integration with GitHub Webhooks for auto-syncing commit counts and releases.
  - Vector similarity search for matching developers based on semantic project descriptions.

---

## 8. Viva Q&A Cheat Sheet
- **Q: Why use MongoDB instead of PostgreSQL for this project?**
  *A:* Developer posts possess varied, semi-structured schemas (discussions vs. questions vs. code snippets with arbitrary language syntax). Multikey indexing allows filtering by arbitrary technology stack arrays directly without junction tables.
- **Q: How do you prevent duplicate likes or follows?**
  *A:* Through unique compound indexes on `{ userId: 1, targetType: 1, targetId: 1 }` and `{ followerId: 1, followingId: 1 }`. MongoDB guarantees atomic insertion and rejects duplicates with error code 11000.
- **Q: How does the popularity algorithm work?**
  *A:* In our aggregation pipeline, we compute `popularityScore = (likesCount * 2) + (commentsCount * 3)` for posts within the last 30 days, sorting descending to produce the leaderboard in a single query.
