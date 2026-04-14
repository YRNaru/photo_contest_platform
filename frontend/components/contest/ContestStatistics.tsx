'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { StatCard } from '@/components/ui/stat-card'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { CustomIcon } from '../ui/custom-icon'

interface ContestStatisticsProps {
  contestSlug: string
}

interface DailyEntry {
  date: string
  count: number
}

interface StatisticsData {
  daily_entries: DailyEntry[]
  total_entries: number
  pending_entries: number
  total_votes: number
  unique_voters: number
}

export function ContestStatistics({ contestSlug }: ContestStatisticsProps) {
  const {
    data: statistics,
    isLoading,
    error,
  } = useQuery<StatisticsData>({
    queryKey: ['contest-statistics', contestSlug],
    queryFn: async () => {
      const response = await contestApi.getContestStatistics(contestSlug)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  })

  if (isLoading) {
    return (
      <div className={cn(
        "relative bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-[2rem]",
        "border border-white/20 dark:border-white/10 p-6 sm:p-8"
      )}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 dark:bg-white/10 rounded-lg w-1/3 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="h-28 bg-white/20 dark:bg-white/10 rounded-2xl" />
            <div className="h-28 bg-white/20 dark:bg-white/10 rounded-2xl" />
            <div className="h-28 bg-white/20 dark:bg-white/10 rounded-2xl" />
            <div className="h-28 bg-white/20 dark:bg-white/10 rounded-2xl" />
          </div>
          <div className="h-64 sm:h-80 bg-white/20 dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !statistics) {
    return null
  }

  // グラフデータの準備
  const chartData = statistics.daily_entries.map((item: DailyEntry) => {
    const date = new Date(item.date)
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      count: item.count,
    }
  })

  return (
    <div className={cn(
      "relative bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-[2rem]",
      "border border-white/20 dark:border-white/10 overflow-hidden",
      "shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
    )}>
      {/* Background subtle neon glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <CustomIcon name="stats" size={40} />
          <h2 className={cn(
            "text-[clamp(1.5rem,3.5vw+0.5rem,2.25rem)] font-black text-transparent bg-clip-text",
            "bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70"
          )}>
            応募統計ダッシュボード
          </h2>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <StatCard
            color="purple"
            title="承認済み作品"
            value={statistics.total_entries}
            unit="件"
          />

          {statistics.pending_entries > 0 && (
            <StatCard
              color="yellow"
              title="承認待ち"
              value={statistics.pending_entries}
              unit="件"
            />
          )}

          <StatCard
            color="blue"
            title="総投票数"
            value={statistics.total_votes}
            unit="票"
          />

          <StatCard
            color="green"
            title="投票者数"
            value={statistics.unique_voters}
            unit="人"
          />
        </div>

        {/* 日別応募数グラフ */}
        {statistics.daily_entries.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/20 dark:bg-black/20 p-4 sm:p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-6 text-foreground/90 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              日別ネットワークトラフィック (応募数)
            </h3>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#22d3ee" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#083344', stroke: '#22d3ee', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                    filter="url(#neonGlow)"
                  />
                  <CartesianGrid stroke="#ffffff" strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={{ stroke: '#ffffff', opacity: 0.1 }}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(34, 211, 238, 0.3)', 
                      borderRadius: '12px', 
                      color: '#fff',
                      boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)'
                    }}
                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    formatter={(value: any) => [`${value} 件`, '受信データ']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-white/5 bg-white/5 dark:bg-black/20">
            <div className="flex justify-center mb-4 opacity-50">
              <CustomIcon name="stats" size={64} />
            </div>
            <p className="text-foreground/60 font-medium">シグナルが検出されません（応募なし）</p>
          </div>
        )}
      </div>
    </div>
  )
}
