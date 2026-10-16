# VOID — Course Submission Evidence Log Template

This evidence log documents execution proofs, test runs, database initialization steps, and query benchmarks for the NoSQL course evaluation.

---

## 1. System Environment
- **Operating System:** Windows 11
- **Node.js Runtime:** v20+
- **Next.js Version:** 16.3.0 (Turbopack)
- **Database Engine:** MongoDB Server v7.x / MongoDB Atlas
- **Official Driver:** `mongodb` ^7.7.0
- **Validation:** Zod ^4.6.7
- **Security:** bcryptjs ^3.0.3, jose ^6.2.12

---

## 2. Verification Log Summary

| Verification Step | Command | Result | Evidence / Notes |
|---|---|---|---|
| Index Initialization | `npm run indexes` | **PASS (Exit 0)** | Created 12 unique, compound, and multikey indexes across 8 collections |
| Database Seeding | `npm run seed` | **PASS (Exit 0)** | Inserted 6 developers, 8 technical posts, 7 projects, comments, likes, bookmarks, and follows |
| Production Build | `npm run build` | **PASS (Exit 0)** | All 24 routes (11 static, 13 dynamic API endpoints) compiled cleanly |
| Automated Test Suite | `npm run test:api` | **PASS (19/19)** | Verified auth, uniqueness constraints, atomic operations, lookups, and explain plans |
| Paginated Posts Query | `npm run query:posts` | **PASS (Exit 0)** | Retrieved reverse-chronological feed with author `$lookup` |
| Tech Stack Filter Query | `npm run query:projects` | **PASS (Exit 0)** | Filtered projects by `technologies: "TypeScript"` using multikey index |
| Social Graph Query | `npm run query:follows` | **PASS (Exit 0)** | Resolved follower & following edges for `@demouser` |
| Popular Posts Aggregation | `npm run query:popular` | **PASS (Exit 0)** | Calculated weighted score `(likes*2 + comments*3)` across 30 days |
| Trending Tech Aggregation | `npm run query:tech` | **PASS (Exit 0)** | Unwound tech arrays and aggregated project frequencies and stars |
| Global Search Query | `npm run query:search` | **PASS (Exit 0)** | Multi-field search executed across users, posts, and projects |
| Execution Plan Analysis | `npm run query:explain` | **PASS (Exit 0)** | Verified `IXSCAN` on `idx_projects_technologies` (`totalDocsExamined: 5, nReturned: 5`) |

---

## 3. Query Execution Evidence Snapshots

### Snapshot: Multikey Index Query Execution Plan (`idx_projects_technologies`)
```text
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

### Snapshot: Trending Technologies Aggregation Pipeline Output
```text
[#1] TypeScript       -> 5 projects | Total Stars: 1542
     Featured: HyperGrid WebGL, NeuralDiff Code Reviewer
[#2] React            -> 3 projects | Total Stars: 897
     Featured: HyperGrid WebGL, DevPulse Monitor
[#3] Tailwind CSS     -> 3 projects | Total Stars: 739
     Featured: HyperGrid WebGL, VOID Platform Engine
[#4] Docker           -> 2 projects | Total Stars: 1411
     Featured: AetherKV Distributed Store, KubeLens CLI
[#5] Rust             -> 2 projects | Total Stars: 1278
     Featured: AetherKV Distributed Store, BpfTrace Viz
```

---

## 4. Live Demonstration Steps for Viva

1. **Terminal 1 — Launch Local Server:**
   ```bash
   npm run dev
   ```
2. **Access Application:**
   Open `http://localhost:3000` in browser.
3. **Login Options:**
   - **GUI Login:** Click "Demo Fill" to auto-populate `demo@void.dev` and `password123`, then click **Sign in**.
   - **CLI Login:** In the right terminal panel, type `session.start` and press `Enter` to authenticate.
4. **Demonstrate Home Feed:**
   - View technical posts with syntax-styled code snippets.
   - Click like button (counter updates in real-time).
   - Click "Attach code snippet" to publish a new post.
5. **Demonstrate Project Discovery:**
   - Navigate to `/projects`.
   - Filter by technology pills (e.g. click "Rust" or "TypeScript").
   - Click "Showcase Project" to add a new project.
6. **Demonstrate Aggregations & Search:**
   - Navigate to `/explore`.
   - Type a search query (e.g., `MongoDB`).
   - View grouped results: Developers, Posts, and Projects.
   - View trending technology ranking and top discussions leaderboard.
7. **Demonstrate Terminal Query Scripts:**
   - Run `npm run query:popular` in terminal to show MongoDB aggregation calculations live.
   - Run `npm run query:explain` to show index execution statistics.
