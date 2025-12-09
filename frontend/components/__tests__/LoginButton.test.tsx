import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginButton } from '../LoginButton'
import React from 'react'

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('LoginButton', () => {
  beforeEach(() => {
    window.location.href = ''
  })

  it('renders login button', () => {
    render(<LoginButton />)

    const loginButton = screen.getByText('ログイン')
    expect(loginButton).toBeInTheDocument()
  })

  it('shows login options when clicked', async () => {
    const user = userEvent.setup()
    render(<LoginButton />)

    const loginButton = screen.getByText('ログイン')
    await user.click(loginButton)

    // ログインオプションが表示される
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument()
    expect(screen.getByText('Twitterでログイン')).toBeInTheDocument()
  })

  it('redirects to Google login when Google option clicked', async () => {
    const user = userEvent.setup()
    render(<LoginButton />)

    const loginButton = screen.getByText('ログイン')
    await user.click(loginButton)

    const googleButton = screen.getByText('Googleでログイン')
    await user.click(googleButton)

    // Google OAuth URLにリダイレクトされる
    expect(window.location.href).toContain('google/login')
  })

  it('redirects to Twitter login when Twitter option clicked', async () => {
    const user = userEvent.setup()
    render(<LoginButton />)

    const loginButton = screen.getByText('ログイン')
    await user.click(loginButton)

    const twitterButton = screen.getByText('Twitterでログイン')
    await user.click(twitterButton)

    // Twitter OAuth URLにリダイレクトされる
    expect(window.location.href).toContain('twitter_oauth2/login')
  })
})
