// 型定義

/** OAuth ソーシャルアカウント情報 */
export interface SocialAccount {
  /** プロバイダー種別 */
  provider: 'twitter_oauth2' | 'google'
  /** プロバイダー側のユーザーID */
  uid: string
  /** Twitter ユーザー名 */
  username?: string
  /** Twitter プロフィール画像URL */
  profile_image_url?: string
  /** Google 表示名 */
  name?: string
  /** Google プロフィール画像URL */
  picture?: string
}

/** ユーザー情報 */
export interface User {
  /** ユーザーID */
  id: string
  /** ユーザー名（一意） */
  username: string
  /** メールアドレス（一意、認証のプライマリキー） */
  email: string
  /** アバター画像URL */
  avatar_url?: string
  /** 審査員フラグ */
  is_judge: boolean
  /** モデレーターフラグ */
  is_moderator: boolean
  /** スタッフフラグ */
  is_staff?: boolean
  /** スーパーユーザーフラグ */
  is_superuser?: boolean
  /** 名 */
  first_name?: string
  /** 姓 */
  last_name?: string
  /** アカウント作成日時（ISO 8601） */
  created_at: string
  /** 投稿エントリー数 */
  entry_count?: number
  /** 投票数 */
  vote_count?: number
  /** 連携済みソーシャルアカウント */
  social_accounts?: SocialAccount[]
}

/** コンテスト情報 */
export interface Contest {
  /** URL スラッグ（一意） */
  slug: string
  /** コンテストタイトル */
  title: string
  /** コンテスト説明文 */
  description: string
  /** バナー画像URL */
  banner_image?: string
  /** 応募開始日時（ISO 8601） */
  start_at: string
  /** 応募終了日時（ISO 8601） */
  end_at: string
  /** 投票終了日時（ISO 8601）。未設定の場合は end_at と同じ */
  voting_end_at?: string
  /** 公開フラグ */
  is_public: boolean
  /** ユーザーあたり最大応募数 */
  max_entries_per_user: number
  /** エントリーあたり最大画像数 */
  max_images_per_entry: number
  /** 審査方式（vote: 投票方式, score: 点数方式） */
  judging_type?: 'vote' | 'score'
  /** 審査員あたり最大投票数（投票方式の場合のみ有効） */
  max_votes_per_judge?: number
  /** 投稿の自動承認フラグ */
  auto_approve_entries?: boolean
  /** Twitter ハッシュタグ（# なし） */
  twitter_hashtag?: string
  /** Twitter 自動取得フラグ */
  twitter_auto_fetch?: boolean
  /** Twitter 投稿の自動承認フラグ */
  twitter_auto_approve?: boolean
  /** Twitter 連携必須フラグ */
  require_twitter_account?: boolean
  /** 現在のフェーズ（upcoming: 開始前, submission: 応募中, voting: 投票中, closed: 終了） */
  phase: 'upcoming' | 'submission' | 'voting' | 'closed'
  /** 承認済みエントリー数 */
  entry_count: number
  /** コンテスト作成者のユーザー名 */
  creator_username?: string
  /** 現在のユーザーが作成者かどうか */
  is_owner?: boolean
  /** 現在のユーザーが審査員かどうか */
  is_judge?: boolean
  /** 審査員数 */
  judge_count?: number
  /** 審査員リスト（詳細取得時のみ） */
  judges?: User[]
  /** 作成日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at: string
}

/** エントリーに紐づく画像 */
export interface EntryImage {
  /** 画像ID */
  id: number
  /** 画像URL */
  image: string
  /** サムネイルURL */
  thumbnail?: string
  /** 画像の幅（px） */
  width?: number
  /** 画像の高さ（px） */
  height?: number
  /** サムネイル生成済みフラグ */
  is_thumbnail_ready: boolean
  /** 表示順 */
  order: number
  /** アップロード日時（ISO 8601） */
  created_at: string
}

/** エントリー（応募作品）情報 */
export interface Entry {
  /** エントリーID（UUID） */
  id: string
  /** コンテストID */
  contest: string
  /** コンテストスラッグ */
  contest_slug?: string
  /** コンテストタイトル */
  contest_title?: string
  /** 投稿者情報（Twitter経由の場合はnull） */
  author: User | null
  /** 作品タイトル */
  title: string
  /** 作品説明 */
  description: string
  /** タグ（カンマ区切り） */
  tags: string
  /** 関連画像リスト */
  images: EntryImage[]
  /** 投稿日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at: string
  /** 承認済みフラグ（モデレーターが承認するまで false） */
  approved: boolean
  /** 通報フラグ */
  flagged: boolean
  /** 投票数 */
  vote_count: number
  /** 閲覧数 */
  view_count: number
  /** 平均審査スコア（点数方式の場合） */
  average_score?: number
  /** 現在のユーザーが投票済みかどうか */
  user_voted?: boolean
  /** サムネイルURL */
  thumbnail?: string
  /** Twitter ユーザーID（Twitter経由の場合） */
  twitter_user_id?: string
  /** Twitter ユーザー名（Twitter経由の場合） */
  twitter_username?: string
  /** ツイートURL（Twitter経由の場合） */
  twitter_url?: string
}

/** 投票情報 */
export interface Vote {
  /** 投票ID */
  id: number
  /** エントリーID */
  entry: string
  /** 投票者 */
  user: User
  /** 投票日時（ISO 8601） */
  created_at: string
}

/** 審査員によるスコア情報 */
export interface JudgeScore {
  /** スコアID */
  id: number
  /** エントリーID */
  entry: string
  /** 審査員 */
  judge: User
  /** スコア（0-100） */
  score: number
  /** 総評コメント */
  comment: string
  /** 作成日時（ISO 8601） */
  created_at: string
  /** 更新日時（ISO 8601） */
  updated_at: string
}

/** 通報情報 */
export interface Flag {
  /** 通報ID */
  id: number
  /** エントリーID */
  entry: string
  /** 通報者 */
  user: User
  /** 通報理由 */
  reason: string
  /** 解決済みフラグ */
  resolved: boolean
  /** 通報日時（ISO 8601） */
  created_at: string
}

/** ページネーションレスポンス */
export interface PaginatedResponse<T> {
  /** 総件数 */
  count: number
  /** 次ページURL */
  next?: string
  /** 前ページURL */
  previous?: string
  /** 結果リスト */
  results: T[]
}
