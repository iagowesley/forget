import { useState, useEffect } from 'react'
import { fetchExerciseMedia } from '../lib/wgerApi'

export function useWgerMedia(wgerName) {
  const [media, setMedia] = useState({ images: [], video: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wgerName) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchExerciseMedia(wgerName).then(result => {
      if (!cancelled) {
        setMedia(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [wgerName])

  return { ...media, loading }
}
