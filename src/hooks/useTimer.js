import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds = 60) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Create audio context for beep
  const playBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.8)
    } catch { /* ignore */ }
  }, [])

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((seconds) => {
    clear()
    setTimeLeft(seconds ?? initialSeconds)
    setIsRunning(true)
    setIsFinished(false)
  }, [clear, initialSeconds])

  const pause = useCallback(() => {
    clear()
    setIsRunning(false)
  }, [clear])

  const resume = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    clear()
    setIsRunning(false)
    setTimeLeft(0)
    setIsFinished(false)
  }, [clear])

  const skip = useCallback(() => {
    clear()
    setIsRunning(false)
    setTimeLeft(0)
    setIsFinished(false)
  }, [clear])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          setIsFinished(true)
          playBeep()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, playBeep])

  const progress = timeLeft > 0 ? timeLeft / (initialSeconds || 1) : 0

  return { timeLeft, isRunning, isFinished, start, pause, resume, stop, skip, progress }
}
