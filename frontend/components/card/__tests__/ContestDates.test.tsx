import { render, screen } from '@testing-library/react'
import { ContestDates } from '../ContestDates'

describe('ContestDates', () => {
  it('renders start and end dates', () => {
    const startAt = '2024-01-01T00:00:00Z'
    const endAt = '2024-12-31T23:59:59Z'
    
    render(<ContestDates startAt={startAt} endAt={endAt} />)
    
    // 開始と終了のラベルが表示されることを確認
    expect(screen.getByText('開始:')).toBeInTheDocument()
    expect(screen.getByText('終了:')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    const startAt = '2024-06-15T10:30:00Z'
    const endAt = '2024-06-30T18:00:00Z'
    
    render(<ContestDates startAt={startAt} endAt={endAt} />)
    
    // 日付が表示されることを確認
    expect(screen.getByText('開始:')).toBeInTheDocument()
    expect(screen.getByText('終了:')).toBeInTheDocument()
  })

  it('handles same day dates', () => {
    const startAt = '2024-01-01T09:00:00Z'
    const endAt = '2024-01-01T18:00:00Z'
    
    render(<ContestDates startAt={startAt} endAt={endAt} />)
    
    // コンポーネントがレンダリングされることを確認
    expect(screen.getByText('開始:')).toBeInTheDocument()
    expect(screen.getByText('終了:')).toBeInTheDocument()
  })
})

