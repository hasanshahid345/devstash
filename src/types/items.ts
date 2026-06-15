export interface ItemDetail {
  id: string;
  title: string;
  description: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  type: {
    name: string;
    iconName: string;
    iconClassName: string;
  };
  collection: {
    id: string;
    name: string;
  } | null;
  tags: string[];
}

export interface UpdateItemInput {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
}

export interface UpdateItemResult {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}
