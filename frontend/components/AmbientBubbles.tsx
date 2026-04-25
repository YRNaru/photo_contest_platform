'use client'

import { useEffect, useRef, useState } from 'react'

const bubbleColors = [
  'rgba(205, 255, 80, 0.45)',   // Lime accent
  'rgba(120, 200, 255, 0.40)',  // Cyan
  'rgba(200, 130, 255, 0.40)',  // Purple
  'rgba(255, 180, 100, 0.35)',  // Warm orange
  'rgba(100, 255, 200, 0.40)',  // Mint
]

export function AmbientBubbles() {
  const timeoutIdsRef = useRef<number[]>([])
  const [bubbles, setBubbles] = useState<
    Array<{
      id: string
      size: number
      left: number
      duration: number
      drift: number
      opacity: number
      color: string
    }>
  >([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const createBubble = () => {
      const id = Math.random().toString(36).substr(2, 9)
      const size = Math.random() * 180 + 80 // 80px ~ 260px
      const left = Math.random() * 100 // 0% ~ 100%
      const duration = Math.random() * 12 + 10 // 10s ~ 22s
      const drift = (Math.random() - 0.5) * 150 // drift pixels
      const opacity = Math.random() * 0.2 + 0.3 // 0.3 ~ 0.5
      const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)]

      setBubbles((prev) => [...prev, { id, size, left, duration, drift, opacity, color }])

      // Clean up bubble after animation
      const removeBubbleTimeoutId = window.setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id))
        timeoutIdsRef.current = timeoutIdsRef.current.filter((timeoutId) => timeoutId !== removeBubbleTimeoutId)
      }, duration * 1000)
      timeoutIdsRef.current.push(removeBubbleTimeoutId)
    }

    // Initial batch
    for (let i = 0; i < 8; i++) {
      const initialTimeoutId = window.setTimeout(createBubble, i * 600)
      timeoutIdsRef.current.push(initialTimeoutId)
    }

    // Continuously spawn
    const interval = setInterval(createBubble, 2000)

    return () => {
      clearInterval(interval)
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIdsRef.current = []
    }
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[1]"
      aria-hidden="true"
    >
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border border-solid animate-bubbleFloat"
          style={
            {
              bottom: '-300px',
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              '--bubble-drift': `${b.drift}px`,
              '--bubble-opacity': b.opacity,
              background: `radial-gradient(circle at 30% 30%, ${b.color}, transparent 60%)`,
              borderColor: b.color.replace(/[\d.]+\)$/, '0.25)'),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
