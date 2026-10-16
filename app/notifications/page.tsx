"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth-context";
import { NotificationWithActor } from "@/lib/types";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    fetchNotifications();
  }, [user, authLoading]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case "comment":
        return <MessageSquare className="w-3.5 h-3.5 text-[#8B5CF6]" />;
      case "follow":
        return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#242428] bg-[#111113] p-5 sm:p-7 shadow-2xl shadow-black/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Activity Notifications
              </h1>
              <p className="text-xs text-zinc-400">
                Interactions, comments, likes, and developer follows.
              </p>
            </div>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="py-1.5 px-3 rounded-lg border border-[#26262e] bg-[#141418] hover:bg-[#1e1e24] text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="h-64 rounded-xl border border-[#242428] bg-[#111113] animate-pulse"></div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[#242428] bg-[#111113] text-zinc-400 space-y-2">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-zinc-500">
              When developers interact with your technical posts or follow your profile, alerts appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => {
              const link =
                n.entityType === "post"
                  ? `/posts/${n.entityId}`
                  : `/profile/${n.actor?.username}`;

              return (
                <a
                  key={n._id}
                  href={link}
                  className={cn(
                    "block p-3.5 rounded-xl border transition-all group",
                    n.read
                      ? "border-[#1e1e22] bg-[#0f0f11] hover:border-[#2a2a32]"
                      : "border-[#34244a] bg-[#161020] hover:border-[#8B5CF6]/50 shadow-md shadow-purple-950/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={n.actor?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                          alt={n.actor?.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#282830]"
                        />
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#111113] border border-[#282830]">
                          {getIcon(n.type)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-200">
                          <span className="font-semibold text-white group-hover:text-[#a78bfa] transition-colors">
                            {n.actor?.name}
                          </span>{" "}
                          <span className="text-zinc-400 font-mono text-[11px]">
                            (@{n.actor?.username})
                          </span>{" "}
                          <span>{n.message}</span>
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0"></span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
