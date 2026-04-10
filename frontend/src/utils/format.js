export function truncateWords(text, limit) {
  if (!text) {
    return ''
  }

  const words = text.trim().split(/\s+/)
  if (words.length <= limit) {
    return text
  }

  return `${words.slice(0, limit).join(' ')}...`
}

export function formatTimeAgo(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const ranges = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ]

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const range of ranges) {
    if (Math.abs(diffInSeconds) >= range.seconds) {
      return formatter.format(
        Math.round(diffInSeconds / range.seconds),
        range.unit,
      )
    }
  }

  return formatter.format(diffInSeconds, 'second')
}
