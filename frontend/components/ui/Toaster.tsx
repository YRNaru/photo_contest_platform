'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  return (
    <ToastPrimitives.Provider>
      <ToastPrimitives.Viewport className="fixed top-0 right-0 p-4 z-[100]" />
    </ToastPrimitives.Provider>
  )
}
