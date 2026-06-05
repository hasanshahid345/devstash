const TYPE_BORDER_CLASS_BY_NAME: Record<string, string> = {
  snippet: "before:bg-sky-500",
  prompt: "before:bg-violet-500",
  command: "before:bg-orange-500",
  note: "before:bg-yellow-400",
  file: "before:bg-slate-500",
  image: "before:bg-pink-500",
  link: "before:bg-emerald-500",
};

const TYPE_ICON_CLASS_BY_NAME: Record<string, string> = {
  snippet: "text-sky-400",
  prompt: "text-violet-400",
  command: "text-orange-400",
  note: "text-yellow-300",
  file: "text-slate-300",
  image: "text-pink-400",
  link: "text-emerald-400",
};

export function getTypeBorderClassName(typeName: string | null): string {
  if (!typeName) {
    return "before:bg-zinc-600";
  }

  return TYPE_BORDER_CLASS_BY_NAME[typeName] ?? "before:bg-zinc-600";
}

export function getTypeIconClassName(typeName: string): string {
  return TYPE_ICON_CLASS_BY_NAME[typeName] ?? "text-zinc-400";
}
