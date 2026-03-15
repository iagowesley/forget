import { useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import ProgressChart from '../components/progress/ProgressChart'
import { getHistory, getStreak, getWeightHistory, logBodyWeight, getDateKey } from '../lib/storage'
import { TrendingUp, Flame, Target, Activity, ChevronDown, ChevronUp, Award, Scale } from 'lucide-react'

function buildExerciseProgress(history) {
  const exerciseData = {}

  history.forEach(({ dateKey, session }) => {
    if (!session) return
    ;(session.exercises || []).forEach(ex => {
      if (!exerciseData[ex.id]) {
        exerciseData[ex.id] = { name: ex.name, sessions: [] }
      }

      const completedSets = ex.sets.filter(s => s.completed)
      if (!completedSets.length) return

      const maxWeight = completedSets
        .filter(s => s.weightKg != null)
        .reduce((max, s) => Math.max(max, s.weightKg), 0)

      const totalVolume = completedSets.reduce((acc, s) => {
        if (!s.weightKg) return acc
        return acc + s.weightKg * (s.actualReps || s.plannedRepsMax || 0)
      }, 0)

      const totalReps = completedSets.reduce((acc, s) =>
        acc + (s.actualReps || s.plannedRepsMax || 0), 0)

      const date = new Date(dateKey + 'T00:00:00')
      exerciseData[ex.id].sessions.push({
        dateKey,
        date: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        dateFull: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
        maxWeight,
        totalVolume: Math.round(totalVolume),
        totalReps,
        sets: completedSets.map(s => ({
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.actualReps || s.plannedRepsMax,
          volume: s.weightKg ? Math.round(s.weightKg * (s.actualReps || s.plannedRepsMax || 0)) : 0,
        })),
      })
    })
  })

  Object.values(exerciseData).forEach(ex => {
    ex.sessions.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    ex.chartData = ex.sessions
      .filter(s => s.maxWeight > 0)
      .map(s => ({ date: s.date, weight: s.maxWeight, volume: s.totalVolume, dateKey: s.dateKey }))
  })

  return exerciseData
}

function SessionRow({ session, isLatest, prevSession }) {
  const [open, setOpen] = useState(false)

  const weightDiff = prevSession && session.maxWeight > 0 && prevSession.maxWeight > 0
    ? session.maxWeight - prevSession.maxWeight : null
  const volumeDiff = prevSession && session.totalVolume > 0 && prevSession.totalVolume > 0
    ? session.totalVolume - prevSession.totalVolume : null

  return (
    <div style={{
      border: `1px solid ${isLatest ? 'rgba(200,255,0,0.3)' : 'var(--border)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: isLatest ? 'rgba(200,255,0,0.05)' : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          minHeight: 44,
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: isLatest ? 'var(--accent)' : 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              {session.dateFull}
            </span>
            {isLatest && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                background: 'rgba(200,255,0,0.15)',
                color: 'var(--accent)',
                borderRadius: 999,
                padding: '2px 8px',
              }}>
                ÚLTIMO
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {session.maxWeight > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {session.maxWeight}kg max
                {weightDiff !== null && (
                  <span style={{ color: weightDiff >= 0 ? 'var(--success)' : 'var(--danger)', marginLeft: 4 }}>
                    {weightDiff >= 0 ? '+' : ''}{weightDiff}kg
                  </span>
                )}
              </span>
            )}
            {session.totalVolume > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {session.totalVolume}kg vol
                {volumeDiff !== null && (
                  <span style={{ color: volumeDiff >= 0 ? 'var(--success)' : 'var(--danger)', marginLeft: 4 }}>
                    {volumeDiff >= 0 ? '+' : ''}{volumeDiff}
                  </span>
                )}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {session.sets.length} séries · {session.totalReps} reps
            </span>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', background: 'var(--bg-card)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 1fr 1fr',
            gap: 4,
            marginTop: 8,
          }}>
            {['#', 'Peso', 'Reps', 'Volume'].map(h => (
              <div key={h} style={{ fontSize: 11, color: 'var(--text-disabled)', fontWeight: 600, paddingBottom: 6 }}>
                {h}
              </div>
            ))}
            {session.sets.map(s => (
              <>
                <div key={`n_${s.setNumber}`} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.setNumber}</div>
                <div key={`w_${s.setNumber}`} style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {s.weightKg != null ? `${s.weightKg}kg` : '—'}
                </div>
                <div key={`r_${s.setNumber}`} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {s.reps ?? '—'}
                </div>
                <div key={`v_${s.setNumber}`} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {s.volume > 0 ? `${s.volume}kg` : '—'}
                </div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseDetail({ exercise }) {
  const { sessions, chartData } = exercise

  const best = sessions.reduce((max, s) => s.maxWeight > (max?.maxWeight ?? 0) ? s : max, null)
  const latest = sessions[sessions.length - 1]
  const prev = sessions[sessions.length - 2]

  return (
    <div>
      {/* Personal record */}
      {best && best.maxWeight > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(200,255,0,0.06)',
          border: '1px solid rgba(200,255,0,0.2)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 16,
        }}>
          <Award size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recorde pessoal</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
              {best.maxWeight}kg
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 8 }}>
                em {best.dateFull}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 12,
          padding: '14px 12px 8px',
          marginBottom: 16,
        }}>
          <ProgressChart data={chartData} title="Evolução de carga (kg)" />
        </div>
      )}

      {/* Sessions */}
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
      }}>
        Histórico de sessões
      </div>

      {[...sessions].reverse().map((session, i) => {
        const idx = sessions.length - 1 - i
        return (
          <SessionRow
            key={session.dateKey}
            session={session}
            isLatest={i === 0}
            prevSession={idx > 0 ? sessions[idx - 1] : null}
          />
        )
      })}
    </div>
  )
}

function WeightTracker() {
  const today = getDateKey()
  const [weightHistory, setWeightHistory] = useState(() => getWeightHistory())
  const [inputVal, setInputVal] = useState(() => {
    const h = getWeightHistory()
    const todayEntry = h.find(e => e.date === today)
    return todayEntry ? String(todayEntry.weight) : ''
  })

  const handleLog = () => {
    const w = parseFloat(inputVal)
    if (!w || w < 20 || w > 500) return
    logBodyWeight(today, w)
    setWeightHistory(getWeightHistory())
  }

  const recent = [...weightHistory].slice(-10).reverse()
  const first = weightHistory[0]
  const last = weightHistory[weightHistory.length - 1]
  const diff = (first && last && first !== last) ? (last.weight - first.weight).toFixed(1) : null

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '16px 20px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Scale size={16} color="var(--accent)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Peso Corporal
        </h3>
        {diff !== null && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 700,
            color: parseFloat(diff) > 0 ? '#F59E0B' : 'var(--success)',
          }}>
            {parseFloat(diff) > 0 ? '+' : ''}{diff}kg total
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="number"
          inputMode="decimal"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Seu peso hoje (kg)"
          style={{
            flex: 1, height: 44, background: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: 10,
            color: 'var(--text-primary)', fontSize: 15, padding: '0 14px',
            outline: 'none', fontFamily: 'var(--font-body)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />
        <button
          onClick={handleLog}
          style={{
            height: 44, padding: '0 18px', borderRadius: 10,
            background: 'var(--accent)', border: 'none', color: '#000',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Registrar
        </button>
      </div>
      {recent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recent.map((entry, i) => {
            const prev = recent[i + 1]
            const delta = prev ? (entry.weight - prev.weight).toFixed(1) : null
            return (
              <div key={entry.date} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', background: i === 0 ? 'rgba(200,255,0,0.06)' : 'var(--bg-surface)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {delta !== null && delta !== '0.0' && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: parseFloat(delta) > 0 ? '#F59E0B' : 'var(--success)' }}>
                      {parseFloat(delta) > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {entry.weight}kg
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Progress() {
  const history = useMemo(() => getHistory(90), [])
  const streak = getStreak()
  const exerciseProgress = useMemo(() => buildExerciseProgress(history), [history])
  const [tab, setTab] = useState('summary')
  const [selectedExercise, setSelectedExercise] = useState(null)

  const exercisesWithData = Object.entries(exerciseProgress)
    .filter(([, v]) => v.sessions.length >= 1)
    .sort((a, b) => b[1].sessions.length - a[1].sessions.length)

  const exercisesForChart = exercisesWithData.filter(([, v]) => v.chartData.length >= 2)

  const currentExerciseId = selectedExercise || exercisesWithData[0]?.[0]
  const currentExercise = exerciseProgress[currentExerciseId]

  const weeklyStats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14)

    const thisWeek = history.filter(({ dateKey }) => new Date(dateKey) >= weekAgo)
    const lastWeek = history.filter(({ dateKey }) => {
      const d = new Date(dateKey)
      return d >= twoWeeksAgo && d < weekAgo
    })

    const calcVolume = (entries) => entries.reduce((acc, { session }) => {
      if (!session) return acc
      return acc + (session.exercises || []).reduce((a, ex) =>
        a + ex.sets.reduce((s, set) => {
          if (!set.completed || !set.weightKg) return s
          return s + set.weightKg * (set.actualReps || set.plannedRepsMax)
        }, 0), 0)
    }, 0)

    return {
      thisWeekSessions: thisWeek.filter(h => h.session?.completed).length,
      lastWeekSessions: lastWeek.filter(h => h.session?.completed).length,
      thisWeekVolume: Math.round(calcVolume(thisWeek)),
      lastWeekVolume: Math.round(calcVolume(lastWeek)),
    }
  }, [history])

  const volumeDiff = weeklyStats.thisWeekVolume - weeklyStats.lastWeekVolume
  const sessionDiff = weeklyStats.thisWeekSessions - weeklyStats.lastWeekSessions

  return (
    <>
      <Header title="Evolução" />
      <div style={{ padding: '16px 20px 100px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['summary', 'Resumo'], ['exercises', 'Por Exercício']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                background: tab === key ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${tab === key ? 'var(--accent)' : 'var(--border)'}`,
                color: tab === key ? '#000' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: tab === key ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* SUMMARY TAB */}
        {tab === 'summary' && (
          <>
            {streak.current > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
              }}>
                <Flame size={32} color="#F59E0B" />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>
                    {streak.current} dias seguidos
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Recorde: {streak.longest} dias
                  </div>
                </div>
              </div>
            )}

            <WeightTracker />

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 20,
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Esta Semana vs Anterior
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Treinos', icon: Target, current: weeklyStats.thisWeekSessions, diff: sessionDiff, suffix: '' },
                  { label: 'Volume', icon: Activity, current: weeklyStats.thisWeekVolume, diff: volumeDiff, suffix: 'kg' },
                ].map(({ label, icon: Icon, current, diff, suffix }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Icon size={14} color="var(--text-secondary)" />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {current}{suffix}
                    </div>
                    {diff !== 0 && (
                      <div style={{ fontSize: 12, color: diff > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}{suffix} vs semana ant.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {exercisesForChart.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '32px 20px',
                textAlign: 'center',
              }}>
                <TrendingUp size={40} color="var(--text-disabled)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Sem dados suficientes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Registre peso nos treinos para ver gráficos de evolução.
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  Evolução de Carga
                </h3>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
                  {exercisesForChart.map(([id, ex]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedExercise(id)}
                      style={{
                        flexShrink: 0,
                        padding: '6px 14px',
                        borderRadius: 999,
                        background: currentExerciseId === id ? 'var(--accent)' : 'var(--bg-surface)',
                        border: `1px solid ${currentExerciseId === id ? 'var(--accent)' : 'var(--border)'}`,
                        color: currentExerciseId === id ? '#000' : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: currentExerciseId === id ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        minHeight: 36,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ex.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  ))}
                </div>
                {currentExercise && <ProgressChart data={currentExercise.chartData} title={currentExercise.name} />}
              </div>
            )}
          </>
        )}

        {/* EXERCISES TAB */}
        {tab === 'exercises' && (
          <>
            {exercisesWithData.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '32px 20px',
                textAlign: 'center',
              }}>
                <TrendingUp size={40} color="var(--text-disabled)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Nenhum dado salvo</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Complete treinos para ver o histórico por exercício.
                </p>
              </div>
            ) : (
              <>
                {/* Exercise picker */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 12,
                  marginBottom: 16,
                }}>
                  {exercisesWithData.map(([id, ex]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedExercise(id)}
                      style={{
                        flexShrink: 0,
                        padding: '6px 14px',
                        borderRadius: 999,
                        background: currentExerciseId === id ? 'var(--accent)' : 'var(--bg-card)',
                        border: `1px solid ${currentExerciseId === id ? 'var(--accent)' : 'var(--border)'}`,
                        color: currentExerciseId === id ? '#000' : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: currentExerciseId === id ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        minHeight: 36,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ex.name.split(' ').slice(0, 2).join(' ')}
                      <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>×{ex.sessions.length}</span>
                    </button>
                  ))}
                </div>

                {currentExercise && (
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '16px 16px',
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 17,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 16,
                    }}>
                      {currentExercise.name}
                    </h3>
                    <ExerciseDetail exercise={currentExercise} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
