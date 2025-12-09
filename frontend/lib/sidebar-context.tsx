'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isLeftOpen: boolean
  isRightOpen: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)

  // ローカルストレージから状態を復元
  useEffect(() => {
    const savedLeft = localStorage.getItem('leftSidebarOpen')
    const savedRight = localStorage.getItem('rightSidebarOpen')

    const isLargeScreen = window.innerWidth >= 1280

    if (savedLeft !== null) {
      setIsLeftOpen(savedLeft === 'true' && isLargeScreen)
    } else {
      setIsLeftOpen(isLargeScreen)
    }

    if (savedRight !== null) {
      setIsRightOpen(savedRight === 'true' && isLargeScreen)
    } else {
      setIsRightOpen(isLargeScreen)
    }
  }, [])

  // ウィンドウサイズ変更を監視
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1280

      if (!isLargeScreen) {
        // 1280px未満になったら両方閉じる
        setIsLeftOpen(false)
        setIsRightOpen(false)
      } else {
        // 1280px以上になったら保存された状態を復元
        const savedLeft = localStorage.getItem('leftSidebarOpen')
        const savedRight = localStorage.getItem('rightSidebarOpen')

        if (savedLeft !== null) {
          setIsLeftOpen(savedLeft === 'true')
        } else {
          setIsLeftOpen(true)
        }

        if (savedRight !== null) {
          setIsRightOpen(savedRight === 'true')
        } else {
          setIsRightOpen(true)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleLeft = () => {
    setIsLeftOpen(prev => {
      const newState = !prev
      localStorage.setItem('leftSidebarOpen', String(newState))
      return newState
    })
  }

  const toggleRight = () => {
    setIsRightOpen(prev => {
      const newState = !prev
      localStorage.setItem('rightSidebarOpen', String(newState))
      return newState
    })
  }

  return (
    <SidebarContext.Provider value={{ isLeftOpen, isRightOpen, toggleLeft, toggleRight }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
