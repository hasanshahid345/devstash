import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner shadow-black/20 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20",
        className,
      )}
      {...props}
    />
  );
}
