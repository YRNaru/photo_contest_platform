// コンテスト審査システムの型定義

export type JudgingType = 'vote' | 'score';

export interface Category {
  id: number;
  contest: number;
  name: string;
  description: string;
  order: number;
  max_votes_per_judge: number | null;
  entry_count: number;
  created_at: string;
}

export interface JudgingCriteria {
  id: number;
  contest: number;
  category: number | null;
  category_name: string | null;
  name: string;
  description: string;
  max_score: number;
  order: number;
  created_at: string;
}

export interface Vote {
  id: number;
  entry: string;
  category: number | null;
  category_name: string | null;
  user: number;
  created_at: string;
}

export interface DetailedScore {
  id: number;
  judge_score: number;
  criteria: number;
  criteria_name: string;
  criteria_max_score: number;
  score: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface JudgeScore {
  id: number;
  entry: string;
  category: number | null;
  category_name: string | null;
  judge: {
    id: number;
    username: string;
    email: string;
  };
  total_score: number;
  comment: string;
  detailed_scores: DetailedScore[];
  created_at: string;
  updated_at: string;
}

export interface Contest {
  slug: string;
  title: string;
  description: string;
  banner_image: string | null;
  start_at: string;
  end_at: string;
  voting_end_at: string | null;
  is_public: boolean;
  max_entries_per_user: number;
  max_images_per_entry: number;
  judging_type: JudgingType;
  max_votes_per_judge: number;
  auto_approve_entries: boolean;
  twitter_hashtag: string;
  twitter_auto_fetch: boolean;
  twitter_auto_approve: boolean;
  require_twitter_account: boolean;
  phase: string;
  entry_count: number;
  creator_username: string;
  is_owner: boolean;
  is_judge: boolean;
  judges?: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  categories?: Category[];
  judging_criteria?: JudgingCriteria[];
  created_at: string;
  updated_at?: string;
}

// リクエスト用の型
export interface CreateVoteRequest {
  entry: string;
  category?: number | null;
}

export interface CreateJudgeScoreRequest {
  entry: string;
  category?: number | null;
  comment?: string;
  detailed_scores: Array<{
    criteria: number;
    score: number;
    comment?: string;
  }>;
}

export interface CreateCategoryRequest {
  contest: number;
  name: string;
  description?: string;
  order?: number;
  max_votes_per_judge?: number | null;
}

export interface CreateJudgingCriteriaRequest {
  contest: number;
  category?: number | null;
  name: string;
  description?: string;
  max_score: number;
  order?: number;
}

// 審査状態管理用
export interface JudgingState {
  selectedCategory: Category | null;
  remainingVotes: number;
  myVotes: Vote[];
  myScores: JudgeScore[];
}

