"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOutCurrentUser } from "@/actions/auth";
import { cn } from "@/lib/utils";

export interface UserMenuUser {
  name: string;
  email: string;
  image: string | null;
  initials: string;
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="flex h-9 w-9 overflow-hidden rounded-full bg-zinc-200 text-sm font-semibold text-zinc-900">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="m-auto">{user.initials}</span>
          )}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-medium text-zinc-100">
            {user.name}
          </span>
          <span className="block max-w-36 truncate text-xs text-zinc-500">{user.email}</span>
        </span>
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-12 z-40 w-64 rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl shadow-black/50",
          isOpen ? "block" : "hidden",
        )}
      >
        <div className="border-b border-white/8 px-3 py-2">
          <p className="truncate text-sm font-medium text-zinc-100">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
        <form action={signOutCurrentUser} className="pt-2">
          <button
            type="submit"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
