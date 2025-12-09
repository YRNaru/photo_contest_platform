/**
 * ユーティリティ関数のテスト
 *
 * このファイルは汎用ユーティリティ関数のテストを含みます。
 * 現在はプレースホルダーとして基本的なテストを含んでいます。
 */

describe('Utility Functions', () => {
  describe('Date Formatting', () => {
    it('should format ISO date string', () => {
      const isoDate = '2024-01-01T00:00:00Z'
      const date = new Date(isoDate)

      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0) // January is 0
      expect(date.getDate()).toBe(1)
    })

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid')
      expect(isNaN(invalidDate.getTime())).toBe(true)
    })
  })

  describe('String Helpers', () => {
    it('should truncate long text', () => {
      const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
      }

      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('should handle empty strings', () => {
      const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
      }

      expect(truncate('', 5)).toBe('')
    })
  })

  describe('Number Formatting', () => {
    it('should format numbers with comma separators', () => {
      const formatNumber = (num: number) => {
        return num.toLocaleString('ja-JP')
      }

      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1234567)).toBe('1,234,567')
    })
  })

  describe('Phase Detection', () => {
    it('should detect contest phases correctly', () => {
      const getPhase = (startAt: string, endAt: string, votingEndAt?: string) => {
        const now = new Date()
        const start = new Date(startAt)
        const end = new Date(endAt)
        const votingEnd = votingEndAt ? new Date(votingEndAt) : null

        if (now < start) return 'upcoming'
        if (now >= start && now <= end) return 'submission'
        if (votingEnd && now > end && now <= votingEnd) return 'voting'
        return 'closed'
      }

      // Upcoming contest
      const futureStart = new Date(Date.now() + 86400000).toISOString() // Tomorrow
      const futureEnd = new Date(Date.now() + 86400000 * 30).toISOString()
      expect(getPhase(futureStart, futureEnd)).toBe('upcoming')

      // Active submission period
      const pastStart = new Date(Date.now() - 86400000).toISOString() // Yesterday
      const futureEnd2 = new Date(Date.now() + 86400000 * 30).toISOString()
      expect(getPhase(pastStart, futureEnd2)).toBe('submission')

      // Closed contest
      const pastStart2 = new Date(Date.now() - 86400000 * 60).toISOString()
      const pastEnd = new Date(Date.now() - 86400000 * 30).toISOString()
      expect(getPhase(pastStart2, pastEnd)).toBe('closed')
    })
  })
})
