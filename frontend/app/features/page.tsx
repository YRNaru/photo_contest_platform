import type { Metadata } from 'next'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: '機能一覧 - VRChat フォトコンテスト',
  description: 'VRChatフォトコンテストプラットフォームの機能一覧',
}

interface FeatureCardProps {
  emoji: string
  title: string
  description: string
  gradient: string
}

function FeatureCard({ emoji, title, description, gradient }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group p-6 rounded-xl border-2 hover:scale-105 transition-all duration-300 hover:shadow-xl transform-gpu",
        gradient
      )}
    >
      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
        {emoji}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

interface FeatureSectionProps {
  emoji: string
  title: string
  children: React.ReactNode
}

function FeatureSection({ emoji, title, children }: FeatureSectionProps) {
  return (
    <section className="mb-12 animate-fadeInUp">
      <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <GradientHeading as="span" className="text-3xl sm:text-3xl lg:text-3xl">
          {title}
        </GradientHeading>
      </h2>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  )
}

interface SubFeatureProps {
  title: string
  items: string[]
}

function SubFeature({ title, items }: SubFeatureProps) {
  return (
    <div className={cn(
      "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      "rounded-lg p-5 border border-purple-200 dark:border-purple-800"
    )}>
      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      {/* ヘッダーセクション */}
      <div className="text-center mb-12 animate-fadeInUp">
        <GradientHeading as="h1" variant="pink" size="lg" className="mb-6">
          機能一覧
        </GradientHeading>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 font-semibold">
          VRChat フォトコンテストプラットフォーム
        </p>
      </div>

      {/* このシステムについて */}
      <FeatureSection emoji="🎯" title="このシステムについて">
        <p className="text-base leading-relaxed">
          VRChatでの写真コンテストを開催・運営するためのWebサイトです。写真の投稿、投票、審査、管理などができます。
        </p>
      </FeatureSection>

      {/* アカウント登録とログイン */}
      <FeatureSection emoji="👤" title="アカウント登録とログイン">
        <SubFeature
          title="簡単ログイン"
          items={[
            'Googleアカウントでログイン: お持ちのGoogleアカウントで簡単にログインできます',
            'Twitterアカウントでログイン: お持ちのTwitterアカウントでもログインできます',
          ]}
        />
        <SubFeature
          title="プロフィール設定"
          items={[
            'アイコン画像の設定',
            '基本情報の登録',
            '連携しているアカウントの確認',
            '投稿数や獲得した票数などの確認',
          ]}
        />
      </FeatureSection>

      {/* 写真の投稿 */}
      <FeatureSection emoji="📸" title="写真の投稿">
        <SubFeature
          title="コンテストへの参加方法"
          items={[
            '写真のアップロード: 最大5枚まで。ドラッグ&ドロップで簡単に追加でき、投稿前にプレビューできます',
            'タイトルと説明: 写真のタイトルと詳しい説明文を書けます',
            'タグ付け: 自由にタグを追加して、後で検索しやすくできます',
            'コンテストの選択: 参加したいコンテストを選びます',
          ]}
        />
        <SubFeature
          title="投稿の方法"
          items={[
            '直接投稿: サイトから直接写真をアップロード',
            'Twitterから自動取得: 指定されたハッシュタグ付きでツイートすると自動的に取り込まれます',
          ]}
        />
      </FeatureSection>

      {/* Twitterとの連携 */}
      <FeatureSection emoji="🐦" title="Twitterとの連携">
        <SubFeature
          title="ツイートからの自動取り込み"
          items={[
            'ハッシュタグの監視: 特定のハッシュタグが付いた写真付きツイートを自動で検出します（過去7日間分）',
            '定期的な確認: 15分ごとに自動でチェックし、同じツイートが重複しないようにします',
            '手動での取り込み: 管理者がすぐに取り込むこともできます',
          ]}
        />
        <SubFeature
          title="Twitterからの情報保存"
          items={['ツイートのURL、投稿者の情報、写真データなどを自動で保存します']}
        />
      </FeatureSection>

      {/* 投票のしくみ */}
      <FeatureSection emoji="⭐" title="投票のしくみ">
        <SubFeature
          title="一般投票"
          items={[
            '1つの作品につき1票入れられます',
            '投票した後でも取り消すことができます',
            '今何票入っているかリアルタイムで見られます',
            '自分が投票した作品の履歴を確認できます',
          ]}
        />
        <SubFeature
          title="投票期間"
          items={[
            'コンテスト開催中のみ投票できます',
            '投票の締め切り日時が設定されています',
            '期間外は自動的に投票できなくなります',
          ]}
        />
      </FeatureSection>

      {/* 審査員による評価 */}
      <FeatureSection emoji="🏆" title="審査員による評価">
        <SubFeature
          title="審査員の役割"
          items={['コンテストごとに審査員が選ばれます', '審査員専用の評価ページがあります']}
        />
        <SubFeature
          title="点数による評価"
          items={['審査員が点数をつけてコメントを残せます', '評価の履歴を確認できます']}
        />
        <SubFeature
          title="最終結果"
          items={[
            '一般投票と審査員の評価を合わせた総合ランキングが出ます',
            '部門ごとの結果も表示されます',
          ]}
        />
      </FeatureSection>

      {/* コンテストの運営 */}
      <FeatureSection emoji="📊" title="コンテストの運営">
        <SubFeature
          title="コンテストの設定"
          items={[
            '基本情報: タイトル、説明、公開するかどうかの設定',
            '期間設定: 投稿受付期間と投票期間の設定',
            '制限の設定: 1人が投稿できる作品数や、1作品に添付できる写真の枚数の上限',
            'Twitter連携: どのハッシュタグを使うか、自動取り込みをするかなどの設定',
          ]}
        />
        <SubFeature
          title="コンテストの進行状況"
          items={['システムが自動で判断します: 開催前、投稿受付中、投票期間中、審査中、終了']}
        />
      </FeatureSection>

      {/* 投稿内容のチェック */}
      <FeatureSection emoji="🛡️" title="投稿内容のチェック">
        <SubFeature
          title="自動チェック"
          items={[
            '写真がアップロードされると自動でチェックされます',
            '写真のサイズや不適切な内容がないかを確認します',
            '表示用の小さいサイズの画像も自動で作られます',
          ]}
        />
        <SubFeature
          title="人によるチェック"
          items={[
            '承認・却下: 投稿された作品を確認して、掲載するかどうかを判断します',
            '通報機能: 不適切な投稿を見つけたユーザーが通報でき、その対応履歴が残ります',
            '管理者専用ページ: 承認待ちの作品や通報された作品を一覧で確認できます',
          ]}
        />
      </FeatureSection>

      {/* 写真の処理 */}
      <FeatureSection emoji="🖼️" title="写真の処理">
        <SubFeature
          title="自動的な画像調整"
          items={[
            'サムネイル作成: 一覧表示用と詳細表示用に、複数のサイズの画像を自動で作ります',
            '画像の最適化: サイズや品質を自動で調整して、読み込みを速くします',
          ]}
        />
        <SubFeature
          title="画像の管理"
          items={['アップロードされた写真を整理し、不要なファイルを削除できます']}
        />
      </FeatureSection>

      {/* サイトの機能 */}
      <FeatureSection emoji="📱" title="サイトの機能">
        <SubFeature
          title="ページの種類"
          items={[
            'トップページ: 開催中のコンテスト一覧',
            'コンテスト詳細ページ: 投稿作品一覧と投票',
            '作品詳細ページ: 写真の拡大表示と投票ボタン',
            '投稿ページ: 新しい作品を投稿するフォーム',
            'マイページ: 自分の投稿や投票した作品の確認',
            'プロフィールページ: 自分の情報を編集',
            '審査ページ: 審査員専用',
            '管理ページ: 運営者専用',
          ]}
        />
        <SubFeature
          title="見た目と使いやすさ"
          items={[
            'ダークモード: 明るいテーマと暗いテーマを切り替えられます',
            'スマホ対応: スマートフォン、タブレット、パソコンのどれでも見やすく表示されます',
            'スムーズな動き: ページの切り替えや読み込み中の表示がスムーズです',
          ]}
        />
        <SubFeature
          title="デザイン要素"
          items={[
            'カード形式の見やすいレイアウト、格子状の作品表示',
            '入力しやすいフォーム、写真のアップロード機能、タグの選択機能',
          ]}
        />
      </FeatureSection>

      {/* 特徴カード */}
      <section className="mb-12 animate-fadeInUp">
        <GradientHeading as="h2" className="text-center mb-6">
          🌟 主な特徴
        </GradientHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            emoji="📸"
            title="簡単投稿"
            description="最大5枚まで写真をアップロード。ドラッグ&ドロップで簡単に追加できます"
            gradient={cn(
              "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30",
              "border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
            )}
          />
          <FeatureCard
            emoji="⭐"
            title="投票機能"
            description="気に入った作品に投票して、お気に入りをシェアしましょう"
            gradient={cn(
              "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
              "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600"
            )}
          />
          <FeatureCard
            emoji="🏆"
            title="審査員スコア"
            description="プロの審査員による評価で公平な審査を実現します"
            gradient={cn(
              "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30",
              "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"
            )}
          />
          <FeatureCard
            emoji="🐦"
            title="Twitter連携"
            description="ハッシュタグ付きツイートを自動で取り込み、簡単参加"
            gradient={cn(
              "bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/30 dark:to-sky-900/30",
              "border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600"
            )}
          />
          <FeatureCard
            emoji="🛡️"
            title="モデレーション"
            description="自動・手動の二段階チェックで安心安全な運営"
            gradient={cn(
              "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30",
              "border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600"
            )}
          />
          <FeatureCard
            emoji="📱"
            title="レスポンシブ"
            description="スマホ、タブレット、PCどの端末でも快適に利用可能"
            gradient={cn(
              "bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30",
              "border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600"
            )}
          />
        </div>
      </section>
    </div>
  )
}
