// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props) {
    const {
      src,
      alt,
      fill: _fill,
      priority: _priority,
      unoptimized: _unoptimized,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      loader: _loader,
      onLoadingComplete: _onLoadingComplete,
      ...rest
    } = props
    return React.createElement('img', { src, alt, ...rest })
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock
