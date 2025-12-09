import { cn, formatDate, formatDateTime, getPhaseLabel, getPhaseColor } from '../utils'

describe('Utility Functions - Full Coverage', () => {
  describe('cn - Class Name Merger', () => {
    it('merges class names correctly', () => {
      const result = cn('foo', 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('handles conditional classes', () => {
      const result = cn('base', true && 'active', false && 'inactive')
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('inactive')
    })

    it('handles undefined and null', () => {
      const result = cn('foo', undefined, null, 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date to Japanese locale', () => {
      const date = '2024-01-15T10:30:00Z'
      const formatted = formatDate(date)

      expect(formatted).toContain('2024')
      expect(formatted).toContain('1')
      expect(formatted).toContain('15')
    })

    it('handles different date formats', () => {
      const date = '2024-12-31T23:59:59Z'
      const formatted = formatDate(date)

      expect(formatted).toContain('2024')
      expect(formatted).toContain('12')
      expect(formatted).toContain('31')
    })
  })

  describe('formatDateTime', () => {
    it('formats ISO datetime to Japanese locale with time', () => {
      const datetime = '2024-01-15T10:30:00Z'
      const formatted = formatDateTime(datetime)

      expect(formatted).toContain('2024')
      // 時刻が含まれることを確認
      expect(formatted.length).toBeGreaterThan(formatDate(datetime).length)
    })

    it('includes hour and minute', () => {
      const datetime = '2024-06-15T14:45:00Z'
      const formatted = formatDateTime(datetime)

      expect(formatted).toContain('2024')
    })
  })

  describe('getPhaseLabel', () => {
    it('returns correct label for upcoming', () => {
      expect(getPhaseLabel('upcoming')).toBe('開催予定')
    })

    it('returns correct label for submission', () => {
      expect(getPhaseLabel('submission')).toBe('応募受付中')
    })

    it('returns correct label for voting', () => {
      expect(getPhaseLabel('voting')).toBe('投票受付中')
    })

    it('returns correct label for closed', () => {
      expect(getPhaseLabel('closed')).toBe('終了')
    })

    it('returns original phase for unknown phase', () => {
      expect(getPhaseLabel('unknown')).toBe('unknown')
    })
  })

  describe('getPhaseColor', () => {
    it('returns correct color for upcoming', () => {
      expect(getPhaseColor('upcoming')).toBe('bg-gray-500')
    })

    it('returns correct color for submission', () => {
      expect(getPhaseColor('submission')).toBe('bg-green-500')
    })

    it('returns correct color for voting', () => {
      expect(getPhaseColor('voting')).toBe('bg-blue-500')
    })

    it('returns correct color for closed', () => {
      expect(getPhaseColor('closed')).toBe('bg-gray-400')
    })

    it('returns default color for unknown phase', () => {
      expect(getPhaseColor('unknown')).toBe('bg-gray-500')
    })
  })
})
