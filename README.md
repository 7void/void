# VOID — A Developer-First Social Networking Platform

VOID is a modern, developer-first social network combining technical discussions, code snippet sharing, interactive terminal sessions, and project showcases. Built with Next.js App Router, Tailwind CSS, and the official MongoDB Node.js driver.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v20+
- **MongoDB** (Local MongoDB Server or MongoDB Atlas free cluster)

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI` points to your active database:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/void_db
JWT_SECRET=void_dev_secret_jwt_key_please_change_in_production_min32chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Database Indexes
Creates 12 unique, compound, and multikey indexes across all collections:
```bash
npm run indexes
```

### 5. Seed Database
Populates realistic developer profiles, technical discussions, code snippets, projects, and follows:
```bash
npm run seed
```

### 6. Run Automated Test Suite
Executes end-to-end integration tests validating auth, uniqueness constraints, atomic increments, and query execution plans:
```bash
npm run test:api
```

### 7. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

For quick evaluation during demonstrations or viva:
- **Email:** `demo@void.dev`
- **Password:** `password123`
*(Or click the "Demo Fill" button on the login screen, or type `session.start` in the interactive terminal panel!)*

---

## 🚀 Key Features

1. **Retro Terminal & Dark Mode Aesthetic:** Deep void black (`#090909`), dark card containers (`#111113`), and electric violet accents (`#8B5CF6`).
2. **Interactive CLI & GUI Auth:** Supports standard GUI credentials login as well as an in-browser interactive terminal with commands like `session.start`, `help`, `tip`, `stats`, and `quote`.
3. **Technical Post Feed:** Reverse-chronological and following feeds with support for syntax-highlighted code snippets, Markdown text, and category filters.
4. **Project Discovery Showcase:** Filter open-source projects by technology stack (`TypeScript`, `Rust`, `Go`, `Python`, `React`, `MongoDB`, `WebGL`) powered by MongoDB multikey indexes.
5. **Explore & Global Search:** Aggregations for top trending technologies and popularity-ranked discussions alongside cross-collection search.
6. **Social Graph & Bookmarking:** Follow/unfollow other developers, atomic likes, discussion replies, and private bookmark library.

---

## 📊 NoSQL Demonstration Queries

Run any of the 7 individually executable demonstration scripts:

| Command | Query Description |
|---|---|
| `npm run query:posts` | Paginated reverse-chronological feed with author `$lookup` |
| `npm run query:projects` | Filter projects by technology stack using multikey index |
| `npm run query:follows` | Social graph traversal of follower/following relationships |
| `npm run query:popular` | Time-range aggregation computing weighted popularity score |
| `npm run query:tech` | `$unwind` and `$group` aggregation pipeline for trending technologies |
| `npm run query:search` | Multi-collection search across users, posts, and projects |
| `npm run query:explain` | Query execution analysis using `explain("executionStats")` showing `IXSCAN` |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/login/       # Preserved original login screen
│   ├── api/                # REST API routes (auth, posts, projects, users, etc.)
│   ├── bookmarks/          # Saved posts and projects
│   ├── explore/            # Global search & trending aggregations
│   ├── feed/               # Home developer feed & composer
│   ├── posts/[id]/         # Post detail and comments thread
│   ├── profile/[username]/ # Developer profile page
│   ├── projects/           # Project showcase with tech filter
│   ├── projects/[id]/      # Project detail page
│   └── settings/           # Profile and account settings
├── components/
│   ├── auth/               # LoginCard, LoginForm, SocialLoginButtons, AuthToggle
│   ├── feed/               # PostCard, PostComposer, CommentSection, SidebarTrending
│   ├── layout/             # Universal Navbar with notifications & search
│   ├── profile/            # ProfileView component
│   ├── projects/           # ProjectCard, ProjectModal
│   └── terminal/           # TerminalWindow, TerminalPanel, TerminalHeader
├── docs/
│   ├── database-design.md  # Detailed schemas, embedding vs referencing, indexing
│   ├── query-guide.md      # Explanations of all demonstration queries & pipelines
│   ├── evidence-log.md     # Academic submission test logs & viva demo guide
│   └── report-outline.md   # Report outline and viva presentation guide
├── lib/
│   ├── auth.ts             # JWT session signing & bcrypt password verification
│   ├── auth-context.tsx    # Client authentication state provider
│   ├── db.ts               # MongoDB driver client with connection caching
│   ├── types.ts            # TypeScript interfaces and MongoDB document types
│   └── validations.ts      # Zod validation schemas
├── scripts/
│   ├── indexes.ts          # Index creation script
│   ├── seed.ts             # Reproducible sample data seeder
│   └── queries/            # 7 individual demonstration query scripts
├── tests/
│   └── e2e-api.test.ts     # Automated integration test suite
└── PROJECT_STATUS.md       # Implementation status and verification matrix
```

---

## 🛡️ License
MIT License. Built for developer communities.
