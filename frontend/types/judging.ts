// コンテスト審査システムの型定義

/** 審査方式（vote: 投票方式, score: 点数方式） */
export type JudgingType = 'vote' | 'score'

/** 賞（カテゴリー）情報。コンテストの賞を管理し、エントリーは賞に紐づかず審査時に各賞ごとに投票する */
export interface Category {
  /** カテゴリーID */
  id: number
  /** 所属コンテストID */
  contest: number
  /** 賞名（例: グランプリ、風景賞、人物賞、技術賞） */
  name: string
  /** 賞の説明 */
  description: string
  /** 表示順 */
  order: number
  /** 審査員あたり最大投票数（null の場合はコンテストの設定を使用） */
  max_votes_per_judge: number | null
  /** この賞に関連するエントリー数 */
  entry_count: number
  /** 段階審査の有効フラグ */
  enable_stages: boolean
  /** 審査の段階数（1以上） */
  stage_count: number
  /** 段階別設定（例: {"1": {"name": "一次審査", "max_votes": 5}}） */
  stage_settings: Record<string, {
    /** 段階名 */
    name: string
    /** この段階での最大投票数 */
    max_votes: number
  }>
  /** 現在進行中の審査段階 */
  current_stage: number
  /** 次の段階に進めるかどうか */
  can_advance: boolean
  /** 段階移行に関するメッセージ */
  advance_message: string
  /** 作成日時（ISO 8601） */
  created_at: string
}

/** 審査基準。点数方式で使用する評価項目 */
export interface JudgingCriteria {
  /** 基準ID */
  id: number
  /** 所属コンテストID */
  contest: number
  /** 所属カテゴリーID（null の場合は全カテゴリー共通） */
  category: number | null
  /** カテゴリー名 */
  category_name: string | null
  /** 評価項目名（例: 構図、色彩、独創性） */
  name: string
  /** 評価項目の説明 */
  description: string
  /** この項目の最大点数 */
  max_score: number
  /** 表示順 */
  order: number
  /** 作成日時（ISO 8601） */
  created_at: string
}

/** 投票情報（賞・段階対応版） */
export interface Vote {
  /** 投票ID */
  id: number
  /** エントリーID */
  entry: string
  /** カテゴリーID（null の場合は全体投票） */
  category: number | null
  /** カテゴリー名 */
  category_name: string | null
  /** 投票者ユーザーID */
  user: number
  /** 審査段階番号（1以上） */
  stage: number
  /** 段階名 */
  stage_name: string | null
  /** 投票日時（ISO 8601） */
  created_at: string
}

/** 審査基準ごとの詳細スコア */
export interface DetailedScore {
  /** 詳細スコアID */
  id: number
  /** 親の審査員スコアID */
  judge_score: number
  /** 審査基準ID */
  criteria: number
  /** 審査基準名 */
  criteria_name: string
  /** 審査基準の最大点数 */
  criteria_max_score: number
  /** この項目の点数 */
  score: number
  /** コメント */
  comment: string
  /** 作成日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at: string
}

/** 審査員スコア（点数方式用の総合スコア） */
export interface JudgeScore {
  /** スコアID */
  id: number
  /** エントリーID */
  entry: string
  /** カテゴリーID（null の場合は全体） */
  category: number | null
  /** カテゴリー名 */
  category_name: string | null
  /** 審査員情報 */
  judge: {
    /** 審査員ユーザーID */
    id: number
    /** 審査員ユーザー名 */
    username: string
    /** 審査員メールアドレス */
    email: string
  }
  /** 総合点（各評価項目の合計） */
  total_score: number
  /** 総評コメント */
  comment: string
  /** 審査段階番号（1以上） */
  stage: number
  /** 段階名 */
  stage_name: string | null
  /** 各審査基準の詳細スコア */
  detailed_scores: DetailedScore[]
  /** 作成日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at: string
}

/** コンテスト情報（審査システム拡張版） */
export interface Contest {
  /** コンテストID */
  id: number
  /** URL スラッグ（一意） */
  slug: string
  /** コンテストタイトル */
  title: string
  /** コンテスト説明文 */
  description: string
  /** バナー画像URL */
  banner_image: string | null
  /** 応募開始日時（ISO 8601） */
  start_at: string
  /** 応募終了日時（ISO 8601） */
  end_at: string
  /** 投票終了日時（ISO 8601） */
  voting_end_at: string | null
  /** 公開フラグ */
  is_public: boolean
  /** ユーザーあたり最大応募数 */
  max_entries_per_user: number
  /** エントリーあたり最大画像数 */
  max_images_per_entry: number
  /** 審査方式 */
  judging_type: JudgingType
  /** 審査員あたり最大投票数 */
  max_votes_per_judge: number
  /** 投稿の自動承認フラグ */
  auto_approve_entries: boolean
  /** Twitter ハッシュタグ（# なし） */
  twitter_hashtag: string
  /** Twitter 自動取得フラグ */
  twitter_auto_fetch: boolean
  /** Twitter 投稿の自動承認フラグ */
  twitter_auto_approve: boolean
  /** Twitter 連携必須フラグ */
  require_twitter_account: boolean
  /** 現在のフェーズ */
  phase: string
  /** 承認済みエントリー数 */
  entry_count: number
  /** コンテスト作成者のユーザー名 */
  creator_username: string
  /** 現在のユーザーが作成者かどうか */
  is_owner: boolean
  /** 現在のユーザーが審査員かどうか */
  is_judge: boolean
  /** 審査員リスト */
  judges?: Array<{
    /** 審査員ユーザーID */
    id: number
    /** 審査員ユーザー名 */
    username: string
    /** 審査員メールアドレス */
    email: string
  }>
  /** 賞リスト */
  categories?: Category[]
  /** 審査基準リスト */
  judging_criteria?: JudgingCriteria[]
  /** 作成日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at?: string
}

// リクエスト用の型

/** 投票作成リクエスト */
export interface CreateVoteRequest {
  /** エントリーID */
  entry: string
  /** カテゴリーID（省略時は全体投票） */
  category?: number | null
}

/** 審査員スコア作成リクエスト */
export interface CreateJudgeScoreRequest {
  /** エントリーID */
  entry: string
  /** カテゴリーID（省略時は全体） */
  category?: number | null
  /** 総評コメント */
  comment?: string
  /** 各審査基準の詳細スコア */
  detailed_scores: Array<{
    /** 審査基準ID */
    criteria: number
    /** 点数（0〜max_score） */
    score: number
    /** コメント */
    comment?: string
  }>
}

/** 賞作成リクエスト */
export interface CreateCategoryRequest {
  /** コンテストID */
  contest: number
  /** 賞名 */
  name: string
  /** 説明 */
  description?: string
  /** 表示順 */
  order?: number
  /** 審査員あたり最大投票数 */
  max_votes_per_judge?: number | null
}

/** 審査基準作成リクエスト */
export interface CreateJudgingCriteriaRequest {
  /** コンテストID */
  contest: number
  /** カテゴリーID（省略時は全カテゴリー共通） */
  category?: number | null
  /** 評価項目名 */
  name: string
  /** 説明 */
  description?: string
  /** 最大点数 */
  max_score: number
  /** 表示順 */
  order?: number
}

/** 審査状態管理用（フロントエンドの状態管理で使用） */
export interface JudgingState {
  /** 選択中のカテゴリー */
  selectedCategory: Category | null
  /** 残り投票可能数 */
  remainingVotes: number
  /** 自分の投票リスト */
  myVotes: Vote[]
  /** 自分のスコアリスト */
  myScores: JudgeScore[]
}
