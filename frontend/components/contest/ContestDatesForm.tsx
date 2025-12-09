'use client'

import { DateTimeInput } from './DateTimeInput'

interface ContestDatesFormProps {
  startAt: string
  endAt: string
  votingEndAt: string
  onStartAtChange: (value: string) => void
  onEndAtChange: (value: string) => void
  onVotingEndAtChange: (value: string) => void
}

export function ContestDatesForm({
  startAt,
  endAt,
  votingEndAt,
  onStartAtChange,
  onEndAtChange,
  onVotingEndAtChange,
}: ContestDatesFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimeInput label="開始日時" value={startAt} onChange={onStartAtChange} required />

        <DateTimeInput label="終了日時" value={endAt} onChange={onEndAtChange} required />
      </div>

      <DateTimeInput
        label="投票終了日時（任意）"
        value={votingEndAt}
        onChange={onVotingEndAtChange}
        helperText="未設定の場合、投票機能は無効になります"
      />
    </div>
  )
}
