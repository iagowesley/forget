import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { WORKOUT_PLAN, getIntensityColor } from '../lib/workoutData'
import useWorkoutStore from '../store/workoutStore'
import { useWgerMedia } from '../hooks/useWgerMedia'
import { useTimer } from '../hooks/useTimer'
import Header from '../components/layout/Header'
import SetTracker from '../components/workout/SetTracker'
import RestTimer from '../components/workout/RestTimer'
import CompletionScreen from '../components/workout/CompletionScreen'
import { Clock, Info, Dumbbell, ChevronDown, ChevronUp, Image } from 'lucide-react'

export default function ExerciseView() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dayKey = searchParams.get('day')
  const dateKey = searchParams.get('date')

  const dayPlan = WORKOUT_PLAN[dayKey]
  const exercise = dayPlan?.exercises.find(ex => ex.id === id)

  const { currentSession, completeSet, uncompleteSet, initSession } = useWorkoutStore()

  const [showInstructions, setShowInstructions] = useState(false)
  const [restDuration, setRestDuration] = useState(exercise?.restSeconds || 60)
  const [showCompletion, setShowCompletion] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [mediaTab, setMediaTab] = useState('image') // 'image' | 'video'

  const { images, video, loading: mediaLoading } = useWgerMedia(exercise?.wgerName)

  const timer = useTimer(restDuration)

  useEffect(() => {
    if (dayKey && dateKey && !currentSession) {
      initSession(dayKey, dateKey)
    }
  }, [dayKey, dateKey])

  useEffect(() => {
    if (exercise) setRestDuration(exercise.restSeconds)
  }, [exercise])

  const exerciseSession = currentSession?.exercises?.find(e => e.id === id)

  // Watch for workout completion
  useEffect(() => {
    if (currentSession?.completed) {
      setShowCompletion(true)
    }
  }, [currentSession?.completed])

  if (!exercise) {
    return (
      <>
        <Header title="Exercício" showBack />
        <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Exercício não encontrado</div>
      </>
    )
  }

  const intensityColor = getIntensityColor(exercise.intensity)

  const handleCompleteSet = (setNumber, data) => {
    completeSet(dateKey, id, setNumber, data)
    timer.start(restDuration)
  }

  const handleUncompleteSet = (setNumber) => {
    uncompleteSet(dateKey, id, setNumber)
    timer.stop()
  }

  // Get last used weight for pre-filling
  const lastWeight = exerciseSession?.sets
    ?.filter(s => s.completed && s.weightKg != null)
    ?.slice(-1)[0]?.weightKg

  const allSets = exerciseSession?.sets || []
  const allMedia = [...images]
  if (video) allMedia.push(video)

  return (
    <>
      {showCompletion && currentSession && (
        <CompletionScreen session={currentSession} dayPlan={dayPlan} />
      )}

      <Header
        title={exercise.name}
        showBack
      />

      <div style={{ padding: '0 0 120px' }}>
        {/* Media section */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {['image', 'video'].map(tab => (
              <button
                key={tab}
                onClick={() => setMediaTab(tab)}
                style={{
                  flex: 1,
                  height: 40,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${mediaTab === tab ? 'var(--accent)' : 'transparent'}`,
                  color: mediaTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab === 'image' ? 'Imagens' : 'Tutorial'}
              </button>
            ))}
          </div>

          {/* Image tab */}
          {mediaTab === 'image' && (
            <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {mediaLoading ? (
                <div style={{ color: 'var(--text-disabled)', fontSize: 14 }}>Carregando...</div>
              ) : images.length > 0 ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img
                    src={images[mediaIndex % images.length]}
                    alt={exercise.name}
                    style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  {images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setMediaIndex(i)}
                          style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: i === mediaIndex ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                            border: 'none', padding: 0, cursor: 'pointer', minHeight: 0, minWidth: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-disabled)', padding: 32 }}>
                  <Image size={48} />
                  <span style={{ fontSize: 13 }}>Sem imagem disponível</span>
                </div>
              )}
            </div>
          )}

          {/* Video tab */}
          {mediaTab === 'video' && (
            <div style={{ position: 'relative' }}>
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(exercise.wgerName + ' tutorial form')}&rel=0&modestbranding=1`}
                title={`${exercise.name} tutorial`}
                style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.wgerName + ' como fazer tutorial')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '8px 0',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                Abrir no YouTube →
              </a>
            </div>
          )}
        </div>

        {/* Exercise info */}
        <div style={{ padding: '16px 20px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: intensityColor,
              background: intensityColor + '15',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              {exercise.intensity}
            </span>
            {exercise.muscles.map(m => (
              <span key={m} style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
                borderRadius: 999,
                padding: '4px 10px',
              }}>
                {m}
              </span>
            ))}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            {exercise.name}
          </h1>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dumbbell size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {exercise.sets} séries × {exercise.repsMin}–{exercise.repsMax} reps
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {exercise.restSeconds}s descanso
              </span>
            </div>
          </div>

          {/* Instructions toggle */}
          <button
            onClick={() => setShowInstructions(p => !p)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              marginBottom: showInstructions ? 0 : 20,
              minHeight: 44,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} color="var(--accent)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>
                Como executar
              </span>
            </div>
            {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showInstructions && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '14px 14px 16px',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                {exercise.description}
              </p>
              {exercise.tips?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Dicas
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {exercise.tips.map((tip, i) => (
                      <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sets */}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 14,
          }}>
            Séries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allSets.map((set, idx) => {
              // Get last used weight from previous completed sets
              const prevWeight = allSets
                .slice(0, idx)
                .filter(s => s.completed && s.weightKg != null)
                .slice(-1)[0]?.weightKg
              return (
                <SetTracker
                  key={set.setNumber}
                  set={set}
                  exercise={exercise}
                  onComplete={handleCompleteSet}
                  onUncomplete={handleUncompleteSet}
                  lastWeight={prevWeight ?? lastWeight}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      <RestTimer
        timeLeft={timer.timeLeft}
        totalTime={restDuration}
        isRunning={timer.isRunning}
        onSkip={timer.skip}
        onPause={timer.pause}
        onResume={timer.resume}
      />
    </>
  )
}
