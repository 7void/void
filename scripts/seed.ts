import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

export async function seedDatabase() {
  console.log("Starting VOID database seeding...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected to database: ${db.databaseName}`);

    // Clean existing data for clean seed
    console.log("Clearing existing collections...");
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("comments").deleteMany({});
    await db.collection("likes").deleteMany({});
    await db.collection("follows").deleteMany({});
    await db.collection("projects").deleteMany({});
    await db.collection("bookmarks").deleteMany({});
    await db.collection("notifications").deleteMany({});

    // Hash standard password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Seed Developers
    console.log("Seeding developer users...");
    const userIds = {
      demo: new ObjectId(),
      alex: new ObjectId(),
      sarah: new ObjectId(),
      marcus: new ObjectId(),
      priya: new ObjectId(),
      elena: new ObjectId(),
    };

    const users = [
      {
        _id: userIds.demo,
        name: "Demo Developer",
        username: "demouser",
        email: "demo@void.dev",
        passwordHash: hashedPassword,
        bio: "Full-stack engineer building developer tooling & modern web apps. VOID enthusiast.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/demouser",
        website: "https://void.dev",
        skills: ["TypeScript", "Next.js", "React", "MongoDB", "Node.js", "Tailwind CSS"],
        followersCount: 4,
        followingCount: 3,
        postsCount: 3,
        projectsCount: 2,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: userIds.alex,
        name: "Alex Chen",
        username: "alexchen",
        email: "alex@void.dev",
        passwordHash: hashedPassword,
        bio: "Staff Engineer. Rust & distributed databases. Building high-throughput systems.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/alexchen-dev",
        website: "https://alexchen.codes",
        skills: ["Rust", "Distributed Systems", "MongoDB", "Go", "Docker", "gRPC"],
        followersCount: 5,
        followingCount: 2,
        postsCount: 4,
        projectsCount: 2,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: userIds.sarah,
        name: "Sarah Connor",
        username: "sarahc",
        email: "sarah@void.dev",
        passwordHash: hashedPassword,
        bio: "Backend Architect & Cloud Native enthusiast. Kubernetes, Kafka, and NoSQL modeling.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/sarahconnor-sys",
        website: "https://cloudcraft.dev",
        skills: ["Go", "Kubernetes", "MongoDB", "Kafka", "PostgreSQL", "Terraform"],
        followersCount: 4,
        followingCount: 3,
        postsCount: 3,
        projectsCount: 1,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: userIds.marcus,
        name: "Marcus Vance",
        username: "marcusv",
        email: "marcus@void.dev",
        passwordHash: hashedPassword,
        bio: "Frontend design engineer obsessing over type systems, micro-interactions, and WebGL.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/marcusvance",
        website: "https://vance.design",
        skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Three.js", "CSS"],
        followersCount: 3,
        followingCount: 4,
        postsCount: 3,
        projectsCount: 2,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: userIds.priya,
        name: "Priya Sharma",
        username: "priyadev",
        email: "priya@void.dev",
        passwordHash: hashedPassword,
        bio: "AI/ML Systems Researcher. Working with vector embeddings, LLM orchestration, and Python.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/priyasharma-ai",
        website: "https://priyasharma.io",
        skills: ["Python", "PyTorch", "FastAPI", "MongoDB", "TypeScript", "LangChain"],
        followersCount: 4,
        followingCount: 2,
        postsCount: 3,
        projectsCount: 1,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: userIds.elena,
        name: "Elena Rostova",
        username: "elenar",
        email: "elena@void.dev",
        passwordHash: hashedPassword,
        bio: "Reliability & Performance Engineer. Linux kernel tracing, eBPF, and database internals.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/elenarostova",
        website: "https://kernelnotes.org",
        skills: ["C++", "Linux", "Rust", "MongoDB", "eBPF", "Prometheus"],
        followersCount: 3,
        followingCount: 3,
        postsCount: 2,
        projectsCount: 1,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    await db.collection("users").insertMany(users);

    // 2. Seed Follow Relationships
    console.log("Seeding follow relationships...");
    const follows = [
      { followerId: userIds.demo, followingId: userIds.alex, createdAt: new Date() },
      { followerId: userIds.demo, followingId: userIds.sarah, createdAt: new Date() },
      { followerId: userIds.demo, followingId: userIds.marcus, createdAt: new Date() },
      { followerId: userIds.alex, followingId: userIds.sarah, createdAt: new Date() },
      { followerId: userIds.alex, followingId: userIds.demo, createdAt: new Date() },
      { followerId: userIds.sarah, followingId: userIds.alex, createdAt: new Date() },
      { followerId: userIds.sarah, followingId: userIds.demo, createdAt: new Date() },
      { followerId: userIds.marcus, followingId: userIds.demo, createdAt: new Date() },
      { followerId: userIds.marcus, followingId: userIds.alex, createdAt: new Date() },
      { followerId: userIds.priya, followingId: userIds.demo, createdAt: new Date() },
      { followerId: userIds.priya, followingId: userIds.alex, createdAt: new Date() },
      { followerId: userIds.elena, followingId: userIds.alex, createdAt: new Date() },
      { followerId: userIds.elena, followingId: userIds.sarah, createdAt: new Date() },
    ];
    await db.collection("follows").insertMany(follows);

    // 3. Seed Projects
    console.log("Seeding showcase projects...");
    const projectIds = {
      p1: new ObjectId(),
      p2: new ObjectId(),
      p3: new ObjectId(),
      p4: new ObjectId(),
      p5: new ObjectId(),
      p6: new ObjectId(),
      p7: new ObjectId(),
    };

    const projects = [
      {
        _id: projectIds.p1,
        authorId: userIds.marcus,
        title: "HyperGrid WebGL",
        description: "Ultra-fast tabular data visualization canvas rendering up to 1,000,000 rows at 60 FPS. Features smooth column virtualization, custom cell shaders, and real-time streaming sockets.",
        technologies: ["TypeScript", "WebGL", "React", "Tailwind CSS"],
        githubUrl: "https://github.com/marcusvance/hypergrid-webgl",
        liveUrl: "https://hypergrid.dev",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        starsCount: 342,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p2,
        authorId: userIds.alex,
        title: "AetherKV Distributed Store",
        description: "High-throughput in-memory key-value engine with Raft distributed consensus, log-structured merge trees, and predictable sub-millisecond p99 latencies.",
        technologies: ["Rust", "Distributed Systems", "gRPC", "Docker"],
        githubUrl: "https://github.com/alexchen-dev/aether-kv",
        liveUrl: "https://aetherkv.io",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
        starsCount: 890,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p3,
        authorId: userIds.sarah,
        title: "KubeLens CLI",
        description: "Terminal user interface for Kubernetes clusters. Real-time resource heatmaps, interactive container log streaming, and pod diagnostics built with Bubbletea.",
        technologies: ["Go", "Kubernetes", "Docker", "Linux"],
        githubUrl: "https://github.com/sarahconnor-sys/kubelens-cli",
        liveUrl: "",
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        starsCount: 521,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p4,
        authorId: userIds.priya,
        title: "NeuralDiff Code Reviewer",
        description: "AST-aware semantic code diffing agent powered by local embedding models and MongoDB vector search. Detects behavioral breaks across API contracts.",
        technologies: ["Python", "PyTorch", "FastAPI", "MongoDB", "TypeScript"],
        githubUrl: "https://github.com/priyasharma-ai/neural-diff",
        liveUrl: "https://neuraldiff.ai",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80",
        starsCount: 415,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p5,
        authorId: userIds.demo,
        title: "VOID Platform Engine",
        description: "Developer-first social network combining developer portfolios, technical feeds, interactive terminals, and rich MongoDB aggregations.",
        technologies: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
        githubUrl: "https://github.com/demouser/void-network",
        liveUrl: "https://void.dev",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        starsCount: 230,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p6,
        authorId: userIds.demo,
        title: "DevPulse Monitor",
        description: "Lightweight background daemon for developers that monitors git repositories, dirty state, branch divergences, and PR reviews directly in your status bar.",
        technologies: ["TypeScript", "Node.js", "React", "Tailwind CSS"],
        githubUrl: "https://github.com/demouser/devpulse-monitor",
        liveUrl: "",
        imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
        starsCount: 167,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: projectIds.p7,
        authorId: userIds.elena,
        title: "BpfTrace Viz",
        description: "Web front-end for Linux eBPF kernel tracing scripts. Visualizes flame graphs, system call latency distributions, and socket buffer queue depths.",
        technologies: ["Rust", "Linux", "TypeScript", "React"],
        githubUrl: "https://github.com/elenarostova/bpftrace-viz",
        liveUrl: "https://bpftrace.dev",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        starsCount: 388,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    await db.collection("projects").insertMany(projects);

    // 4. Seed Posts
    console.log("Seeding technical posts...");
    const postIds = {
      post1: new ObjectId(),
      post2: new ObjectId(),
      post3: new ObjectId(),
      post4: new ObjectId(),
      post5: new ObjectId(),
      post6: new ObjectId(),
      post7: new ObjectId(),
      post8: new ObjectId(),
    };

    const posts = [
      {
        _id: postIds.post1,
        authorId: userIds.alex,
        type: "discussion",
        title: "Why MongoDB Document Modeling Wins for Developer Communities",
        content: `When designing the data architecture for a social network like VOID, the question of embedding versus referencing comes up immediately.

In relational systems, loading a post feed with authors, tags, and comment summaries often leads to complex 5-way joins that cripple database read throughput under high concurrency.

In MongoDB, we can embed bounded, static metadata (like post tags and code snippets) directly inside the post document while referencing high-velocity independently mutating entities (such as users, likes, and comments). With proper compound indexes on \`{ createdAt: -1 }\` and \`$lookup\` aggregations, feed queries execute in single-digit milliseconds.`,
        tags: ["mongodb", "architecture", "nosql", "performance"],
        likesCount: 18,
        commentsCount: 4,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post2,
        authorId: userIds.marcus,
        type: "snippet",
        title: "Zero-Layout-Shift Terminal Text Streaming in React 19",
        content: `Here is a custom hook we implemented for the VOID interactive CLI panel. It streams characters smoothly without causing cumulative layout shifts (CLS) by locking the baseline container height and auto-scrolling only when the user is already pinned to the bottom.`,
        codeSnippet: {
          language: "typescript",
          code: `export function useTerminalScroll(ref: React.RefObject<HTMLDivElement>, deps: unknown[]) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, deps);
}`,
        },
        tags: ["react", "typescript", "ui", "terminal"],
        likesCount: 24,
        commentsCount: 3,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post3,
        authorId: userIds.sarah,
        type: "question",
        title: "Handling Optimistic Updates for Atomic $addToSet in Next.js Server Actions?",
        content: `When handling high-frequency user actions like toggling a bookmark or like, we want optimistic UI feedback on the client while guaranteeing atomicity on the server via MongoDB \`$addToSet\` or \`$pull\`.

If the server operation fails due to network dropouts or duplicate constraints, what rollback pattern are you currently finding most reliable in React 19? Rollback by state snapshot or revalidation?`,
        tags: ["nextjs", "react", "mongodb", "patterns"],
        likesCount: 15,
        commentsCount: 5,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post4,
        authorId: userIds.demo,
        type: "project_update",
        title: "Shipped VOID v1.0 — The Developer Social Network",
        content: `Excited to announce the initial release of VOID! Built with Next.js App Router, Tailwind CSS, Lucide icons, and official MongoDB driver.

Key capabilities included in this release:
- Real-time technical feed with code snippet rendering
- Project showcase with technology stack filtering
- Rich MongoDB aggregation pipelines for popular topics & trending technologies
- Full follower graph and bookmarking system

Check out our GitHub repository or try the interactive CLI login!`,
        tags: ["nextjs", "typescript", "mongodb", "release"],
        likesCount: 42,
        commentsCount: 7,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post5,
        authorId: userIds.priya,
        type: "snippet",
        title: "Fast Local Vector Embeddings with Python & MongoDB",
        content: `If you are storing semantic embeddings for developer posts or documentation, here is a concise pattern combining FastEmbed with MongoDB upserts.`,
        codeSnippet: {
          language: "python",
          code: `from fastembed import TextEmbedding
from pymongo import MongoClient

model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
client = MongoClient("mongodb://127.0.0.1:27017")
collection = client["void_db"]["embeddings"]

def index_post(post_id: str, text: str):
    embeddings = list(model.embed([text]))[0].tolist()
    collection.update_one(
        {"postId": post_id},
        {"$set": {"embedding": embeddings, "updatedAt": datetime.utcnow()}},
        upsert=True
    )`,
        },
        tags: ["python", "ai", "mongodb", "vectors"],
        likesCount: 31,
        commentsCount: 2,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post6,
        authorId: userIds.elena,
        type: "discussion",
        title: "Analyzing MongoDB Query Plans with explain('executionStats')",
        content: `Always run \`.explain("executionStats")\` before pushing aggregations to production!

Look specifically at:
1. \`totalDocsExamined\` vs \`nReturned\`: When an index is doing its job, this ratio should be near 1:1.
2. \`IXSCAN\` vs \`COLLSCAN\`: If you see COLLSCAN on collections with more than 10k items, you are burning CPU and I/O.
3. In compound indexes, order matters: Equality first, Sort second, Range last (ESR rule).`,
        tags: ["mongodb", "database", "performance", "nosql"],
        likesCount: 29,
        commentsCount: 6,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post7,
        authorId: userIds.alex,
        type: "snippet",
        title: "Raft Consensus Heartbeat Loop in Rust",
        content: `Here is a lightweight heartbeat task pattern in Tokio that prevents split-brain elections by using jittered election timeouts.`,
        codeSnippet: {
          language: "rust",
          code: `async fn heartbeat_loop(peer_sender: mpsc::Sender<HeartbeatMessage>, term: u64) {
    let mut interval = tokio::time::interval(Duration::from_millis(150));
    loop {
        interval.tick().await;
        let msg = HeartbeatMessage { term, leader_id: 1, timestamp: Instant::now() };
        if peer_sender.send(msg).await.is_err() {
            eprintln!("Cluster partition detected!");
            break;
        }
    }
}`,
        },
        tags: ["rust", "distributed", "systems", "tokio"],
        likesCount: 27,
        commentsCount: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: postIds.post8,
        authorId: userIds.demo,
        type: "question",
        title: "What is your stack preference for developer social platforms in 2026?",
        content: `Curious to hear from the VOID community: When building a modern developer platform, do you prefer a unified framework (like Next.js with Server Actions and MongoDB) or a decoupled Golang/Rust API with a separate SPA frontend?`,
        tags: ["architecture", "webdev", "discuss", "nextjs"],
        likesCount: 19,
        commentsCount: 4,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    await db.collection("posts").insertMany(posts);

    // 5. Seed Comments
    console.log("Seeding comments...");
    const comments = [
      {
        _id: new ObjectId(),
        postId: postIds.post1,
        authorId: userIds.sarah,
        content: "Spot on! We migrated from a fragmented relational setup to MongoDB Atlas for our feed service and cut latency by 65%. The ESR rule for indexing is gold.",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        postId: postIds.post1,
        authorId: userIds.demo,
        content: "Great breakdown Alex! The balance between embedding bounded arrays and referencing high-cardinality items is the most critical design decision.",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        postId: postIds.post2,
        authorId: userIds.alex,
        content: "Clean hook Marcus. Pinned scrolling is essential for CLI terminals so users aren't interrupted while inspecting earlier outputs.",
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        postId: postIds.post3,
        authorId: userIds.marcus,
        content: "We use useOptimistic combined with a local draft snapshot. If the server action throws, we roll back to the pre-action snapshot with a toast notification.",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        postId: postIds.post4,
        authorId: userIds.priya,
        content: "Congratulations on the launch! The retro terminal vibe combined with dark mode aesthetics looks incredible.",
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        postId: postIds.post4,
        authorId: userIds.elena,
        content: "The query performance is snappy. Love the direct tech stack filter for projects.",
        createdAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    await db.collection("comments").insertMany(comments);

    // 6. Seed Likes
    console.log("Seeding likes...");
    const likes = [
      { userId: userIds.demo, targetType: "post", targetId: postIds.post1, createdAt: new Date() },
      { userId: userIds.demo, targetType: "post", targetId: postIds.post2, createdAt: new Date() },
      { userId: userIds.alex, targetType: "post", targetId: postIds.post4, createdAt: new Date() },
      { userId: userIds.sarah, targetType: "post", targetId: postIds.post4, createdAt: new Date() },
      { userId: userIds.marcus, targetType: "post", targetId: postIds.post4, createdAt: new Date() },
      { userId: userIds.priya, targetType: "post", targetId: postIds.post4, createdAt: new Date() },
      { userId: userIds.elena, targetType: "post", targetId: postIds.post1, createdAt: new Date() },
      { userId: userIds.alex, targetType: "post", targetId: postIds.post3, createdAt: new Date() },
    ];
    await db.collection("likes").insertMany(likes);

    // 7. Seed Bookmarks
    console.log("Seeding bookmarks...");
    const bookmarks = [
      { userId: userIds.demo, itemType: "post", itemId: postIds.post1, createdAt: new Date() },
      { userId: userIds.demo, itemType: "post", itemId: postIds.post2, createdAt: new Date() },
      { userId: userIds.demo, itemType: "project", itemId: projectIds.p1, createdAt: new Date() },
      { userId: userIds.demo, itemType: "project", itemId: projectIds.p2, createdAt: new Date() },
      { userId: userIds.alex, itemType: "post", itemId: postIds.post4, createdAt: new Date() },
    ];
    await db.collection("bookmarks").insertMany(bookmarks);

    // 8. Seed Notifications
    console.log("Seeding notifications...");
    const notifications = [
      {
        recipientId: userIds.demo,
        actorId: userIds.alex,
        type: "like",
        entityId: postIds.post4,
        entityType: "post",
        message: "liked your post 'Shipped VOID v1.0 — The Developer Social Network'",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        recipientId: userIds.demo,
        actorId: userIds.sarah,
        type: "follow",
        entityId: userIds.demo,
        entityType: "user",
        message: "started following you",
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        recipientId: userIds.demo,
        actorId: userIds.priya,
        type: "comment",
        entityId: postIds.post4,
        entityType: "post",
        message: "commented on 'Shipped VOID v1.0 — The Developer Social Network'",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        recipientId: userIds.demo,
        actorId: userIds.marcus,
        type: "like",
        entityId: postIds.post4,
        entityType: "post",
        message: "liked your project 'VOID Platform Engine'",
        read: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ];
    await db.collection("notifications").insertMany(notifications);

    console.log("VOID database seeded successfully with realistic data!");
  } catch (err) {
    console.error("Seeding failed:", err);
    throw err;
  } finally {
    await client.close();
  }
}

// Execute directly if run as a script
if (require.main === module || process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
