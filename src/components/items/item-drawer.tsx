"use client";

import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Pencil,
  Pin,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import { updateItem } from "@/actions/items";
import { DashboardLucideIcon } from "@/components/dashboard/lucide-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ItemDetail } from "@/types/items";
import type { UpdateItemInput } from "@/types/items";

interface ItemDrawerContextValue {
  openItem: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

function useItemDrawer() {
  const value = useContext(ItemDrawerContext);

  if (!value) {
    throw new Error("Item drawer triggers must be rendered inside ItemDrawerProvider.");
  }

  return value;
}

function formatLongDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function ActionButton({
  active,
  children,
  className,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
        active ? "text-yellow-300" : null,
        className,
      )}
    >
      {children}
    </button>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-8 p-8 pt-10">
      <SheetTitle className="sr-only">Loading item details</SheetTitle>
      <div className="flex gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white/[0.06]" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-2/3 rounded bg-white/[0.08]" />
          <div className="h-6 w-1/3 rounded bg-white/[0.06]" />
        </div>
      </div>
      <div className="h-12 rounded bg-white/[0.05]" />
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-white/[0.08]" />
        <div className="h-4 w-full rounded bg-white/[0.05]" />
        <div className="h-4 w-3/4 rounded bg-white/[0.05]" />
      </div>
      <div className="h-72 rounded-2xl bg-white/[0.04]" />
    </div>
  );
}

function ContentBlock({ item }: { item: ItemDetail }) {
  if (item.content) {
    return (
      <pre className="max-h-[420px] overflow-auto rounded-2xl border border-sky-500/20 bg-sky-950/30 p-5 text-sm leading-7 text-sky-50">
        <code>{item.content}</code>
      </pre>
    );
  }

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
      >
        <ExternalLink className="size-4" />
        {item.url}
      </a>
    );
  }

  if (item.fileName || item.fileUrl) {
    const fileSize = formatFileSize(item.fileSize);

    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3 text-zinc-100">
          <FileText className="size-5 text-zinc-400" />
          <span className="font-medium">{item.fileName ?? "Attached file"}</span>
        </div>
        {fileSize ? <p className="mt-2 text-sm text-zinc-500">{fileSize}</p> : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-500">
      No content saved yet.
    </div>
  );
}

interface EditFormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

function getEditFormState(item: ItemDetail): EditFormState {
  return {
    title: item.title,
    description: item.description,
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.join(", "),
  };
}

function toNullableValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function shouldShowContentField(typeName: string) {
  return ["snippet", "prompt", "command", "note"].includes(typeName.toLowerCase());
}

function shouldShowLanguageField(typeName: string) {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

function shouldShowUrlField(typeName: string) {
  return ["link", "url"].includes(typeName.toLowerCase());
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium text-zinc-400">{children}</label>;
}

function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm leading-6 text-zinc-100 placeholder:text-zinc-500 shadow-inner shadow-black/20 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20",
        className,
      )}
      {...props}
    />
  );
}

function ItemDrawerEditForm({
  item,
  onCancel,
  onSaved,
  showToast,
}: {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (item: ItemDetail) => void;
  showToast: (message: string, tone: "success" | "error") => void;
}) {
  const router = useRouter();
  const [formState, setFormState] = useState(() => getEditFormState(item));
  const [saving, setSaving] = useState(false);
  const showContentField = shouldShowContentField(item.type.name);
  const showLanguageField = shouldShowLanguageField(item.type.name);
  const showUrlField = shouldShowUrlField(item.type.name);
  const titleIsEmpty = formState.title.trim().length === 0;

  function updateField(field: keyof EditFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (titleIsEmpty || saving) {
      return;
    }

    setSaving(true);

    const updatePayload: UpdateItemInput = {
      title: formState.title,
      description: toNullableValue(formState.description),
      content: showContentField ? toNullableValue(formState.content) : item.content,
      language: showLanguageField ? toNullableValue(formState.language) : item.language,
      url: showUrlField ? toNullableValue(formState.url) : item.url,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const result = await updateItem(item.id, updatePayload);
    setSaving(false);

    if (!result.success || !result.data) {
      showToast(result.error ?? "Unable to save item.", "error");
      return;
    }

    onSaved(result.data);
    router.refresh();
    showToast("Item saved.", "success");
  }

  return (
    <>
      <div className="border-b border-white/10 p-8 pr-16">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10">
            <DashboardLucideIcon
              iconName={item.type.iconName}
              className={`size-6 ${item.type.iconClassName}`}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <SheetTitle className="sr-only">Edit {item.title}</SheetTitle>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              aria-invalid={titleIsEmpty}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-8 py-5">
        <span className="rounded-md bg-white/[0.08] px-3 py-1 text-sm font-medium text-zinc-200">
          {item.type.name}
        </span>
        <span className="text-sm text-zinc-500">Collection: {item.collection?.name ?? "None"}</span>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={titleIsEmpty || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-8">
          <section className="space-y-2">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="No description saved."
            />
          </section>

          <section className="space-y-2">
            <FieldLabel>Tags</FieldLabel>
            <Input
              value={formState.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              placeholder="react, hooks, ui"
            />
          </section>

          {showContentField ? (
            <section className="space-y-2">
              <FieldLabel>Content</FieldLabel>
              <Textarea
                value={formState.content}
                onChange={(event) => updateField("content", event.target.value)}
                className="min-h-56 font-mono"
              />
            </section>
          ) : null}

          {showLanguageField ? (
            <section className="space-y-2">
              <FieldLabel>Language</FieldLabel>
              <Input
                value={formState.language}
                onChange={(event) => updateField("language", event.target.value)}
                placeholder="typescript"
              />
            </section>
          ) : null}

          {showUrlField ? (
            <section className="space-y-2">
              <FieldLabel>URL</FieldLabel>
              <Input
                value={formState.url}
                onChange={(event) => updateField("url", event.target.value)}
                placeholder="https://example.com"
              />
            </section>
          ) : null}

          <section className="border-t border-white/10 pt-6">
            <dl className="grid gap-3 text-sm sm:grid-cols-[100px_1fr]">
              <dt className="text-zinc-500">Created</dt>
              <dd className="text-zinc-200">{formatLongDate(item.createdAt)}</dd>
              <dt className="text-zinc-500">Updated</dt>
              <dd className="text-zinc-200">{formatLongDate(item.updatedAt)}</dd>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

function ItemDrawerBody({
  item,
  onCopy,
  onItemUpdated,
  showToast,
}: {
  item: ItemDetail;
  onCopy: () => void;
  onItemUpdated: (item: ItemDetail) => void;
  showToast: (message: string, tone: "success" | "error") => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ItemDrawerEditForm
        item={item}
        onCancel={() => setEditing(false)}
        onSaved={(updatedItem) => {
          onItemUpdated(updatedItem);
          setEditing(false);
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <>
      <div className="border-b border-white/10 p-8 pr-16">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10">
            <DashboardLucideIcon
              iconName={item.type.iconName}
              className={`size-6 ${item.type.iconClassName}`}
            />
          </div>
          <div className="min-w-0">
            <SheetTitle className="text-2xl font-semibold tracking-tight text-zinc-50">
              {item.title}
            </SheetTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-white/[0.08] px-3 py-1 text-sm font-medium text-zinc-200">
                {item.type.name}
              </span>
              {item.language ? (
                <span className="rounded-md border border-white/10 px-3 py-1 text-sm text-zinc-300">
                  {item.language}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-8 py-5">
        <ActionButton active={item.isFavorite}>
          <Star className={cn("size-5", item.isFavorite ? "fill-current" : null)} />
          Favorite
        </ActionButton>
        <ActionButton active={item.isPinned}>
          <Pin className={cn("size-5", item.isPinned ? "fill-current" : null)} />
          Pin
        </ActionButton>
        <ActionButton onClick={onCopy}>
          <ClipboardCopy className="size-5" />
          Copy
        </ActionButton>
        <div className="ml-auto flex items-center gap-4">
          <ActionButton onClick={() => setEditing(true)}>
            <Pencil className="size-5" />
            Edit
          </ActionButton>
          <ActionButton className="text-red-400 hover:text-red-300">
            <Trash2 className="size-5" />
          </ActionButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 p-8">
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-500">Description</h3>
            <p className="text-base leading-7 text-zinc-100">
              {item.description || "No description saved."}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500">Content</h3>
            <ContentBlock item={item} />
          </section>

          <section className="border-t border-white/10 pt-8">
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <Tags className="size-4" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-white/[0.08] px-3 py-1 text-sm text-zinc-200">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No tags</span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <FileText className="size-4" />
                  Collection
                </div>
                {item.collection ? (
                  <span className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-200">
                    {item.collection.name}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-500">No collection</span>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <CalendarDays className="size-4" />
                  Details
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-[100px_1fr]">
                  <dt className="text-zinc-500">Created</dt>
                  <dd className="text-zinc-200">{formatLongDate(item.createdAt)}</dd>
                  <dt className="text-zinc-500">Updated</dt>
                  <dd className="text-zinc-200">{formatLongDate(item.updatedAt)}</dd>
                </dl>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function showToast(message: string, tone: "success" | "error") {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ message, tone });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function openItem(itemId: string) {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setOpen(true);
    setLoading(true);
    setError(null);
    setItem(null);
    setToast(null);

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load item details.");
      }

      const payload = (await response.json()) as { item: ItemDetail };
      if (abortControllerRef.current !== abortController) {
        return;
      }

      setItem(payload.item);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }

      setError("Unable to load item details.");
    } finally {
      if (abortControllerRef.current === abortController) {
        setLoading(false);
      }
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      abortControllerRef.current?.abort();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToast(null);
    }
  }

  async function handleCopy() {
    if (!item) {
      return;
    }

    const valueToCopy = item.content ?? item.url ?? item.title;
    await navigator.clipboard.writeText(valueToCopy);
  }

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent>
          {loading ? <DrawerSkeleton /> : null}
          {!loading && error ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-zinc-400">
              <SheetTitle className="sr-only">Item details unavailable</SheetTitle>
              {error}
            </div>
          ) : null}
          {!loading && !error && item ? (
            <ItemDrawerBody
              item={item}
              onCopy={handleCopy}
              onItemUpdated={setItem}
              showToast={showToast}
            />
          ) : null}
          {toast ? (
            <div
              className={cn(
                "absolute bottom-6 right-6 max-w-80 rounded-xl border px-4 py-3 text-sm shadow-xl",
                toast.tone === "success"
                  ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-100"
                  : "border-red-500/30 bg-red-950/90 text-red-100",
              )}
              role="status"
            >
              {toast.message}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </ItemDrawerContext.Provider>
  );
}

export function ItemDrawerCardTrigger({
  itemId,
  children,
  className,
}: {
  itemId: string;
  children: ReactNode;
  className?: string;
}) {
  const { openItem } = useItemDrawer();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItem(itemId);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(itemId)}
      onKeyDown={handleKeyDown}
      className={cn(
        "cursor-pointer rounded-3xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
