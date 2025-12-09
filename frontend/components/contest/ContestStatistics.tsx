'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  if (error || !statistics) {
    return null
  }

  // グラフデータの準備
  const labels = statistics.daily_entries.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const data = {
    labels,
    datasets: [
      {
        label: '応募数',
        data: statistics.daily_entries.map(item => item.count),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: { parsed: { y: number | null } }) {
            return `応募数: ${context.parsed.y ?? 0}件`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          📊 応募統計
        </h2>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
              承認済み作品
            </div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-100">
              {statistics.total_entries}
              <span className="text-sm font-normal ml-1">件</span>
            </div>
          </div>

          {statistics.pending_entries > 0 && (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                承認待ち
              </div>
              <div className="text-2xl font-black text-yellow-900 dark:text-yellow-100">
                {statistics.pending_entries}
                <span className="text-sm font-normal ml-1">件</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              総投票数
            </div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-100">
              {statistics.total_votes}
              <span className="text-sm font-normal ml-1">票</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
              投票者数
            </div>
            <div className="text-2xl font-black text-green-900 dark:text-green-100">
              {statistics.unique_voters}
              <span className="text-sm font-normal ml-1">人</span>
            </div>
          </div>
        </div>

        {/* 日別応募数グラフ */}
        {statistics.daily_entries.length > 0 ? (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              日別応募数の推移
            </h3>
            <div className="h-64 md:h-80">
              <Line data={data} options={options} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            まだ応募がありません
          </div>
        )}
      </div>
    </div>
  )
}
