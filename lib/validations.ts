import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens")
    .toLowerCase(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().max(300).optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  github: z.string().optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const createPostSchema = z.object({
  type: z.enum(["discussion", "question", "snippet", "project_update"]).default("discussion"),
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(10, "Content must be at least 10 characters").max(10000),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  codeSnippet: z
    .object({
      code: z.string().max(10000),
      language: z.string().max(30).default("typescript"),
    })
    .optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const createProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  technologies: z.array(z.string().min(1).max(30)).min(1, "Add at least one technology").max(15),
  githubUrl: z.string().url("Must be a valid URL").refine((url) => url.includes("github.com"), {
    message: "Must be a valid GitHub URL",
  }),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  skills: z.array(z.string()).optional(),
  github: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatar: z.string().optional(),
});
