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
  } catch { /* storage full, ignore */ }
}

let lastRequestTime = 0
async function rateLimitedFetch(url) {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < 1000) {
    await new Promise(r => setTimeout(r, 1000 - elapsed))
  }
  lastRequestTime = Date.now()
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function searchExercise(name, language = 7) {
  const cacheKey = `exercise_${language}_${name.toLowerCase().replace(/\s+/g, '_')}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const data = await rateLimitedFetch(
      `${BASE_URL}/exercise/?format=json&language=${language}&name=${encodeURIComponent(name)}&limit=5`
    )
    const results = data.results || []
    setCache(cacheKey, results)
    return results
  } catch {
    return []
  }
}

export async function getExerciseImages(exerciseBaseId) {
  const cacheKey = `images_${exerciseBaseId}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const data = await rateLimitedFetch(
      `${BASE_URL}/exerciseimage/?format=json&exercise=${exerciseBaseId}&is_main=True`
    )
    const images = (data.results || []).map(img => img.image)
    setCache(cacheKey, images)
    return images
  } catch {
    return []
  }
}

export async function getExerciseVideos(exerciseBaseId) {
  const cacheKey = `videos_${exerciseBaseId}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const data = await rateLimitedFetch(
      `${BASE_URL}/video/?format=json&exercise=${exerciseBaseId}`
    )
    const videos = (data.results || []).map(v => v.video)
    setCache(cacheKey, videos)
    return videos
  } catch {
    return []
  }
}

export async function fetchExerciseMedia(wgerName) {
  const cacheKey = `media_${wgerName.toLowerCase().replace(/\s+/g, '_')}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    // Try Portuguese first, fallback to English
    let exercises = await searchExercise(wgerName, 7)
    if (!exercises.length) {
      exercises = await searchExercise(wgerName, 2)
    }

    if (!exercises.length) {
      const result = { images: [], video: null }
      setCache(cacheKey, result)
      return result
    }

    const exercise = exercises[0]
    const baseId = exercise.exercise_base || exercise.id

    const [images, videos] = await Promise.all([
      getExerciseImages(baseId),
      getExerciseVideos(baseId),
    ])

    const result = { images, video: videos[0] || null }
    setCache(cacheKey, result)
    return result
  } catch {
    return { images: [], video: null }
  }
}

export function clearWgerCache() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}
