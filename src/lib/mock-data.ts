export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isPro: boolean;
}

export interface MockItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemIds: string[];
}

export interface MockCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  color: string;
  itemIds: string[];
}

export interface MockItem {
  id: string;
  title: string;
  description: string;
  typeId: string;
  collectionId: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockDashboardData {
  user: MockUser;
  itemTypes: MockItemType[];
  collections: MockCollection[];
  items: MockItem[];
}

export const mockDashboardData: MockDashboardData = {
  user: {
    id: "user_001",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "/avatars/john-doe.png",
    isPro: true,
  },
  itemTypes: [
    {
      id: "type_snippet",
      name: "Snippets",
      icon: "<>",
      color: "blue",
      itemIds: [
        "item_use_auth_hook",
        "item_api_error_handling",
        "item_react_use_debounce",
        "item_python_retry",
      ],
    },
    {
      id: "type_prompt",
      name: "Prompts",
      icon: "sparkles",
      color: "violet",
      itemIds: ["item_code_review_prompt", "item_prompt_optimizer"],
    },
    {
      id: "type_command",
      name: "Commands",
      icon: ">_",
      color: "orange",
      itemIds: ["item_git_rebase_clean", "item_npm_debug"],
    },
    {
      id: "type_note",
      name: "Notes",
      icon: "note",
      color: "yellow",
      itemIds: ["item_architecture_notes", "item_release_checklist"],
    },
    {
      id: "type_file",
      name: "Files",
      icon: "file",
      color: "slate",
      itemIds: ["item_context_template", "item_project_brief"],
    },
    {
      id: "type_image",
      name: "Images",
      icon: "image",
      color: "pink",
      itemIds: ["item_dashboard_reference"],
    },
    {
      id: "type_url",
      name: "Links",
      icon: "link",
      color: "emerald",
      itemIds: ["item_prisma_docs", "item_tailwind_docs"],
    },
  ],
  collections: [
    {
      id: "collection_react_patterns",
      name: "React Patterns",
      description: "Common React patterns and hooks",
      isFavorite: true,
      color: "blue",
      itemIds: [
        "item_use_auth_hook",
        "item_react_use_debounce",
        "item_api_error_handling",
      ],
    },
    {
      id: "collection_python_snippets",
      name: "Python Snippets",
      description: "Useful Python code snippets",
      isFavorite: false,
      color: "blue",
      itemIds: ["item_python_retry"],
    },
    {
      id: "collection_context_files",
      name: "Context Files",
      description: "AI context files for projects",
      isFavorite: true,
      color: "slate",
      itemIds: ["item_context_template", "item_project_brief"],
    },
    {
      id: "collection_interview_prep",
      name: "Interview Prep",
      description: "Technical interview preparation",
      isFavorite: false,
      color: "yellow",
      itemIds: ["item_code_review_prompt", "item_release_checklist"],
    },
    {
      id: "collection_git_commands",
      name: "Git Commands",
      description: "Frequently used git commands",
      isFavorite: true,
      color: "orange",
      itemIds: ["item_git_rebase_clean", "item_npm_debug"],
    },
    {
      id: "collection_ai_prompts",
      name: "AI Prompts",
      description: "Curated AI prompts for coding",
      isFavorite: false,
      color: "violet",
      itemIds: ["item_code_review_prompt", "item_prompt_optimizer"],
    },
  ],
  items: [
    {
      id: "item_use_auth_hook",
      title: "useAuth Hook",
      description: "Custom authentication hook for React applications",
      typeId: "type_snippet",
      collectionId: "collection_react_patterns",
      isFavorite: true,
      isPinned: true,
      tags: ["react", "auth", "hooks"],
      createdAt: "2026-01-15T10:30:00.000Z",
      updatedAt: "2026-01-15T10:30:00.000Z",
    },
    {
      id: "item_api_error_handling",
      title: "API Error Handling Pattern",
      description: "Fetch wrapper with exponential backoff retry logic",
      typeId: "type_snippet",
      collectionId: "collection_react_patterns",
      isFavorite: false,
      isPinned: false,
      tags: ["api", "errors", "resilience"],
      createdAt: "2026-01-12T14:15:00.000Z",
      updatedAt: "2026-01-12T14:15:00.000Z",
    },
    {
      id: "item_react_use_debounce",
      title: "useDebounce Hook",
      description: "Debounce input values for search and autosave flows",
      typeId: "type_snippet",
      collectionId: "collection_react_patterns",
      isFavorite: false,
      isPinned: false,
      tags: ["react", "performance"],
      createdAt: "2026-01-08T09:00:00.000Z",
      updatedAt: "2026-01-08T09:00:00.000Z",
    },
    {
      id: "item_python_retry",
      title: "Retry Helper",
      description: "A tiny retry helper with jitter for Python scripts",
      typeId: "type_snippet",
      collectionId: "collection_python_snippets",
      isFavorite: false,
      isPinned: false,
      tags: ["python", "cli", "retry"],
      createdAt: "2026-01-03T17:45:00.000Z",
      updatedAt: "2026-01-03T17:45:00.000Z",
    },
    {
      id: "item_code_review_prompt",
      title: "Code Review Prompt",
      description: "Prompt for reviewing PRs with a bug-hunting lens",
      typeId: "type_prompt",
      collectionId: "collection_ai_prompts",
      isFavorite: true,
      isPinned: false,
      tags: ["review", "qa", "prompt"],
      createdAt: "2025-12-29T11:20:00.000Z",
      updatedAt: "2025-12-29T11:20:00.000Z",
    },
    {
      id: "item_prompt_optimizer",
      title: "Prompt Optimizer",
      description: "Refine long prompts into concise task instructions",
      typeId: "type_prompt",
      collectionId: "collection_ai_prompts",
      isFavorite: false,
      isPinned: false,
      tags: ["prompt", "ai", "writing"],
      createdAt: "2025-12-18T08:10:00.000Z",
      updatedAt: "2025-12-18T08:10:00.000Z",
    },
    {
      id: "item_git_rebase_clean",
      title: "Clean Rebase Flow",
      description: "Safe git rebase checklist for feature branches",
      typeId: "type_command",
      collectionId: "collection_git_commands",
      isFavorite: true,
      isPinned: false,
      tags: ["git", "workflow", "commands"],
      createdAt: "2025-12-12T13:05:00.000Z",
      updatedAt: "2025-12-12T13:05:00.000Z",
    },
    {
      id: "item_npm_debug",
      title: "Debug Install Issues",
      description: "Quick checks for dependency and cache problems",
      typeId: "type_command",
      collectionId: "collection_git_commands",
      isFavorite: false,
      isPinned: false,
      tags: ["npm", "debug", "setup"],
      createdAt: "2025-12-10T16:40:00.000Z",
      updatedAt: "2025-12-10T16:40:00.000Z",
    },
    {
      id: "item_architecture_notes",
      title: "Architecture Notes",
      description: "High-level notes for the DevStash app shell",
      typeId: "type_note",
      collectionId: "collection_interview_prep",
      isFavorite: false,
      isPinned: false,
      tags: ["architecture", "planning"],
      createdAt: "2025-12-03T18:00:00.000Z",
      updatedAt: "2025-12-03T18:00:00.000Z",
    },
    {
      id: "item_release_checklist",
      title: "Release Checklist",
      description: "Pre-deploy checklist for shipping updates safely",
      typeId: "type_note",
      collectionId: "collection_interview_prep",
      isFavorite: false,
      isPinned: false,
      tags: ["release", "ops"],
      createdAt: "2025-12-01T12:00:00.000Z",
      updatedAt: "2025-12-01T12:00:00.000Z",
    },
    {
      id: "item_context_template",
      title: "Project Context Template",
      description: "Reusable structure for AI context files",
      typeId: "type_file",
      collectionId: "collection_context_files",
      isFavorite: false,
      isPinned: false,
      tags: ["context", "template", "ai"],
      createdAt: "2025-11-26T09:30:00.000Z",
      updatedAt: "2025-11-26T09:30:00.000Z",
    },
    {
      id: "item_project_brief",
      title: "Project Brief",
      description: "One-page project summary for onboarding new work",
      typeId: "type_file",
      collectionId: "collection_context_files",
      isFavorite: false,
      isPinned: false,
      tags: ["brief", "docs"],
      createdAt: "2025-11-22T15:50:00.000Z",
      updatedAt: "2025-11-22T15:50:00.000Z",
    },
    {
      id: "item_dashboard_reference",
      title: "Dashboard Screenshot",
      description: "Reference image for the dashboard layout",
      typeId: "type_image",
      collectionId: "collection_context_files",
      isFavorite: false,
      isPinned: false,
      tags: ["ui", "reference", "dashboard"],
      createdAt: "2025-11-20T10:05:00.000Z",
      updatedAt: "2025-11-20T10:05:00.000Z",
    },
    {
      id: "item_prisma_docs",
      title: "Prisma Docs",
      description: "Primary Prisma documentation link",
      typeId: "type_url",
      collectionId: "collection_context_files",
      isFavorite: false,
      isPinned: false,
      tags: ["prisma", "docs"],
      createdAt: "2025-11-18T07:25:00.000Z",
      updatedAt: "2025-11-18T07:25:00.000Z",
    },
    {
      id: "item_tailwind_docs",
      title: "Tailwind CSS v4 Docs",
      description: "Tailwind CSS v4 reference for theme setup",
      typeId: "type_url",
      collectionId: "collection_context_files",
      isFavorite: false,
      isPinned: false,
      tags: ["tailwind", "css", "docs"],
      createdAt: "2025-11-16T19:10:00.000Z",
      updatedAt: "2025-11-16T19:10:00.000Z",
    },
  ],
};

export const mockUser = mockDashboardData.user;
export const mockItemTypes = mockDashboardData.itemTypes;
export const mockCollections = mockDashboardData.collections;
export const mockItems = mockDashboardData.items;
