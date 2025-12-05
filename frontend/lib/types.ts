// 型定義

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_judge: boolean;
  is_moderator: boolean;
  created_at: string;
}

export interface Contest {
  slug: string;
  title: string;
  description: string;
  banner_image?: string;
  start_at: string;
  end_at: string;
  voting_end_at?: string;
  is_public: boolean;
  max_entries_per_user: number;
  max_images_per_entry: number;
  phase: "upcoming" | "submission" | "voting" | "closed";
  entry_count: number;
  created_at: string;
  updated_at: string;
}

export interface EntryImage {
  id: number;
  image: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  is_thumbnail_ready: boolean;
  order: number;
  created_at: string;
}

export interface Entry {
  id: string;
  contest: string;
  author: User;
  title: string;
  description: string;
  tags: string;
  images: EntryImage[];
  created_at: string;
  updated_at: string;
  approved: boolean;
  flagged: boolean;
  vote_count: number;
  view_count: number;
  average_score?: number;
  user_voted?: boolean;
  thumbnail?: string;
}

export interface Vote {
  id: number;
  entry: string;
  user: User;
  created_at: string;
}

export interface JudgeScore {
  id: number;
  entry: string;
  judge: User;
  score: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Flag {
  id: number;
  entry: string;
  user: User;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

