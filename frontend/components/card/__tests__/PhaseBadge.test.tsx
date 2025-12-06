import { render, screen } from '@testing-library/react'
import { PhaseBadge } from '../PhaseBadge'

describe('PhaseBadge', () => {
  it('renders upcoming phase badge', () => {
    render(<PhaseBadge phase="upcoming" />)
    expect(screen.getByText('開催予定')).toBeInTheDocument()
  })

  it('renders submission phase badge', () => {
    render(<PhaseBadge phase="submission" />)
    expect(screen.getByText('応募受付中')).toBeInTheDocument()
  })

  it('renders voting phase badge', () => {
    render(<PhaseBadge phase="voting" />)
    expect(screen.getByText('投票受付中')).toBeInTheDocument()
  })

  it('renders closed phase badge', () => {
    render(<PhaseBadge phase="closed" />)
    expect(screen.getByText('終了')).toBeInTheDocument()
  })

  it('applies correct color for upcoming', () => {
    const { container } = render(<PhaseBadge phase="upcoming" />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-gray-500')
  })

  it('applies correct color for submission', () => {
    const { container } = render(<PhaseBadge phase="submission" />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-green-500')
  })

  it('applies correct color for voting', () => {
    const { container } = render(<PhaseBadge phase="voting" />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-blue-500')
  })

  it('applies correct color for closed', () => {
    const { container } = render(<PhaseBadge phase="closed" />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-gray-400')
  })
})

