import { getDateKey } from '../lib/storage'
import { X, Printer, Download } from 'lucide-react'

function getWeekSessions(workoutPlan) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=sun
  const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

  return DAY_ORDER.map(dayKey => {
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(dayKey)
    const diff = dayIndex - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    const date = new Date(today)
    date.setDate(today.getDate() + diff)
    const dateKey = getDateKey(date)
    const raw = localStorage.getItem(`forgefit_session_${dateKey}`)
    const session = raw ? JSON.parse(raw) : null
    const plan = workoutPlan[dayKey]
    return { dayKey, plan, dateKey, session, date }
  })
}

function formatDuration(start, end) {
  if (!start || !end) return null
  const ms = new Date(end) - new Date(start)
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}min` : `${m}min`
}

export function generateReportHTML(sessions, profile) {
  const now = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  let totalVolume = 0
  let totalSets = 0
  let totalCompletedSets = 0

  const dayRows = sessions.map(({ plan, session, date }) => {
    if (!session) {
      return `
        <tr>
          <td>${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</td>
          <td>${plan?.type || '—'}</td>
          <td colspan="4" style="color:#666;text-align:center;">Não realizado</td>
        </tr>`
    }

    const completedEx = (session.exercises || []).filter(e => e.completed).length
    const totalEx = (session.exercises || []).length
    const volume = (session.exercises || []).reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) => {
        totalSets++
        if (set.completed) totalCompletedSets++
        if (!set.completed || !set.weightKg) return s
        return s + set.weightKg * (set.actualReps || set.plannedRepsMax || 0)
      }, 0), 0)
    totalVolume += Math.round(volume)
    const duration = formatDuration(session.startedAt, session.finishedAt)

    return `
      <tr>
        <td>${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</td>
        <td>${session.type}</td>
        <td style="text-align:center">${completedEx}/${totalEx}</td>
        <td style="text-align:center">${Math.round(volume).toLocaleString('pt-BR')} kg</td>
        <td style="text-align:center">${duration || '—'}</td>
        <td style="text-align:center">${session.completed ? '✓' : '—'}</td>
      </tr>`
  }).join('')

  const exerciseDetails = sessions.map(({ plan, session, date }) => {
    if (!session || !session.startedAt) return ''
    const exRows = (session.exercises || []).map(ex => {
      const sets = ex.sets.filter(s => s.completed)
      if (!sets.length) return ''
      const maxWeight = sets.filter(s => s.weightKg).reduce((m, s) => Math.max(m, s.weightKg), 0)
      const setList = sets.map(s =>
        `<span style="background:#1a1a1a;padding:2px 8px;border-radius:4px;margin-right:4px;font-size:11px">${s.weightKg ? s.weightKg + 'kg' : 'PC'} × ${s.actualReps || s.plannedRepsMax} reps</span>`
      ).join('')
      return `
        <tr>
          <td>${ex.name}</td>
          <td>${ex.completed ? '<span style="color:#C8FF00">✓</span>' : '—'}</td>
          <td>${maxWeight ? maxWeight + 'kg' : '—'}</td>
          <td>${setList}</td>
        </tr>`
    }).filter(Boolean).join('')

    if (!exRows) return ''
    return `
      <h3 style="margin:20px 0 8px;color:#C8FF00;font-size:14px">
        ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })} — ${session.type}
      </h3>
      <table>
        <thead><tr><th>Exercício</th><th>Concluído</th><th>Carga Máx.</th><th>Séries</th></tr></thead>
        <tbody>${exRows}</tbody>
      </table>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Semanal — FORGEfit</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 32px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; color: #C8FF00; margin-bottom: 4px; letter-spacing: -0.5px; }
    h2 { font-size: 16px; color: #888; font-weight: 400; margin-bottom: 24px; }
    .badge { display: inline-block; background: rgba(200,255,0,0.1); border: 1px solid rgba(200,255,0,0.3); border-radius: 999px; padding: 4px 12px; font-size: 12px; color: #C8FF00; font-weight: 600; margin-right: 8px; }
    .summary { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
    .stat { background: #111; border: 1px solid #222; border-radius: 12px; padding: 16px 20px; flex: 1; min-width: 140px; }
    .stat .value { font-size: 28px; font-weight: 700; color: #C8FF00; }
    .stat .label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; padding: 8px 12px; border-bottom: 1px solid #222; }
    td { padding: 10px 12px; border-bottom: 1px solid #1a1a1a; font-size: 13px; }
    tr:hover td { background: #111; }
    section { margin-bottom: 32px; }
    section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #555; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px; margin-bottom: 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; font-size: 11px; color: #444; text-align: center; }
    @media print {
      body { background: white; color: #111; padding: 20px; }
      .stat { background: #f8f8f8; border-color: #ddd; }
      .stat .value { color: #000; }
      h1 { color: #000; }
      .badge { background: #f0f0f0; border-color: #ccc; color: #333; }
      td { border-color: #eee; }
      table { border: 1px solid #eee; }
      th { color: #999; border-color: #eee; }
      section h2 { color: #999; border-color: #eee; }
    }
  </style>
</head>
<body>
  <h1>⚡ FORGEfit</h1>
  <h2>Relatório Semanal — Gerado em ${now}</h2>
  ${profile?.username ? `<span class="badge">${profile.username}</span>` : ''}
  ${profile?.weight_kg ? `<span class="badge">${profile.weight_kg}kg</span>` : ''}
  ${profile?.experience ? `<span class="badge">${{ beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }[profile.experience] || ''}</span>` : ''}

  <div class="summary">
    <div class="stat"><div class="value">${sessions.filter(s => s.session?.completed).length}/5</div><div class="label">Treinos concluídos</div></div>
    <div class="stat"><div class="value">${totalVolume.toLocaleString('pt-BR')}</div><div class="label">Volume total (kg)</div></div>
    <div class="stat"><div class="value">${totalCompletedSets}</div><div class="label">Séries completas</div></div>
    <div class="stat"><div class="value">${totalSets > 0 ? Math.round((totalCompletedSets / totalSets) * 100) : 0}%</div><div class="label">Taxa de conclusão</div></div>
  </div>

  <section>
    <h2>Resumo da Semana</h2>
    <table>
      <thead><tr><th>Dia</th><th>Treino</th><th>Exercícios</th><th>Volume</th><th>Duração</th><th>Status</th></tr></thead>
      <tbody>${dayRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Detalhes por Sessão</h2>
    ${exerciseDetails || '<p style="color:#555;padding:16px 0">Nenhuma sessão iniciada esta semana.</p>'}
  </section>

  <div class="footer">Gerado pelo FORGEfit · Semana de ${sessions[0]?.date?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} a ${sessions[4]?.date?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
  <script>window.print()</script>
</body>
</html>`
}

export default function WeekReport({ onClose, workoutPlan, profile }) {
  const sessions = getWeekSessions(workoutPlan)

  const handleExport = () => {
    const html = generateReportHTML(sessions, profile)
    const win = window.open('', '_blank')
    if (!win) { alert('Permita pop-ups para exportar o relatório'); return }
    win.document.write(html)
    win.document.close()
  }

  const completedCount = sessions.filter(s => s.session?.completed).length
  const totalVolume = sessions.reduce((acc, { session }) => {
    if (!session) return acc
    return acc + (session.exercises || []).reduce((a, ex) =>
      a + ex.sets.reduce((s, set) => {
        if (!set.completed || !set.weightKg) return s
        return s + set.weightKg * (set.actualReps || set.plannedRepsMax || 0)
      }, 0), 0)
  }, 0)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column', zIndex: 200,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Relatório da Semana
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {sessions[0]?.date?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — {sessions[4]?.date?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <X size={22} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { value: `${completedCount}/5`, label: 'Treinos feitos' },
            { value: `${Math.round(totalVolume).toLocaleString('pt-BR')} kg`, label: 'Volume total' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Session list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {sessions.map(({ dayKey, plan, session, date }) => {
            const done = session?.completed
            const started = !!session?.startedAt
            const exDone = (session?.exercises || []).filter(e => e.completed).length
            const exTotal = plan?.exercises?.length || 0
            const vol = (session?.exercises || []).reduce((acc, ex) =>
              acc + ex.sets.reduce((s, set) => (!set.completed || !set.weightKg) ? s : s + set.weightKg * (set.actualReps || set.plannedRepsMax || 0), 0), 0)

            return (
              <div key={dayKey} style={{
                background: done ? 'rgba(200,255,0,0.05)' : 'var(--bg-card)',
                border: `1px solid ${done ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: done ? 'rgba(200,255,0,0.15)' : 'var(--bg-surface)',
                  border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {done ? '✓' : plan?.emoji || '○'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: done ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {plan?.type} {started ? `· ${exDone}/${exTotal} exercícios` : '· Não iniciado'}
                    {vol > 0 ? ` · ${Math.round(vol).toLocaleString('pt-BR')}kg` : ''}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 8px',
                  background: done ? 'rgba(200,255,0,0.1)' : 'var(--bg-surface)',
                  color: done ? 'var(--accent)' : 'var(--text-disabled)',
                }}>
                  {done ? 'Concluído' : started ? 'Parcial' : 'Pendente'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <button
          onClick={handleExport}
          style={{
            width: '100%', height: 52, borderRadius: 12,
            background: 'var(--accent)', border: 'none', color: '#000',
            cursor: 'pointer', fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Printer size={18} />
          Exportar / Imprimir PDF
        </button>
      </div>
    </div>
  )
}
