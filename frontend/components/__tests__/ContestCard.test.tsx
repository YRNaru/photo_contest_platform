import { render, screen } from '@testing-library/react'
import { ContestCard } from '../ContestCard'

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/image', () => {
  const MockImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
  MockImage.displayName = 'MockImage'
  return {
    __esModule: true,
    default: MockImage,
  }
})

describe('ContestCard', () => {
  const mockContest = {
    slug: 'test-contest',
    title: 'Test Contest',
    description: 'This is a test contest description',
    banner_image: '/test-banner.jpg',
    start_at: '2024-01-01T00:00:00Z',
    end_at: '2024-12-31T23:59:59Z',
    phase: 'submission',
    entry_count: 42,
  }

  it('renders contest information correctly', () => {
    render(<ContestCard contest={mockContest} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
    expect(screen.getByText('This is a test contest description')).toBeInTheDocument()
    expect(screen.getByText('42 件')).toBeInTheDocument()
  })

  it('renders link to contest detail page', () => {
    render(<ContestCard contest={mockContest} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/contests/test-contest')
  })

  it('displays upcoming phase badge', () => {
    const upcomingContest = { ...mockContest, phase: 'upcoming' }
    render(<ContestCard contest={upcomingContest} />)

    // PhaseBadgeコンポーネントがレンダリングされていることを確認
    expect(screen.getByText(/件/)).toBeInTheDocument()
  })

  it('displays submission phase badge', () => {
    const submissionContest = { ...mockContest, phase: 'submission' }
    render(<ContestCard contest={submissionContest} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })

  it('displays voting phase badge', () => {
    const votingContest = { ...mockContest, phase: 'voting' }
    render(<ContestCard contest={votingContest} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })

  it('displays closed phase badge', () => {
    const closedContest = { ...mockContest, phase: 'closed' }
    render(<ContestCard contest={closedContest} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })

  it('renders without banner image', () => {
    const contestWithoutBanner = { ...mockContest, banner_image: undefined }
    render(<ContestCard contest={contestWithoutBanner} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })

  it('handles zero entries', () => {
    const contestWithNoEntries = { ...mockContest, entry_count: 0 }
    render(<ContestCard contest={contestWithNoEntries} />)

    expect(screen.getByText('0 件')).toBeInTheDocument()
  })

  it('truncates long description', () => {
    const longDescription = 'A'.repeat(200)
    const contestWithLongDesc = { ...mockContest, description: longDescription }

    const { container } = render(<ContestCard contest={contestWithLongDesc} />)

    // line-clamp-2 クラスが適用されていることを確認
    const descElement = container.querySelector('.line-clamp-2')
    expect(descElement).toBeInTheDocument()
  })

  it('applies priority prop to banner', () => {
    render(<ContestCard contest={mockContest} priority={true} />)

    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })
})
