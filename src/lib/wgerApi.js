const BASE_URL = 'https://wger.de/api/v2'
const CACHE_PREFIX = 'wger_cache_'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function getCached(key) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null
    const { data, expiresAt } = JSON.parse(item)
    if (Date.now() > expiresAt) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      expiresAt: Date.now() + CACHE_DURATION,
    }))
  } catch { /* storage full */ }
}

let lastRequestTime = 0
async function rateLimitedFetch(url) {
  const elapsed = Date.now() - lastRequestTime
  if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed))
  lastRequestTime = Date.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Fetch images from exerciseinfo endpoint (most reliable)
async function fetchByBaseId(baseId) {
  const data = await rateLimitedFetch(`${BASE_URL}/exerciseinfo/${baseId}/?format=json`)
  const images = (data.images || [])
    .filter(img => img.image)
    .sort((a, b) => (b.is_main ? 1 : -1) - (a.is_main ? 1 : -1))
    .map(img => img.image)
  return images
}

// Fallback: search by exercise name using the search endpoint
async function searchByName(name) {
  const data = await rateLimitedFetch(
    `${BASE_URL}/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`
  )
  const suggestions = data.suggestions || []
  if (!suggestions.length) return []

  const baseId = suggestions[0].data?.base_id || suggestions[0].data?.id
  if (!baseId) {
    // Use image directly from suggestion if available
    const img = suggestions[0].data?.image
    return img ? [img] : []
  }
  return fetchByBaseId(baseId)
}

export async function fetchExerciseMedia(wgerName, wgerId = null) {
  const cacheKey = `media3_${wgerId ?? wgerName.toLowerCase().replace(/\s+/g, '_')}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  let images = []

  // Method 1: direct ID (most reliable)
  if (wgerId) {
    try {
      images = await fetchByBaseId(wgerId)
    } catch { /* fall through */ }
  }

  // Method 2: search by name
  if (!images.length) {
    try {
      images = await searchByName(wgerName)
    } catch { /* ignore */ }
  }

  const result = { images, video: null }
  setCache(cacheKey, result)
  return result
}

export function clearWgerCache() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_PREFIX))
    .forEach(k => localStorage.removeItem(k))
}
