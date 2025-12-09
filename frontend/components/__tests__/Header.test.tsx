import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import React from 'react'

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock SidebarProvider and ThemeProvider
jest.mock('../../lib/sidebar-context', () => ({
  useSidebar: () => ({
    isOpen: false,
    toggle: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
  }),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('../../lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Header', () => {
  it('renders site title', () => {
    render(<Header />)

    const title = screen.getByText('VRChat Photo Contest')
    expect(title).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)

    expect(screen.getByText('コンテスト')).toBeInTheDocument()
  })

  it('renders logo link to home', () => {
    render(<Header />)

    const logoLink = screen.getByRole('link', { name: /VRChat Photo Contest/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('has correct structure', () => {
    const { container } = render(<Header />)

    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })
})
