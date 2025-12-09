import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPhaseLabel(phase: string) {
  const labels: Record<string, string> = {
    upcoming: '開催予定',
    submission: '応募受付中',
    voting: '投票受付中',
    closed: '終了',
  }
  return labels[phase] || phase
}

export function getPhaseColor(phase: string) {
  const colors: Record<string, string> = {
    upcoming: 'bg-gray-500',
    submission: 'bg-green-500',
    voting: 'bg-blue-500',
    closed: 'bg-gray-400',
  }
  return colors[phase] || 'bg-gray-500'
}
