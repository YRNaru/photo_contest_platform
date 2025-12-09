'use client'

import { useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Contest } from '@/lib/types'
import { useRouter } from 'next/navigation'

// Moment.jsのロケールを日本語に設定
moment.locale('ja', {
  months: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
  weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
  weekdaysMin: '日_月_火_水_木_金_土'.split('_'),
})

const localizer = momentLocalizer(moment)

interface ContestEvent {
  title: string
  start: Date
  end: Date
  contest: Contest
  eventType: 'start' | 'end' | 'voting_end'
  resource?: {
    type: string
    color: string
  }
}

interface ContestCalendarProps {
  contests: Contest[]
}

export function ContestCalendar({ contests }: ContestCalendarProps) {
  const router = useRouter()

  // コンテストからカレンダーイベントを生成
  const events: ContestEvent[] = useMemo(() => {
    const eventList: ContestEvent[] = []

    contests.forEach(contest => {
      // 開始日イベント
      eventList.push({
        title: `🚀 ${contest.title}（開始）`,
        start: new Date(contest.start_at),
        end: new Date(contest.start_at),
        contest,
        eventType: 'start',
        resource: {
          type: 'start',
          color: 'bg-green-500',
        },
      })

      // 終了日イベント
      eventList.push({
        title: `⏰ ${contest.title}（応募終了）`,
        start: new Date(contest.end_at),
        end: new Date(contest.end_at),
        contest,
        eventType: 'end',
        resource: {
          type: 'end',
          color: 'bg-red-500',
        },
      })

      // 投票終了日イベント（存在する場合）
      if (contest.voting_end_at) {
        eventList.push({
          title: `🗳️ ${contest.title}（投票終了）`,
          start: new Date(contest.voting_end_at),
          end: new Date(contest.voting_end_at),
          contest,
          eventType: 'voting_end',
          resource: {
            type: 'voting_end',
            color: 'bg-blue-500',
          },
        })
      }
    })

    return eventList
  }, [contests])

  // イベントをクリックしたときの処理
  const handleSelectEvent = (event: ContestEvent) => {
    router.push(`/contests/${event.contest.slug}`)
  }

  // イベントのスタイル
  const eventStyleGetter = (event: ContestEvent) => {
    let backgroundColor = '#9333ea' // デフォルト: 紫

    switch (event.eventType) {
      case 'start':
        backgroundColor = '#10b981' // 緑
        break
      case 'end':
        backgroundColor = '#ef4444' // 赤
        break
      case 'voting_end':
        backgroundColor = '#3b82f6' // 青
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
      },
    }
  }

  // カスタムメッセージ
  const messages = {
    allDay: '終日',
    previous: '前へ',
    next: '次へ',
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時間',
    event: 'イベント',
    noEventsInRange: 'この期間にコンテストはありません',
    showMore: (total: number) => `+${total} 件`,
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="mb-4">
        <h2 className="text-2xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          📅 コンテストカレンダー
        </h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">開始</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">応募終了</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">投票終了</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 700;
          font-size: 0.9rem;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        .dark .rbc-header {
          color: #9ca3af;
          border-bottom-color: #374151;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .dark .rbc-today {
          background-color: #422006;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .dark .rbc-off-range-bg {
          background-color: #111827;
        }
        .rbc-event {
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 1 !important;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .dark .rbc-month-view {
          border-color: #374151;
        }
        .rbc-month-row {
          border-color: #e5e7eb;
        }
        .dark .rbc-month-row {
          border-color: #374151;
        }
        .rbc-day-bg {
          border-color: #e5e7eb;
        }
        .dark .rbc-day-bg {
          border-color: #374151;
        }
        .rbc-date-cell {
          padding: 6px;
          text-align: right;
        }
        .rbc-button-link {
          color: #374151;
          font-weight: 600;
        }
        .dark .rbc-button-link {
          color: #d1d5db;
        }
        .rbc-toolbar {
          padding: 15px 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #d1d5db;
          background-color: white;
          padding: 6px 15px;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .dark .rbc-toolbar button {
          color: #d1d5db;
          border-color: #4b5563;
          background-color: #1f2937;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        .dark .rbc-toolbar button:hover {
          background-color: #374151;
          border-color: #6b7280;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #9333ea;
          color: white;
          border-color: #9333ea;
        }
        .dark .rbc-toolbar button.rbc-active {
          background-color: #a855f7;
          border-color: #a855f7;
        }
        @media (max-width: 640px) {
          .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .rbc-toolbar-label {
            text-align: center;
            order: -1;
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
        }
      `}</style>

      <div className="calendar-container" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          views={['month', 'agenda']}
          defaultView="month"
        />
      </div>
    </div>
  )
}
