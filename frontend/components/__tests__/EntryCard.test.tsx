import { render, screen } from '@testing-library/react'
import { EntryCard } from '../EntryCard'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('EntryCard', () => {
  const mockEntry = {
    id: '123',
    title: 'Test Entry',
    description: 'Test Description',
    author: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      avatar_url: null,
      is_judge: false,
      is_moderator: false,
      created_at: '2024-01-01T00:00:00Z'
    },
    contest: 'test-contest',
    tags: 'test,photo',
    created_at: '2024-01-01T00:00:00Z',
    vote_count: 5,
    view_count: 10,
    thumbnail: 'https://example.com/thumb.jpg',
    approved: true,
  }

  it('renders entry information', () => {
    render(<EntryCard entry={mockEntry} />)

    expect(screen.getByText('Test Entry')).toBeInTheDocument()
  })

  it('renders link to entry detail', () => {
    render(<EntryCard entry={mockEntry} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/entries/123')
  })
})

