"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function AuthStatus() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {user.name ?? user.email}
        </span>
        <a
          href="/auth/logout"
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Log out
        </a>
      </div>
    );
  }

  return (
    <a
      href="/auth/login"
      className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
    >
      Log in
    </a>
  );
}
