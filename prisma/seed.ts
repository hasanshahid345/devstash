import "dotenv/config";
import bcrypt from "bcryptjs";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before running the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const DEMO_USER_EMAIL = "demo@devstash.io";
const DEMO_USER_NAME = "Demo User";
const DEMO_USER_PASSWORD = "12345678";

type SystemTypeSeed = {
  name: string;
  icon: string;
  color: string;
};

type CollectionSeed = {
  key: string;
  name: string;
  description: string;
  isFavorite: boolean;
};

type ItemSeed = {
  key: string;
  title: string;
  description: string;
  typeKey: string;
  collectionKey: string;
  contentType: string;
  content?: string;
  url?: string;
  language?: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
};

type RecordWithId = {
  id: string;
};

const systemTypes: SystemTypeSeed[] = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

const collections: CollectionSeed[] = [
  {
    key: "react-patterns",
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
  },
  {
    key: "ai-workflows",
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: false,
  },
  {
    key: "devops",
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: true,
  },
  {
    key: "terminal-commands",
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    isFavorite: false,
  },
  {
    key: "design-resources",
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: true,
  },
];

const items: ItemSeed[] = [
  {
    key: "use-debounce-hook",
    title: "useDebounce Hook",
    description: "A reusable debounce hook for search inputs and autosave flows.",
    typeKey: "snippet",
    collectionKey: "react-patterns",
    contentType: "text",
    content: [
      "import { useEffect, useState } from \"react\";",
      "",
      "export function useDebounce<T>(value: T, delay = 300): T {",
      "  const [debouncedValue, setDebouncedValue] = useState(value);",
      "",
      "  useEffect(() => {",
      "    const timer = window.setTimeout(() => setDebouncedValue(value), delay);",
      "",
      "    return () => window.clearTimeout(timer);",
      "  }, [value, delay]);",
      "",
      "  return debouncedValue;",
      "}",
    ].join("\n"),
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    tags: ["react", "hooks", "performance"],
  },
  {
    key: "compound-components",
    title: "Compound Component Pattern",
    description: "A flexible context-based component composition pattern.",
    typeKey: "snippet",
    collectionKey: "react-patterns",
    contentType: "text",
    content: [
      "import { createContext, useContext } from \"react\";",
      "",
      "const TabsContext = createContext<string | null>(null);",
      "",
      "export function useTabs() {",
      "  const context = useContext(TabsContext);",
      "  if (!context) throw new Error(\"Tabs components must be used within Tabs\");",
      "  return context;",
      "}",
    ].join("\n"),
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    tags: ["react", "composition", "context"],
  },
  {
    key: "strict-context-factory",
    title: "Strict Context Factory",
    description: "Helper for creating React contexts with strong runtime guarantees.",
    typeKey: "snippet",
    collectionKey: "react-patterns",
    contentType: "text",
    content: [
      "export function createStrictContext<T>(name: string) {",
      "  const Context = createContext<T | undefined>(undefined);",
      "",
      "  function useValue() {",
      "    const value = useContext(Context);",
      "    if (value === undefined) {",
      "      throw new Error(`${name} must be used within its provider`);",
      "    }",
      "    return value;",
      "  }",
      "",
      "  return [Context.Provider, useValue] as const;",
      "}",
    ].join("\n"),
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    tags: ["react", "context", "typescript"],
  },
  {
    key: "code-review-prompt",
    title: "Code Review Prompt",
    description: "A prompt for reviewing changes with a bug-hunting lens.",
    typeKey: "prompt",
    collectionKey: "ai-workflows",
    contentType: "text",
    content: [
      "You are a senior engineer doing a focused code review.",
      "Look for bugs, regressions, missing tests, security issues, and unclear behavior.",
      "Prioritize findings by severity and include file and line references when possible.",
      "Keep the response concise and practical.",
    ].join("\n"),
    language: "markdown",
    isFavorite: true,
    isPinned: false,
    tags: ["review", "qa", "prompt"],
  },
  {
    key: "documentation-prompt",
    title: "Documentation Generation Prompt",
    description: "A prompt for turning implementation details into clear docs.",
    typeKey: "prompt",
    collectionKey: "ai-workflows",
    contentType: "text",
    content: [
      "Write documentation for the feature in a way a new contributor can follow.",
      "Include setup steps, expected behavior, edge cases, and any environment variables.",
      "Use concise headings and short examples where helpful.",
    ].join("\n"),
    language: "markdown",
    isFavorite: false,
    isPinned: false,
    tags: ["docs", "writing", "prompt"],
  },
  {
    key: "refactoring-prompt",
    title: "Refactoring Assistance Prompt",
    description: "A prompt for improving code without changing behavior.",
    typeKey: "prompt",
    collectionKey: "ai-workflows",
    contentType: "text",
    content: [
      "Refactor the code to improve readability, consistency, and maintainability.",
      "Avoid changing external behavior unless a defect is clearly identified.",
      "Explain tradeoffs briefly and call out any follow-up work that should stay separate.",
    ].join("\n"),
    language: "markdown",
    isFavorite: false,
    isPinned: false,
    tags: ["refactor", "ai", "cleanup"],
  },
  {
    key: "docker-ci-snippet",
    title: "Docker + CI/CD Starter",
    description: "A minimal production container and CI pipeline starter.",
    typeKey: "snippet",
    collectionKey: "devops",
    contentType: "text",
    content: [
      "FROM node:20-alpine",
      "WORKDIR /app",
      "COPY package*.json ./",
      "RUN npm ci",
      "COPY . .",
      "RUN npm run build",
      "CMD [\"npm\", \"start\"]",
      "",
      "# GitHub Actions can run lint, test, and build on every push.",
    ].join("\n"),
    language: "dockerfile",
    isFavorite: true,
    isPinned: false,
    tags: ["docker", "ci", "deployment"],
  },
  {
    key: "deployment-command",
    title: "Deployment Command",
    description: "A simple deploy sequence for production releases.",
    typeKey: "command",
    collectionKey: "devops",
    contentType: "text",
    content: "pnpm prisma migrate deploy && pnpm build && pm2 restart devstash",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["deploy", "release", "shell"],
  },
  {
    key: "docker-docs-link",
    title: "Docker Documentation",
    description: "Official Docker docs for containers, images, and compose.",
    typeKey: "link",
    collectionKey: "devops",
    contentType: "url",
    url: "https://docs.docker.com/",
    isFavorite: false,
    isPinned: false,
    tags: ["docker", "docs", "infra"],
  },
  {
    key: "github-actions-link",
    title: "GitHub Actions Documentation",
    description: "Official GitHub Actions docs for CI/CD workflows.",
    typeKey: "link",
    collectionKey: "devops",
    contentType: "url",
    url: "https://docs.github.com/en/actions",
    isFavorite: false,
    isPinned: false,
    tags: ["github-actions", "ci", "docs"],
  },
  {
    key: "git-ops-command",
    title: "Git Branch Cleanup",
    description: "A quick command for inspecting recent history and branches.",
    typeKey: "command",
    collectionKey: "terminal-commands",
    contentType: "text",
    content: "git log --oneline --graph --decorate -n 20",
    language: "bash",
    isFavorite: true,
    isPinned: false,
    tags: ["git", "workflow", "commands"],
  },
  {
    key: "docker-prune-command",
    title: "Docker Prune",
    description: "Remove unused Docker objects when local disk space gets tight.",
    typeKey: "command",
    collectionKey: "terminal-commands",
    contentType: "text",
    content: "docker system prune -af",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["docker", "cleanup", "containers"],
  },
  {
    key: "process-command",
    title: "Process Check",
    description: "Find long-running app processes before restarting or debugging.",
    typeKey: "command",
    collectionKey: "terminal-commands",
    contentType: "text",
    content: "ps aux | grep next",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["process", "monitoring", "shell"],
  },
  {
    key: "package-manager-command",
    title: "Package Manager Update",
    description: "Check outdated packages and update them deliberately.",
    typeKey: "command",
    collectionKey: "terminal-commands",
    contentType: "text",
    content: "npm outdated && npm update",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["npm", "packages", "workflow"],
  },
  {
    key: "css-reference-link",
    title: "CSS Reference",
    description: "MDN CSS reference for browser-native styling details.",
    typeKey: "link",
    collectionKey: "design-resources",
    contentType: "url",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    isFavorite: true,
    isPinned: false,
    tags: ["css", "docs", "reference"],
  },
  {
    key: "tailwind-reference-link",
    title: "Tailwind CSS Docs",
    description: "Tailwind CSS reference for utility-first styling patterns.",
    typeKey: "link",
    collectionKey: "design-resources",
    contentType: "url",
    url: "https://tailwindcss.com/docs",
    isFavorite: false,
    isPinned: false,
    tags: ["tailwind", "css", "docs"],
  },
  {
    key: "component-library-link",
    title: "Component Library",
    description: "Radix UI primitives for accessible component foundations.",
    typeKey: "link",
    collectionKey: "design-resources",
    contentType: "url",
    url: "https://www.radix-ui.com/primitives",
    isFavorite: false,
    isPinned: false,
    tags: ["ui", "components", "reference"],
  },
  {
    key: "icon-library-link",
    title: "Icon Library",
    description: "Lucide icon library for clean, consistent UI symbols.",
    typeKey: "link",
    collectionKey: "design-resources",
    contentType: "url",
    url: "https://lucide.dev/icons",
    isFavorite: false,
    isPinned: false,
    tags: ["icons", "svg", "resources"],
  },
];

function requireRecordId<T extends RecordWithId>(records: Map<string, T>, key: string, label: string): string {
  const record = records.get(key);

  if (!record) {
    throw new Error(`Missing ${label} record for "${key}"`);
  }

  return record.id;
}

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: DEMO_USER_EMAIL,
    },
  });

  const hashedPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  const emailVerified = new Date();

  const user = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      password: hashedPassword,
      isPro: false,
      emailVerified,
    },
  });

  const itemTypeRecords = await Promise.all(
    systemTypes.map(async (type) => {
      const existingType = await prisma.itemType.findFirst({
        where: {
          name: type.name,
          isSystem: true,
          userId: null,
        },
      });

      if (existingType) {
        return prisma.itemType.update({
          where: {
            id: existingType.id,
          },
          data: {
            icon: type.icon,
            color: type.color,
            isSystem: true,
          },
        });
      }

      return prisma.itemType.create({
        data: {
          name: type.name,
          icon: type.icon,
          color: type.color,
          isSystem: true,
        },
      });
    }),
  );

  const collectionRecords = await Promise.all(
    collections.map((collection) =>
      prisma.collection.create({
        data: {
          name: collection.name,
          description: collection.description,
          isFavorite: collection.isFavorite,
          userId: user.id,
        },
      }),
    ),
  );

  const uniqueTags = [...new Set(items.flatMap((item) => item.tags))].sort((left, right) =>
    left.localeCompare(right),
  );

  await prisma.tag.createMany({
    data: uniqueTags.map((name) => ({
      name,
      userId: user.id,
    })),
  });

  const tagRecords = await prisma.tag.findMany({
    where: {
      userId: user.id,
    },
  });

  const itemTypeByName = new Map(itemTypeRecords.map((type) => [type.name, type]));
  const collectionByKey = new Map(
    collectionRecords.map((collection, index) => [collections[index].key, collection] as const),
  );
  const tagByName = new Map(tagRecords.map((tag) => [tag.name, tag]));

  const createdItems = await Promise.all(
    items.map((item) =>
      prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          contentType: item.contentType,
          content: item.content,
          url: item.url,
          language: item.language,
          isFavorite: item.isFavorite,
          isPinned: item.isPinned,
          userId: user.id,
          typeId: requireRecordId(itemTypeByName, item.typeKey, "item type"),
          collectionId: requireRecordId(collectionByKey, item.collectionKey, "collection"),
        },
      }),
    ),
  );

  const itemTagRecords = createdItems.flatMap((item, index) => {
    const seedItem = items[index];

    return seedItem.tags.map((tagName) => {
      const tag = tagByName.get(tagName);

      if (!tag) {
        throw new Error(`Missing tag record for ${tagName}`);
      }

      return {
        itemId: item.id,
        tagId: tag.id,
      };
    });
  });

  await prisma.itemTag.createMany({
    data: itemTagRecords,
  });

  console.log(`Seeded demo user ${user.email} with ${createdItems.length} items.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
