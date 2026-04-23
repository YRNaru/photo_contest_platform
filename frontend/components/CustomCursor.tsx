'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isHover, setIsHover] = useState(false)
  const [isView, setIsView] = useState(false)

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Dot moves instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const viewTarget = target.closest('[data-cursor="view"]')
      const interactiveTarget = target.closest('a, button, [role="button"]')

      if (viewTarget) {
        setIsView(true)
        setIsHover(false)
      } else if (interactiveTarget) {
        setIsHover(true)
        setIsView(false)
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const viewTarget = target.closest('[data-cursor="view"]')
      const interactiveTarget = target.closest('a, button, [role="button"]')

      if (viewTarget) {
        setIsView(false)
      } else if (interactiveTarget) {
        setIsHover(false)
      }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseout', onMouseOut, { passive: true })

    // Animation loop for smooth cursor follow
    let animationFrameId: number
    const animate = () => {
      // Ease factor
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`
      }

      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Hide entirely on touch devices via CSS
  return (
    <>
      <div
        ref={cursorRef}
        className={cn(
          'pointer-events-none fixed left-0 top-0 z-[10000] flex items-center justify-center rounded-full border-[1.5px] border-[#CDFF50] mix-blend-difference',
          'transition-[width,height,background-color,border-color,mix-blend-mode] duration-300 ease-out',
          'hidden sm:flex', // Hide on mobile
          isView ? 'h-[90px] w-[90px] bg-[#CDFF50] mix-blend-normal' : isHover ? 'h-[60px] w-[60px] bg-[#CDFF50]' : 'h-5 w-5'
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <span
          className={cn(
            'pointer-events-none font-body text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0B0B0F] transition-opacity duration-200',
            isView ? 'opacity-100' : 'opacity-0'
          )}
        >
          VIEW
        </span>
      </div>
      <div
        ref={dotRef}
        className={cn(
          'pointer-events-none fixed left-0 top-0 z-[10001] hidden h-[5px] w-[5px] rounded-full bg-[#CDFF50] sm:block'
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  )
}
