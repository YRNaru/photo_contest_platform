// 型定義

export interface SocialAccount {
  provider: 'twitter_oauth2' | 'google';
  uid: string;
  username?: string;  // Twitter
  profile_image_url?: string;  // Twitter
  name?: string;  // Google
  picture?: string;  // Google
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_judge: boolean;
  is_moderator: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  first_name?: string;
  last_name?: string;
  created_at: string;
  entry_count?: number;
  vote_count?: number;
  social_accounts?: SocialAccount[];
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
  auto_approve_entries?: boolean;
  twitter_hashtag?: string;
  twitter_auto_fetch?: boolean;
  twitter_auto_approve?: boolean;
  phase: "upcoming" | "submission" | "voting" | "closed";
  entry_count: number;
  creator_username?: string;
  is_owner?: boolean;
  is_judge?: boolean;
  judge_count?: number;
  judges?: User[];
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
  contest_slug?: string;
  contest_title?: string;
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

