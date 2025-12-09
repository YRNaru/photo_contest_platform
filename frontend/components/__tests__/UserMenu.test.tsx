import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../UserMenu'
import React from 'react'

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock auth
const mockLogout = jest.fn()
jest.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    logout: mockLogout,
  }),
}))

describe('UserMenu', () => {
  beforeEach(() => {
    mockLogout.mockClear()
  })

  it('renders user avatar', () => {
    render(<UserMenu />)

    // ユーザー名が表示される
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('shows dropdown menu when avatar clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    // アバターをクリック
    const avatar = screen.getByText('testuser')
    await user.click(avatar)

    // メニューが表示される
    expect(screen.getByText('プロフィール')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('calls logout when logout button clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    // アバターをクリック
    const avatar = screen.getByText('testuser')
    await user.click(avatar)

    // ログアウトをクリック
    const logoutButton = screen.getByText('ログアウト')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })
})
