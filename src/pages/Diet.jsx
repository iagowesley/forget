import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import useAuthStore from '../store/authStore'
import { getDiet, saveDiet } from '../lib/storage'
import { Leaf, Zap, ChevronRight, Lock, CheckCircle, AlertCircle, Download } from 'lucide-react'

const GOALS = [
  { id: 'lose_fat', label: 'Perda de Gordura', desc: 'Déficit calórico, preservar músculo', emoji: '🔥' },
  { id: 'gain_muscle', label: 'Ganho de Massa', desc: 'Superávit calórico, maximizar hipertrofia', emoji: '💪' },
  { id: 'recomposition', label: 'Recomposição', desc: 'Perder gordura e ganhar músculo simultaneamente', emoji: '⚡' },
  { id: 'maintain', label: 'Manutenção', desc: 'Manter o peso e desempenho atual', emoji: '🎯' },
]

const TIPS = [
  { title: 'Proteína é prioridade', body: 'Consuma entre 1,6–2,2g de proteína por kg de peso corporal. É o macronutriente mais importante para preservar e construir músculo.', emoji: '🥩' },
  { title: 'Timing pré-treino', body: 'Coma uma refeição rica em carboidratos e proteínas 1–2h antes do treino. Evite gorduras em excesso que retardam a digestão.', emoji: '⏰' },
  { title: 'Janela pós-treino', body: 'Consuma proteína + carboidratos em até 30–60 min após o treino para maximizar a síntese proteica e repor glicogênio.', emoji: '🔄' },
  { title: 'Hidratação', body: 'Beba no mínimo 35ml de água por kg de peso. No dia de treino, adicione +500ml. A desidratação reduz a força em até 10%.', emoji: '💧' },
  { title: 'Carboidratos são aliados', body: 'Não elimine carbs — eles são o combustível do treino. Dê preferência a fontes complexas: arroz, batata-doce, aveia, frutas.', emoji: '🍚' },
  { title: 'Consistência > Perfeição', body: 'Seguir 80% do plano de forma consistente é muito melhor que 100% por 2 semanas e abandonar. Crie hábitos sustentáveis.', emoji: '📅' },
]

// Renders inline **bold** within a text string
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderDiet(text) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()

    if (!trimmed) return <div key={i} style={{ height: 6 }} />

    // Section header: ## Title
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--accent)',
          marginTop: 24,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: '1px solid rgba(200,255,0,0.18)',
        }}>
          {trimmed.slice(3)}
        </h2>
      )
    }

    // Sub-header: ### Title
    if (trimmed.startsWith('### ')) {
      return (
        <p key={i} style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginTop: 10,
          marginBottom: 4,
        }}>
          {trimmed.slice(4)}
        </p>
      )
    }

    // Day header: **Segunda-feira** (Dia de treino) — bold line with optional trailing text
    if (trimmed.startsWith('**')) {
      return (
        <div key={i} style={{
          background: 'rgba(200,255,0,0.06)',
          border: '1px solid rgba(200,255,0,0.18)',
          borderRadius: 8,
          padding: '8px 12px',
          marginTop: 16,
          marginBottom: 6,
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--accent)',
            margin: 0,
          }}>
            {renderInline(trimmed)}
          </p>
        </div>
      )
    }

    // Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-•] /, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5, paddingLeft: 4 }}>
          <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 4, flexShrink: 0 }}>▸</span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
            {renderInline(content)}
          </p>
        </div>
      )
    }

    // Numbered list: 1. item
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^\d+/)[0]
      const content = trimmed.replace(/^\d+\.\s/, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5, paddingLeft: 4 }}>
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, marginTop: 2, flexShrink: 0, minWidth: 18 }}>{num}.</span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
            {renderInline(content)}
          </p>
        </div>
      )
    }

    // Meal label line starting with emoji (☀️ Café da manhã:)
    if (/^\p{Emoji}/u.test(trimmed)) {
      return (
        <p key={i} style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          marginTop: 8,
          marginBottom: 3,
        }}>
          {renderInline(trimmed)}
        </p>
      )
    }

    return (
      <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 2 }}>
        {renderInline(trimmed)}
      </p>
    )
  })
}

function openPDF(dietText, goals, generatedAt, profile) {
  const goalsLabel = goals?.length > 0
    ? goals.map(id => GOALS.find(g => g.id === id)?.label).filter(Boolean).join(' · ')
    : 'Plano personalizado'

  const date = generatedAt
    ? new Date(generatedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('pt-BR')

  const bodyHtml = dietText.split('\n').map(line => {
    if (!line.trim()) return '<br>'
    if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`
    if (line.startsWith('**') && line.endsWith('**')) return `<h3>${line.replace(/\*\*/g, '')}</h3>`
    if (line.startsWith('- ') || line.startsWith('• ')) return `<li>${line.replace(/^[-•] /, '')}</li>`
    return `<p>${line}</p>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Plano de Dieta — FORGEfit</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px 24px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 12px; }
    .meta { background: #f5f5f5; border-radius: 8px; padding: 12px 16px; margin-bottom: 28px; font-size: 13px; color: #444; line-height: 1.9; }
    .accent { color: #5a8500; font-weight: 700; }
    h2 { font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 2px solid #c8ff00; color: #111; }
    h3 { font-size: 13px; font-weight: 700; margin-top: 12px; margin-bottom: 4px; color: #333; }
    p { font-size: 13px; color: #444; line-height: 1.7; margin-bottom: 3px; }
    li { font-size: 13px; color: #444; line-height: 1.7; margin-left: 18px; margin-bottom: 3px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>⚡ Plano de Dieta Personalizado</h1>
  <div class="subtitle">FORGEfit — Gerado por Inteligência Artificial</div>
  <div class="meta">
    <span class="accent">Objetivo:</span> ${goalsLabel}<br>
    <span class="accent">Gerado em:</span> ${date}
    ${profile ? `<br><span class="accent">Atleta:</span> ${profile.username || 'Usuário'} · ${profile.weight_kg}kg · ${profile.height_cm}cm` : ''}
  </div>
  ${bodyHtml}
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

export default function Diet() {
  const { user, profile, saveProfile } = useAuthStore()
  const userId = user?.id

  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('tips')
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingDiet, setStreamingDiet] = useState('')
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

  useEffect(() => {
    if (!profile) return
    if (result) return

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

  const handleGenerate = async () => {
    if (!profile) { setError('Perfil não carregado'); return }
    if (goals.length === 0) { setError('Selecione pelo menos um objetivo'); return }
    setLoading(true)
    setIsStreaming(false)
    setStreamingDiet('')
    setError('')

    try {
      const res = await fetch('/.netlify/functions/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, goals }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Erro ${res.status}` }))
        throw new Error(err.error || 'Erro ao gerar dieta')
      }

      setLoading(false)
      setIsStreaming(true)
      setTab('plan')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          // skip event: lines and empty lines
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          // skip empty, [DONE], and anything that isn't JSON
          if (!data || data === '[DONE]' || !data.startsWith('{')) continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              fullText += parsed.delta.text
              setStreamingDiet(fullText)
            }
          } catch {
            // ignore malformed lines
          }
        }
      }

      setIsStreaming(false)

      const generatedAt = new Date().toISOString()
      const goalsJson = JSON.stringify(goals)
      const entry = { diet: fullText, goals, generatedAt }

      await saveProfile({
        diet_plan: fullText,
        diet_goal: goalsJson,
        diet_generated_at: generatedAt,
      })

      if (userId) saveDiet(userId, fullText, goalsJson)
      setResult(entry)
    } catch (e) {
      setError(e.message)
      setLoading(false)
      setIsStreaming(false)
    }
  }

  const alreadyGenerated = !!result

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
            {/* Generation form */}
            {!alreadyGenerated && !isStreaming && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</span>
                      Conectando com a IA...
                    </>
                  ) : (
                    <>
                      <Leaf size={20} />
                      Gerar Minha Dieta
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Streaming in progress */}
            {isStreaming && (
              <div>
                <div style={{
                  background: 'rgba(200,255,0,0.06)',
                  border: '1px solid rgba(200,255,0,0.2)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block', fontSize: 18 }}>⚡</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Gerando seu plano...</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>A IA está montando seu plano personalizado</p>
                  </div>
                </div>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '16px',
                }}>
                  {renderDiet(streamingDiet)}
                  <span style={{ animation: 'blink 1s step-end infinite', color: 'var(--accent)', fontWeight: 700 }}>|</span>
                </div>
              </div>
            )}

            {/* Diet already generated */}
            {alreadyGenerated && !isStreaming && (
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
                  marginBottom: 12,
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

                {/* PDF download button */}
                <button
                  onClick={() => openPDF(result.diet, result.goals, result.generatedAt, profile)}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 16,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <Download size={16} />
                  Baixar PDF / Imprimir
                </button>

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
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </>
  )
}
