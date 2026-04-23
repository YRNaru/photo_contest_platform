import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import React from 'react'
import { vi } from 'vitest'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loadUser: vi.fn(),
    logout: vi.fn(),
  }),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  },
}))

// Mock SidebarProvider and ThemeProvider
vi.mock('../../lib/sidebar-context', () => ({
  useSidebar: () => ({
    isLeftOpen: false,
    isRightOpen: false,
    toggleLeft: vi.fn(),
    toggleRight: vi.fn(),
  }),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Header', () => {
  it('renders site title', () => {
    render(<Header />)

    const title = screen.getByText('VRC Contest')
    expect(title).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)

    expect(screen.getByText('コンテスト')).toBeInTheDocument()
  })

  it('renders logo link to home', () => {
    render(<Header />)

    const logoLink = screen.getByRole('link', { name: /VRC Contest/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('has correct structure', () => {
    const { container } = render(<Header />)

    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })
})
