export function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18000/api'
  // /apiで終わる場合は削除
  return apiUrl.replace(/\/api\/?$/, '')
}

