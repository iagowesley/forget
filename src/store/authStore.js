import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { loadAllSessions, loadStreak, loadWeightHistory } from '../lib/db'
import { saveSession, setItem } from '../lib/storage'

async function syncFromCloud(userId) {
  try {
    const [sessions, streak, weightHistory] = await Promise.all([
      loadAllSessions(userId, 90),
      loadStreak(userId),
      loadWeightHistory(userId),
    ])

    // Populate localStorage with Supabase data
    for (const session of sessions) {
      saveSession(session.dateKey, session)
    }
    if (streak) {
      setItem('streak', streak)
    }
    if (weightHistory && weightHistory.length > 0) {
      setItem('weight_history', weightHistory)
    }
  } catch (err) {
    console.error('[authStore] syncFromCloud:', err)
  }
}

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: () => {
    // Check existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      set({ user })
      if (user) {
        await get().loadProfile(user.id)
        await syncFromCloud(user.id)
      }
      set({ loading: false })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      set({ user })
      if (user) {
        await get().loadProfile(user.id)
        syncFromCloud(user.id) // fire and forget after initial login
      } else {
        set({ profile: null })
      }
    })

    return () => subscription.unsubscribe()
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  loadProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      set({ profile: data })
    } else {
      set({ profile: null })
    }
  },

  saveProfile: async (profileData) => {
    const { user } = get()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    set({ profile: data })
    return data
  },
}))

export default useAuthStore
