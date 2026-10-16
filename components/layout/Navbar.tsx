"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import {
  Terminal,
  Home,
  Compass,
  FolderGit2,
  Bookmark,
  Bell,
  Plus,
  Search,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenNewPost?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewPost }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#242428] bg-[#090909]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="/feed" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#282830] flex items-center justify-center text-[#8B5CF6] group-hover:border-[#8B5CF6] transition-colors">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-wider text-white">VOID</span>
              <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">v1.0</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#2f1f24] text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-[#161618]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#a78bfa]" : "text-zinc-400")} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-xs relative items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, stack, developers..."
            className="w-full bg-[#141416] border border-[#26262a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
        </form>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {onOpenNewPost && (
                <button
                  type="button"
                  onClick={onOpenNewPost}
                  className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Post</span>
                </button>
              )}

              {/* Notifications Link */}
              <a
                href="/notifications"
                className={cn(
                  "relative p-2 rounded-lg border border-[#242428] bg-[#141416] hover:bg-[#1a1a1e] text-zinc-300 hover:text-white transition-colors",
                  pathname === "/notifications" && "border-[#8B5CF6]/50 bg-[#2f1f24]"
                )}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>

              {/* Profile Avatar & Dropdown */}
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#242428]">
                <a
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#161618] transition-colors group"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#303038] group-hover:border-[#8B5CF6] transition-colors"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-medium text-white truncate max-w-[100px] leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono leading-tight">
                      @{user.username}
                    </span>
                  </div>
                </a>

                {/* Settings & Logout */}
                <a
                  href="/settings"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#161618] transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-[#161618] transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="py-1.5 px-3 rounded-lg border border-[#242428] bg-[#161618] hover:bg-[#1d1d22] text-zinc-200 text-xs font-medium transition-colors"
              >
                Sign in
              </a>
              <a
                href="/login"
                className="py-1.5 px-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-colors"
              >
                Register
              </a>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#161618] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#242428] bg-[#111113] px-4 py-3 space-y-2 animate-in slide-in-from-top duration-150">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search VOID..."
              className="w-full bg-[#141416] border border-[#26262a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none" />
          </form>

          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors",
                    isActive ? "bg-[#2f1f24] text-white" : "text-zinc-400 hover:bg-[#18181c]"
                  )}
                >
                  <Icon className="w-4 h-4 text-[#8B5CF6]" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {user && onOpenNewPost && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNewPost();
              }}
              className="w-full mt-2 py-2 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Post</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
