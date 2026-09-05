export type SourceType = "official" | "class-rep" | "community";

export type Department = {
  id: string;
  faculty: string;
  name: string;
  levels: string[];
};

export type SourceHistoryEntry = {
  label: string;
  timestamp: string;
  note?: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  departmentId: string | "general";
  sourceType: SourceType;
  sourceName: string;
  confidence: number; // 0-100, only meaningful for official/scraped posts
  postedAt: string; // ISO string
  authorName?: string; // for class-rep / community posts
  history: SourceHistoryEntry[];
  tags: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citedPostIds?: string[];
};
