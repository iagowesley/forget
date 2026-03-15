import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import useAuthStore from '../store/authStore'
import { getDiet, saveDiet } from '../lib/storage'
import { Leaf, Zap, ChevronRight, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const GOALS = [
  { id: 'lose_fat',      label: 'Perda de Gordura',    desc: 'Déficit calórico, preservar músculo', emoji: '🔥' },
  { id: 'gain_muscle',   label: 'Ganho de Massa',       desc: 'Superávit calórico, maximizar hipertrofia', emoji: '💪' },
  { id: 'recomposition', label: 'Recomposição',         desc: 'Perder gordura e ganhar músculo simultaneamente', emoji: '⚡' },
  { id: 'maintain',      label: 'Manutenção',           desc: 'Manter o peso e desempenho atual', emoji: '🎯' },
]

const TIPS = [
  { title: 'Proteína é prioridade', body: 'Consuma entre 1,6–2,2g de proteína por kg de peso corporal. É o macronutriente mais importante para preservar e construir músculo.', emoji: '🥩' },
  { title: 'Timing pré-treino', body: 'Coma uma refeição rica em carboidratos e proteínas 1–2h antes do treino. Evite gorduras em excesso que retardam a digestão.', emoji: '⏰' },
  { title: 'Janela pós-treino', body: 'Consuma proteína + carboidratos em até 30–60 min após o treino para maximizar a síntese proteica e repor glicogênio.', emoji: '🔄' },
  { title: 'Hidratação', body: 'Beba no mínimo 35ml de água por kg de peso. No dia de treino, adicione +500ml. A desidratação reduz a força em até 10%.', emoji: '💧' },
  { title: 'Carboidratos são aliados', body: 'Não elimine carbs — eles são o combustível do treino. Dê preferência a fontes complexas: arroz, batata-doce, aveia, frutas.', emoji: '🍚' },
  { title: 'Consistência > Perfeição', body: 'Seguir 80% do plano de forma consistente é muito melhor que 100% por 2 semanas e abandonar. Crie hábitos sustentáveis.', emoji: '📅' },
]

function renderDiet(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--accent)',
          marginTop: 20,
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: '1px solid rgba(200,255,0,0.15)',
        }}>
          {line.replace('## ', '')}
        </h2>
      )
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginTop: 10,
          marginBottom: 4,
        }}>
          {line.replace(/\*\*/g, '')}
        </p>
      )
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 3, flexShrink: 0 }}>▸</span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {line.replace(/^[-•] /, '')}
          </p>
        </div>
      )
    }
    return (
      <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 2 }}>
        {line}
      </p>
    )
  })
}

export default function Diet() {
  const { user, profile, saveProfile } = useAuthStore()
  const userId = user?.id

  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('tips')
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseGoals = (raw) => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [raw]
    }
  }

  // Load from Supabase profile (authoritative) or localStorage (cache)
  useEffect(() => {
    if (!profile) return
    if (result) return // already loaded

    if (profile.diet_plan) {
      const entry = {
        diet: profile.diet_plan,
        goals: parseGoals(profile.diet_goal),
        generatedAt: profile.diet_generated_at || new Date().toISOString(),
      }
      setResult(entry)
      setGoals(entry.goals)
      setTab('plan')
      if (userId) saveDiet(userId, profile.diet_plan, profile.diet_goal)
    } else if (userId) {
      const cached = getDiet(userId)
      if (cached) {
        const entry = { ...cached, goals: parseGoals(cached.goal) }
        setResult(entry)
        setGoals(entry.goals)
        setTab('plan')
      }
    }
  }, [profile])

  const toggleGoal = (id) => {
    setGoals(prev => {
      if (prev.includes(id)) return prev.filter(g => g !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const alreadyGenerated = !!result

  const handleGenerate = async () => {
    if (!profile) { setError('Perfil não carregado'); return }
    if (goals.length === 0) { setError('Selecione pelo menos um objetivo'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, goals }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Erro ao gerar dieta')

      const generatedAt = new Date().toISOString()
      const goalsJson = JSON.stringify(goals)
      const entry = { diet: data.diet, goals, generatedAt }

      await saveProfile({
        diet_plan: data.diet,
        diet_goal: goalsJson,
        diet_generated_at: generatedAt,
      })

      if (userId) saveDiet(userId, data.diet, goalsJson)

      setResult(entry)
      setTab('plan')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="Dieta" />
      <div style={{ padding: '16px 20px 100px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['tips', 'Dicas'], ['plan', 'Meu Plano']].map(([key, label]) => (
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

        {/* TIPS TAB */}
        {tab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'rgba(200,255,0,0.06)',
              border: '1px solid rgba(200,255,0,0.2)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 4,
            }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>
                Nutrição é 70% do resultado
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                O treino cria o estímulo. A dieta fornece o material para construir. Sem os dois, os resultados são limitados.
              </p>
            </div>
            {TIPS.map((tip, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {tip.title}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {tip.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PLAN TAB */}
        {tab === 'plan' && (
          <>
            {!alreadyGenerated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Info banner */}
                <div style={{
                  background: 'rgba(200,255,0,0.06)',
                  border: '1px solid rgba(200,255,0,0.2)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}>
                  <Lock size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
                      Geração única
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Você pode gerar seu plano de dieta personalizado <strong style={{ color: 'var(--text-primary)' }}>uma única vez</strong>. A IA vai usar seus dados físicos, nível de treino e objetivo para criar um plano completo.
                    </p>
                  </div>
                </div>

                {/* Goal selection */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Quais são seus objetivos?
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 10px',
                      background: goals.length > 0 ? 'rgba(200,255,0,0.1)' : 'var(--bg-surface)',
                      color: goals.length > 0 ? 'var(--accent)' : 'var(--text-disabled)',
                    }}>
                      {goals.length}/3
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    Selecione até 3 objetivos. A dieta será balanceada entre eles.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {GOALS.map(g => {
                      const selected = goals.includes(g.id)
                      const disabled = !selected && goals.length >= 3
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => !disabled && toggleGoal(g.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            background: selected ? 'rgba(200,255,0,0.08)' : 'var(--bg-card)',
                            border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 12,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            opacity: disabled ? 0.45 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{g.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: 14,
                              fontWeight: 600,
                              color: selected ? 'var(--accent)' : 'var(--text-primary)',
                              marginBottom: 1,
                            }}>
                              {g.label}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.desc}</p>
                          </div>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            background: selected ? 'var(--accent)' : 'var(--bg-surface)',
                            border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selected && <span style={{ fontSize: 13, color: '#000', fontWeight: 700 }}>✓</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Profile preview */}
                {profile && (
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Dados que serão usados
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        profile.weight_kg && `${profile.weight_kg}kg`,
                        profile.height_cm && `${profile.height_cm}cm`,
                        profile.birth_year && `${new Date().getFullYear() - profile.birth_year} anos`,
                        profile.gender === 'female' ? 'Feminino' : 'Masculino',
                        { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }[profile.experience],
                      ].filter(Boolean).map((item, i) => (
                        <span key={i} style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--accent)',
                          background: 'rgba(200,255,0,0.08)',
                          borderRadius: 999,
                          padding: '4px 10px',
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}>
                    <AlertCircle size={16} color="var(--danger)" />
                    <span style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading || goals.length === 0}
                  style={{
                    height: 56,
                    borderRadius: 14,
                    background: (loading || goals.length === 0) ? 'var(--bg-surface)' : 'var(--accent)',
                    border: 'none',
                    color: (loading || goals.length === 0) ? 'var(--text-disabled)' : '#000',
                    cursor: (loading || goals.length === 0) ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                      Gerando seu plano...
                    </>
                  ) : (
                    <>
                      <Leaf size={20} />
                      Gerar Minha Dieta
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                {loading && (
                  <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Isso pode levar até 30 segundos. A IA está montando seu plano personalizado...
                  </p>
                )}
              </div>
            ) : (
              /* Diet already generated */
              <div>
                {/* Header badge */}
                <div style={{
                  background: 'rgba(200,255,0,0.06)',
                  border: '1px solid rgba(200,255,0,0.2)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                }}>
                  <CheckCircle size={18} color="var(--accent)" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                      {(result.goals?.length > 0
                        ? result.goals.map(id => GOALS.find(g => g.id === id)?.label).filter(Boolean).join(' · ')
                        : GOALS.find(g => g.id === result.goal)?.label
                      ) || 'Plano personalizado'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(result.generatedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Zap size={16} color="var(--accent)" />
                </div>

                {/* Diet content */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '16px',
                }}>
                  {renderDiet(result.diet)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
