import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../UserMenu'
import React from 'react'
import { vi } from 'vitest'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
}))

// Mock auth
const mockLogout = vi.fn()
vi.mock('../../lib/auth', () => ({
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
    mockPush.mockClear()
  })

  it('renders user avatar', () => {
    render(<UserMenu />)

    // ユーザー名が表示される
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('shows dropdown menu when avatar clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    const trigger = screen.getByText('testuser')
    await user.click(trigger)

    expect(await screen.findByText('プロフィール')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('calls logout when logout button clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    const trigger = screen.getByText('testuser')
    await user.click(trigger)

    const logoutButton = await screen.findByText('ログアウト')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })
})
