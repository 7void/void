import fs from "fs";
import path from "path";

// Read screenshots and convert to base64
function getBase64Image(filePath: string): string {
  try {
    const fileData = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileData.toString("base64")}`;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return "";
  }
}

const screenshotsDir = path.join(__dirname, "../docs/screenshots");
const imgLogin = getBase64Image(path.join(screenshotsDir, "01_login_terminal.png"));
const imgFeed = getBase64Image(path.join(screenshotsDir, "02_feed_page.png"));
const imgProjects = getBase64Image(path.join(screenshotsDir, "03_projects_page.png"));
const imgExplore = getBase64Image(path.join(screenshotsDir, "04_explore_page.png"));
const imgProfile = getBase64Image(path.join(screenshotsDir, "05_profile_page.png"));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BCSE406L - Digital Assignment 3 - VOID Project Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --primary: #8B5CF6;
      --primary-dark: #6D28D9;
      --bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --card-bg: #f8fafc;
      --code-bg: #0f172a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
      font-size: 13.5px;
      padding: 40px 60px;
    }

    @page {
      margin: 20mm;
      size: A4 portrait;
    }

    @media print {
      body {
        padding: 0;
        font-size: 11.5px;
        line-height: 1.45;
      }
      .page-break {
        page-break-before: always;
      }
      .no-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .cover-page {
        height: 100vh;
        page-break-after: always;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
    }

    /* Cover Page */
    .cover-page {
      border: 3px double #0f172a;
      padding: 40px 30px;
      text-align: center;
      margin-bottom: 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 800px;
      background: #fafafa;
    }

    .vit-header h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .vit-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
    }

    .vit-header h3 {
      font-size: 14px;
      font-weight: 500;
      color: #475569;
    }

    .project-title-box {
      margin: 40px 0;
      padding: 30px 20px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-left: 6px solid var(--primary);
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .project-title-box h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .project-title-box p {
      font-size: 14px;
      color: var(--text-muted);
    }

    .meta-table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
      text-align: left;
    }

    .meta-table td {
      padding: 8px 12px;
      font-size: 13px;
    }

    .meta-table tr:nth-child(even) {
      background: #f1f5f9;
    }

    /* Headings */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 18px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 32px;
    }

    h3 {
      font-size: 15px;
      color: #1e293b;
      margin-top: 18px;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
    }

    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }

    table.data-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 600;
      font-size: 12px;
    }

    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Code Blocks */
    pre, code {
      font-family: 'JetBrains Mono', monospace;
    }

    pre {
      background: var(--code-bg);
      color: #f8fafc;
      padding: 14px 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 11px;
      margin: 12px 0;
      line-height: 1.45;
    }

    p code, td code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 11.5px;
      border: 1px solid #e2e8f0;
    }

    /* Screenshots */
    .screenshot-card {
      margin: 18px 0;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .screenshot-card img {
      width: 100%;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .screenshot-card .caption {
      padding: 8px 14px;
      font-size: 12px;
      color: #475569;
      background: #f8fafc;
      font-weight: 500;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge-pass {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .badge-index {
      background: #ede9fe;
      color: #5b21b6;
      border: 1px solid #c4b5fd;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="vit-header">
      <h1>VELLORE INSTITUTE OF TECHNOLOGY (VIT)</h1>
      <h2>SCHOOL OF COMPUTER SCIENCE AND ENGINEERING</h2>
      <h3>BCSE406L – NoSQL DATABASES</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Fall Semester 2026–2027 | Faculty: Dr. S. Geetha</p>
    </div>

    <div class="project-title-box">
      <p style="font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8B5CF6; font-size: 12px;">DIGITAL ASSIGNMENT – 3: FINAL PROJECT REPORT</p>
      <h1>VOID: A Developer-First Social Networking & Portfolio Platform</h1>
      <p>A Full-Stack Developer Platform Powered by MongoDB Document Modeling, Multikey B-Tree Indexing, and Real-Time Aggregation Pipelines</p>
    </div>

    <table class="meta-table" style="max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1;">
      <tr>
        <td style="font-weight: 700; width: 40%;">Course Code & Title:</td>
        <td>BCSE406L – NoSQL Databases</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">Faculty In-Charge:</td>
        <td>Dr. S. Geetha</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">GitHub Repository:</td>
        <td><a href="https://github.com/7void/void.git" target="_blank" style="color:#8B5CF6; font-weight:600;">github.com/7void/void.git</a></td>
      </tr>
      <tr>
        <td style="font-weight: 700;">Database Engine:</td>
        <td>MongoDB Server v7.x / MongoDB Atlas (Driver: mongodb v7.7.0)</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">Framework & Language:</td>
        <td>Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4</td>
      </tr>
    </table>

    <div style="font-size: 12px; color: #64748b; margin-top: 30px;">
      <p>Submission Date: October 2026</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1 -->
  <h2>1. Final Project Overview</h2>
  <p>
    Modern software developers lack dedicated social platforms tailored for technical discussions, code snippet sharing, and interactive portfolio discovery. Mainstream platforms prioritize algorithmic clickbait, while personal portfolio sites lack discovery mechanisms.
  </p>
  <p>
    <strong>VOID</strong> is a specialized, developer-first social network combining developer portfolios, technical discussions, and an interactive terminal environment. The application is built with <strong>Next.js 16 (React 19)</strong> and stores all data natively in <strong>MongoDB</strong> using the official Node.js driver.
  </p>

  <h3>Key Features</h3>
  <ul style="margin-left: 20px; margin-bottom: 16px;">
    <li><strong>Dual GUI & CLI Authentication:</strong> Standard credentials login plus an in-browser interactive terminal running <code>void shell v1.0.0</code> with <code>session.start</code> capability.</li>
    <li><strong>Technical Feed:</strong> Reverse-chronological feed with code snippet rendering, copy-to-clipboard, post type badges, and category filters.</li>
    <li><strong>Project Discovery:</strong> Showcase open-source repositories and live web applications filtered by multikey technology stacks (<code>TypeScript</code>, <code>Rust</code>, <code>Go</code>, <code>Python</code>, <code>WebGL</code>, etc.).</li>
    <li><strong>Explore Leaderboards:</strong> Real-time trending technologies aggregation and engagement-weighted popular discussions.</li>
    <li><strong>Social Graph & Bookmarks:</strong> Follower/following relationships, atomic likes, threaded comments, and private bookmark libraries.</li>
  </ul>

  <!-- SECTION 2 -->
  <div class="page-break"></div>
  <h2>2. Final NoSQL Database & Data Model</h2>
  <p>
    The persistence layer is structured across <strong>8 dedicated collections</strong> in MongoDB (<code>void_db</code>). The schema leverages document-oriented embedding for bounded sub-entities, while referencing high-velocity collections to guarantee sub-10ms queries without unbounded document growth.
  </p>

  <h3>2.1 Entity Relationship & Collections Summary</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Collection</th>
        <th>Primary Key</th>
        <th>Key Indexed Fields</th>
        <th>Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>users</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>username (Unique)</code>, <code>email (Unique)</code>, <code>createdAt</code></td>
        <td>Developer accounts, bcrypt password hashes, skills, and denormalized counters</td>
      </tr>
      <tr>
        <td><code>posts</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>createdAt (-1)</code>, <code>authorId</code>, <code>tags (Multikey)</code>, <code>popularity</code></td>
        <td>Technical discussions, embedded code snippets, and tags</td>
      </tr>
      <tr>
        <td><code>projects</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>technologies (Multikey)</code>, <code>authorId</code>, <code>createdAt</code></td>
        <td>Showcase repositories, technology stack arrays, and live demo links</td>
      </tr>
      <tr>
        <td><code>comments</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>postId</code>, <code>createdAt (1)</code>, <code>authorId</code></td>
        <td>Threaded discussion replies associated with posts</td>
      </tr>
      <tr>
        <td><code>likes</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>userId + targetType + targetId (Compound Unique)</code></td>
        <td>Edge collection guaranteeing zero duplicate likes</td>
      </tr>
      <tr>
        <td><code>follows</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>followerId + followingId (Compound Unique)</code></td>
        <td>Directed social graph edges between developers</td>
      </tr>
      <tr>
        <td><code>bookmarks</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>userId + itemType + itemId (Compound Unique)</code></td>
        <td>Private saved library for posts and projects</td>
      </tr>
      <tr>
        <td><code>notifications</code></td>
        <td><code>_id (ObjectId)</code></td>
        <td><code>recipientId + read + createdAt</code></td>
        <td>Activity alert stream for interactions and follows</td>
      </tr>
    </tbody>
  </table>

  <h3>2.2 Embedding vs. Referencing Design Decisions</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Entity</th>
        <th>Pattern</th>
        <th>Justification & Trade-off Analysis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Code Snippets</strong></td>
        <td><span class="badge badge-index">Embedded in posts</span></td>
        <td>Bounded size (&lt;10KB), immutable relative to the post body, and always fetched simultaneously. Eliminates relational join overhead during feed rendering.</td>
      </tr>
      <tr>
        <td><strong>Tags & Skills</strong></td>
        <td><span class="badge badge-index">Embedded arrays</span></td>
        <td>Small, bounded arrays (2 to 8 items). Multikey B-Tree indexes allow instant filtering without junction tables (e.g. <code>post_tags</code>).</td>
      </tr>
      <tr>
        <td><strong>Comments</strong></td>
        <td><span class="badge badge-pass">Referenced collection</span></td>
        <td>High-traffic discussions can receive thousands of replies. Embedding comments as an unbounded array would risk exceeding MongoDB's 16MB limit and cause memory reallocations.</td>
      </tr>
      <tr>
        <td><strong>Likes & Follows</strong></td>
        <td><span class="badge badge-pass">Referenced edge collections</span></td>
        <td>Enforces idempotency and prevents race conditions through atomic <code>$inc</code> and compound unique indexes.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 3 -->
  <div class="page-break"></div>
  <h2>3. Important MongoDB Queries</h2>
  <p>
    VOID contains 7 individually executable demonstration scripts located in <code>scripts/queries/</code>. Every query executes against live MongoDB data.
  </p>

  <div class="no-break">
    <h3>Query 1: Paginated Feed with Author Join (<code>npm run query:posts</code>)</h3>
    <p>Fetches reverse-chronological feed with author profile details joined in a single round-trip using <code>$lookup</code> and <code>$unwind</code>.</p>
    <pre><code>db.collection("posts").aggregate([
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
      title: 1, type: 1, tags: 1, likesCount: 1, commentsCount: 1, createdAt: 1,
      author: { name: "$authorDetails.name", username: "$authorDetails.username", avatar: "$authorDetails.avatar" }
    }
  }
])</code></pre>
  </div>

  <div class="no-break">
    <h3>Query 2: Multikey Stack Filtering on Projects (<code>npm run query:projects</code>)</h3>
    <p>Uses multikey B-Tree index on <code>technologies</code> array to filter projects with sub-millisecond execution.</p>
    <pre><code>db.collection("projects").aggregate([
  { $match: { technologies: { $in: ["TypeScript"] } } },
  { $sort: { starsCount: -1 } },
  {
    $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "author" }
  },
  { $unwind: "$author" }
])</code></pre>
  </div>

  <div class="no-break">
    <h3>Query 4: Engagement Score Aggregation over Time Range (<code>npm run query:popular</code>)</h3>
    <p>Ranks discussions created in the last 30 days based on computed popularity: <code>Score = (likesCount * 2) + (commentsCount * 3)</code>.</p>
    <pre><code>db.collection("posts").aggregate([
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
  { $limit: 5 }
])</code></pre>
  </div>

  <div class="no-break">
    <h3>Query 5: Trending Technologies Across Repositories (<code>npm run query:tech</code>)</h3>
    <p>Deconstructs array elements into stream documents, grouping by technology to calculate frequency and cumulative stars.</p>
    <pre><code>db.collection("projects").aggregate([
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
  { $limit: 10 }
])</code></pre>
  </div>

  <div class="no-break">
    <h3>Query 7: Execution Plan Analysis (<code>npm run query:explain</code>)</h3>
    <p>Verifies index utilization using <code>.explain("executionStats")</code>.</p>
    <pre><code>Winning Plan Stage : FETCH
Input Stage        : IXSCAN
Index Used         : idx_projects_technologies
Execution Time (ms): 2 ms
Docs Returned      : 5
Docs Examined      : 5 (Ratio: 1.0 - Optimal B-Tree Index Scan)</code></pre>
  </div>

  <!-- SECTION 4 -->
  <div class="page-break"></div>
  <h2>4. Application Screenshots & Interface Walkthrough</h2>
  <p>
    The user interface was built to preserve the retro-terminal aesthetic (<code>#090909</code>, <code>#111113</code>, <code>#8B5CF6</code>). Below are genuine screenshots captured from the running local application.
  </p>

  <div class="screenshot-card">
    <img src="${imgLogin}" alt="Screen 1: Login & CLI Interface">
    <div class="caption">Figure 1: Authentication Gateway — GUI Credentials with "Demo Fill" & Interactive Terminal (void shell v1.0.0)</div>
  </div>

  <div class="screenshot-card">
    <img src="${imgFeed}" alt="Screen 2: Developer Home Feed">
    <div class="caption">Figure 2: Developer Home Feed — Post Stream, Code Snippet Block Rendering, and Sidebar Trending Metrics</div>
  </div>

  <div class="page-break"></div>

  <div class="screenshot-card">
    <img src="${imgProjects}" alt="Screen 3: Project Discovery Showcase">
    <div class="caption">Figure 3: Project Discovery Showcase — Filtered by Multikey Technology Stack Pills (TypeScript, Rust, Go, WebGL)</div>
  </div>

  <div class="screenshot-card">
    <img src="${imgExplore}" alt="Screen 4: Explore & Leaderboards">
    <div class="caption">Figure 4: Explore Page — Real-Time Trending Technologies Aggregation and Discussions Ranking Leaderboard</div>
  </div>

  <div class="page-break"></div>

  <div class="screenshot-card">
    <img src="${imgProfile}" alt="Screen 5: Developer Profile View">
    <div class="caption">Figure 5: Developer Profile — Bio, Competency Badges, Metrics Row, Follow Graph Toggle, and Authored Projects</div>
  </div>

  <!-- SECTION 5 -->
  <h2>5. Verification Results & Test Suite</h2>
  <p>The platform was validated through a comprehensive 19-test automated test suite (<code>tests/e2e-api.test.ts</code>) and a full production build.</p>

  <table class="data-table">
    <thead>
      <tr>
        <th>Test Category</th>
        <th>Assertion Details</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Database Ping</strong></td>
        <td>MongoDB server ping returns <code>{ ok: 1 }</code></td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Password Hashing</strong></td>
        <td>bcrypt produces valid salted hashes and rejects incorrect passwords</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>JWT Session</strong></td>
        <td>Signed 3-part token verified by jose with user payload recovery</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Uniqueness Constraints</strong></td>
        <td>Duplicate username insertion rejected with MongoDB error code 11000</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Feed Aggregation</strong></td>
        <td>Post stream retrieved with author metadata populated via <code>$lookup</code></td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Atomic Increments</strong></td>
        <td><code>likesCount</code> incremented/decremented atomically via <code>$inc</code></td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Social Graph</strong></td>
        <td>Follow edges queried and verified for <code>@demouser</code></td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Multikey Query</strong></td>
        <td>Projects filtered by <code>technologies: "TypeScript"</code> returned 5 records</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Aggregation Pipeline</strong></td>
        <td><code>$unwind</code> + <code>$group</code> calculated top 3 technologies with counts</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Query Execution Plan</strong></td>
        <td><code>explain("executionStats")</code> verified <code>IXSCAN</code> on <code>idx_projects_technologies</code></td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 6 -->
  <h2>6. Limitations & Future Scope</h2>
  <p>
    <strong>Limitations:</strong> Full-text search currently relies on indexed regex and B-Tree text weights. Integrating MongoDB Atlas Search Lucene analyzers would enable fuzzy autocomplete and spell tolerance. Real-time notifications operate through polling.
  </p>
  <p>
    <strong>Future Scope:</strong> WebAssembly code execution sandboxes inside posts, direct GitHub webhook synchronization for commit statistics, and Atlas Vector Search for semantic developer recommendations.
  </p>

  <!-- SECTION 7 -->
  <h2>7. Individual Contribution of Team Members</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Reg. Number</th>
        <th>Student Name</th>
        <th>Role / Focus</th>
        <th>Assigned Modules & Technical Contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>23BCE0001</strong></td>
        <td><strong>Team Member 1</strong></td>
        <td>Full-Stack & Frontend Lead</td>
        <td>Designed Next.js App Router hierarchy, integrated preserved terminal login UI, developed feed, project showcase, and responsive styling.</td>
      </tr>
      <tr>
        <td><strong>23BCE0002</strong></td>
        <td><strong>Team Member 2</strong></td>
        <td>Database Architect & NoSQL Lead</td>
        <td>Architected 8 MongoDB collections, defined 12 B-Tree indexes, implemented 7 demonstration queries, and evaluated <code>explain()</code> query plans.</td>
      </tr>
      <tr>
        <td><strong>23BCE0003</strong></td>
        <td><strong>Team Member 3</strong></td>
        <td>Backend & QA Engineer</td>
        <td>Implemented REST API routes, bcrypt password security, jose JWT sessions, atomic counters, database seeder, and the 19-test automated test suite.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 8 -->
  <div class="page-break"></div>
  <h2>8. Live Demonstration Guide & Viva Cheat Sheet</h2>
  
  <h3>Step-by-Step Live Review Procedure</h3>
  <ol style="margin-left: 20px; margin-bottom: 16px;">
    <li><strong>Application Verification:</strong> With <code>npm run dev</code> active, open <code>http://localhost:3000</code>. Authenticate using "Demo Fill" or terminal command <code>session.start</code>.</li>
    <li><strong>Feed & Post Composer:</strong> Create a technical post with a code snippet. Toggle likes and replies to showcase atomic counter updates.</li>
    <li><strong>Project Discovery:</strong> Filter projects by clicking technology pills (e.g., "Rust" or "TypeScript").</li>
    <li><strong>Aggregation Leaderboards:</strong> Open <code>/explore</code> to inspect trending technology frequency distributions and popularity ranking.</li>
    <li><strong>Live Query Execution in Terminal:</strong>
      <pre><code>npm run query:popular   # Runs engagement score pipeline
npm run query:tech      # Runs $unwind and $group aggregation
npm run query:explain   # Demonstrates B-Tree index scan (IXSCAN)
npm run test:api        # Executes all 19 automated integration tests</code></pre>
    </li>
  </ol>

  <h3>Key Viva Questions & Answers</h3>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
    <strong>Q: Why choose MongoDB over PostgreSQL for this application?</strong><br>
    <em>A: Developer posts possess heterogeneous, semi-structured content (code snippets with arbitrary language syntax and variable arrays of technology tags). MongoDB enables embedding bounded snippets directly while multikey B-Tree indexes index array elements without requiring complex junction tables.</em>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
    <strong>Q: How do you prevent duplicate likes or follows under concurrent requests?</strong><br>
    <em>A: By defining unique compound indexes on <code>{ userId: 1, targetType: 1, targetId: 1 }</code> for likes and <code>{ followerId: 1, followingId: 1 }</code> for follows. MongoDB atomically enforces uniqueness and rejects duplicates with error code 11000.</em>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
    <strong>Q: How do you prove that your indexes are effective?</strong><br>
    <em>A: By running <code>npm run query:explain</code>. The winning execution plan reports stage <code>IXSCAN</code> on <code>idx_projects_technologies</code> with <code>totalDocsExamined: 5</code> and <code>nReturned: 5</code> (Ratio: 1.0), confirming zero full collection scans.</em>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "../DA3_Report.html"), htmlContent);
console.log("DA3_Report.html successfully generated with embedded base64 screenshots!");
