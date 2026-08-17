// Forenzné utility pre časové kalkulácie, reťazcové operácie a fuzzy párovanie mien

export function removeDiacritics(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m

  const dp: number[] = Array.from({ length: m + 1 }, (_, i) => i)

  for (let j = 1; j <= n; j++) {
    let prev = dp[0] ?? 0
    dp[0] = j
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i] ?? 0
      const current = dp[i] ?? 0
      const prevVal = dp[i - 1] ?? 0
      dp[i] = Math.min(current + 1, prevVal + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[m] ?? 0
}

export function parseTimeToMinutes(time: string | null | undefined): number | null {
  if (!time) return null
  const m = String(time).match(/(\d{1,2})[:.](\d{2})/)
  if (!m || !m[1] || !m[2]) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (isNaN(h) || isNaN(min) || h > 23 || min > 59) return null
  return h * 60 + min
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null || isNaN(minutes) || minutes < 0) return '00:00'
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function namesMatch(a: string, b: string): boolean {
  const na = removeDiacritics(a)
  const nb = removeDiacritics(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  return levenshtein(na, nb) <= 2 && Math.abs(na.length - nb.length) <= 2
}

export const TYPE_COLOR: Record<string, string> = {
  podozrivý: '#ef4444',
  svedok: '#3b82f6',
  obeť: '#f97316',
  alibi: '#22c55e'
}
