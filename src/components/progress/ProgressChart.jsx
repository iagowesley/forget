import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
    }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>
          {p.value}kg
        </p>
      ))}
    </div>
  )
}

export default function ProgressChart({ data, title }) {
  if (!data || data.length < 2) {
    return (
      <div style={{
        padding: '32px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: 14,
      }}>
        Registre ao menos 2 treinos com peso para ver a evolução
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 16,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--accent)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--accent)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
