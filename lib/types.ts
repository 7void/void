import { ObjectId } from "mongodb";

export type PostType = "discussion" | "question" | "snippet" | "project_update";

export interface UserDoc {
  _id: ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  avatar: string;
  github?: string;
  website?: string;
  skills: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  projectsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  _id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  avatar: string;
  github?: string;
  website?: string;
  skills: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  projectsCount: number;
  createdAt: string;
  isFollowing?: boolean;
  isSelf?: boolean;
}

export interface PostDoc {
  _id: ObjectId;
  authorId: ObjectId;
  type: PostType;
  title: string;
  content: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithAuthor {
  _id: string;
  authorId: string;
  type: PostType;
  title: string;
  content: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    skills?: string[];
  };
  hasLiked?: boolean;
  hasBookmarked?: boolean;
}

export interface CommentDoc {
  _id: ObjectId;
  postId: ObjectId;
  authorId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithAuthor {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export interface LikeDoc {
  _id: ObjectId;
  userId: ObjectId;
  targetType: "post" | "comment";
  targetId: ObjectId;
  createdAt: Date;
}

export interface FollowDoc {
  _id: ObjectId;
  followerId: ObjectId;
  followingId: ObjectId;
  createdAt: Date;
}

export interface ProjectDoc {
  _id: ObjectId;
  authorId: ObjectId;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  starsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithAuthor {
  _id: string;
  authorId: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  starsCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    skills?: string[];
  };
  hasBookmarked?: boolean;
}

export interface BookmarkDoc {
  _id: ObjectId;
  userId: ObjectId;
  itemType: "post" | "project";
  itemId: ObjectId;
  createdAt: Date;
}

export interface NotificationDoc {
  _id: ObjectId;
  recipientId: ObjectId;
  actorId: ObjectId;
  type: "like" | "comment" | "follow";
  entityId: ObjectId;
  entityType: "post" | "project" | "user";
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationWithActor {
  _id: string;
  recipientId: string;
  actorId: string;
  type: "like" | "comment" | "follow";
  entityId: string;
  entityType: "post" | "project" | "user";
  message: string;
  read: boolean;
  createdAt: string;
  actor: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  name: string;
}
