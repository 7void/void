import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_db";

export async function createIndexes() {
  console.log("Connecting to MongoDB for index initialization...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected to database: ${db.databaseName}`);

    // 1. Users collection indexes
    console.log("Creating indexes for users collection...");
    const users = db.collection("users");
    await users.createIndex({ username: 1 }, { unique: true, name: "idx_users_username_unique" });
    await users.createIndex({ email: 1 }, { unique: true, name: "idx_users_email_unique" });
    await users.createIndex({ createdAt: -1 }, { name: "idx_users_created_at" });
    await users.createIndex(
      { name: "text", username: "text", skills: "text", bio: "text" },
      { name: "idx_users_search_text", weights: { username: 10, name: 5, skills: 3, bio: 1 } }
    );

    // 2. Posts collection indexes
    console.log("Creating indexes for posts collection...");
    const posts = db.collection("posts");
    await posts.createIndex({ createdAt: -1 }, { name: "idx_posts_created_at" });
    await posts.createIndex({ authorId: 1, createdAt: -1 }, { name: "idx_posts_author_created" });
    await posts.createIndex({ tags: 1 }, { name: "idx_posts_tags" });
    await posts.createIndex({ type: 1, createdAt: -1 }, { name: "idx_posts_type_created" });
    await posts.createIndex({ likesCount: -1, commentsCount: -1, createdAt: -1 }, { name: "idx_posts_popularity" });
    await posts.createIndex(
      { title: "text", content: "text", tags: "text" },
      { name: "idx_posts_search_text", weights: { title: 10, tags: 5, content: 2 } }
    );

    // 3. Follows collection indexes (prevent duplicate follows and optimize lookups)
    console.log("Creating indexes for follows collection...");
    const follows = db.collection("follows");
    await follows.createIndex(
      { followerId: 1, followingId: 1 },
      { unique: true, name: "idx_follows_pair_unique" }
    );
    await follows.createIndex({ followerId: 1 }, { name: "idx_follows_follower" });
    await follows.createIndex({ followingId: 1 }, { name: "idx_follows_following" });

    // 4. Projects collection indexes
    console.log("Creating indexes for projects collection...");
    const projects = db.collection("projects");
    await projects.createIndex({ authorId: 1, createdAt: -1 }, { name: "idx_projects_author_created" });
    await projects.createIndex({ technologies: 1 }, { name: "idx_projects_technologies" });
    await projects.createIndex({ createdAt: -1 }, { name: "idx_projects_created_at" });
    await projects.createIndex(
      { title: "text", description: "text", technologies: "text" },
      { name: "idx_projects_search_text", weights: { title: 10, technologies: 5, description: 2 } }
    );

    // 5. Comments collection indexes
    console.log("Creating indexes for comments collection...");
    const comments = db.collection("comments");
    await comments.createIndex({ postId: 1, createdAt: 1 }, { name: "idx_comments_post_created" });
    await comments.createIndex({ authorId: 1 }, { name: "idx_comments_author" });

    // 6. Likes collection indexes
    console.log("Creating indexes for likes collection...");
    const likes = db.collection("likes");
    await likes.createIndex(
      { userId: 1, targetType: 1, targetId: 1 },
      { unique: true, name: "idx_likes_user_target_unique" }
    );
    await likes.createIndex({ targetId: 1, targetType: 1 }, { name: "idx_likes_target" });

    // 7. Bookmarks collection indexes
    console.log("Creating indexes for bookmarks collection...");
    const bookmarks = db.collection("bookmarks");
    await bookmarks.createIndex(
      { userId: 1, itemType: 1, itemId: 1 },
      { unique: true, name: "idx_bookmarks_user_item_unique" }
    );
    await bookmarks.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_bookmarks_user_created" });

    // 8. Notifications collection indexes
    console.log("Creating indexes for notifications collection...");
    const notifications = db.collection("notifications");
    await notifications.createIndex(
      { recipientId: 1, read: 1, createdAt: -1 },
      { name: "idx_notifications_recipient_read_created" }
    );

    console.log("All MongoDB indexes initialized successfully!");
  } catch (err) {
    console.error("Index initialization failed:", err);
    throw err;
  } finally {
    await client.close();
  }
}

// Execute directly if run as a script
if (require.main === module || process.argv[1]?.includes("indexes")) {
  createIndexes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
