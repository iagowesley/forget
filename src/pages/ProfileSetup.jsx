import { useState, useMemo } from 'react'
import { User, Scale, Ruler, Trophy, ChevronRight, Zap, Check } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { generateStartingWeights, getPreviewExercises, getUnitLabel } from '../lib/workoutGenerator'

const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner',
    label: 'Iniciante',
    desc: 'Menos de 1 ano de treino consistente',
    emoji: '🌱',
  },
  {
    id: 'intermediate',
    label: 'Intermediário',
    desc: '1–3 anos, progressão ainda constante',
    emoji: '💪',
  },
  {
    id: 'advanced',
    label: 'Avançado',
    desc: 'Mais de 3 anos, progressão mais lenta',
    emoji: '🔥',
  },
]

function calcBMI(weight, height) {
  if (!weight || !height) return null
  const h = height / 100
  return (weight / (h * h)).toFixed(1)
}

function bmiLabel(bmi) {
  if (!bmi) return null
  const n = parseFloat(bmi)
  if (n < 18.5) return { label: 'Abaixo do peso', color: '#F59E0B' }
  if (n < 25) return { label: 'Peso normal', color: '#22C55E' }
  if (n < 30) return { label: 'Sobrepeso', color: '#F59E0B' }
  return { label: 'Obesidade', color: '#EF4444' }
}

function calcAge(birthYear) {
  if (!birthYear) return null
  return new Date().getFullYear() - birthYear
}

const GENDER_OPTIONS = [
  {
    id: 'male',
    label: 'Masculino',
    desc: 'Plano PPL — Push, Pull, Legs',
    emoji: '♂️',
  },
  {
    id: 'female',
    label: 'Feminino',
    desc: 'Foco em inferior — Glúteo, Posterior e Quadríceps',
    emoji: '♀️',
  },
]

export default function ProfileSetup() {
  const { saveProfile, user } = useAuthStore()
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState('male')
  const [experience, setExperience] = useState('intermediate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bmi = useMemo(() => calcBMI(parseFloat(weight), parseFloat(height)), [weight, height])
  const bmiInfo = bmiLabel(bmi)
  const age = calcAge(parseInt(birthYear))

  const previewExercises = useMemo(() => getPreviewExercises(gender), [gender])

  const weights = useMemo(() => {
    const w = parseFloat(weight)
    if (!w || w < 30) return null
    return generateStartingWeights(w, experience)
  }, [weight, experience])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Informe seu nome'); return }
    if (!weight || parseFloat(weight) < 30) { setError('Informe um peso válido'); return }
    if (!height || parseFloat(height) < 100) { setError('Informe uma altura válida'); return }

    setLoading(true)
    setError('')
    try {
      await saveProfile({
        username: name.trim(),
        weight_kg: parseFloat(weight),
        height_cm: parseInt(height),
        birth_year: birthYear ? parseInt(birthYear) : null,
        gender,
        experience,
        starting_weights: weights || {},
        profile_completed: true,
      })
    } catch (err) {
      setError(err.message || 'Erro ao salvar perfil')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '32px 24px 48px',
      background: 'var(--bg-primary)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(200, 255, 0, 0.1)',
            border: '1px solid rgba(200, 255, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={22} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>
              Configure seu perfil
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Seus dados físicos permitem gerar pesos de início personalizados para cada exercício.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Seção 1: Identidade */}
        <section>
          <SectionTitle icon={<User size={15} />} title="Identidade" />
          <InputField
            label="Como quer ser chamado?"
            placeholder="Seu nome ou apelido"
            value={name}
            onChange={setName}
            type="text"
          />
        </section>

        {/* Seção 2: Sexo */}
        <section>
          <SectionTitle icon={<User size={15} />} title="Sexo" />
          <div style={{ display: 'flex', gap: 10 }}>
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGender(opt.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '16px 12px',
                  background: gender === opt.id ? 'rgba(200, 255, 0, 0.08)' : 'var(--bg-card)',
                  border: `1.5px solid ${gender === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: gender === opt.id ? 'var(--accent)' : 'var(--text-primary)',
                    marginBottom: 2,
                  }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{opt.desc}</div>
                </div>
                {gender === opt.id && (
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={12} color="#000" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Seção 3: Dados físicos */}
        <section>
          <SectionTitle icon={<Scale size={15} />} title="Dados físicos" />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="Peso (kg)"
                placeholder="80"
                value={weight}
                onChange={setWeight}
                type="number"
                inputMode="decimal"
                min="30"
                max="300"
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Altura (cm)"
                placeholder="175"
                value={height}
                onChange={setHeight}
                type="number"
                inputMode="numeric"
                min="100"
                max="250"
              />
            </div>
          </div>

          <InputField
            label="Ano de nascimento (opcional)"
            placeholder={String(new Date().getFullYear() - 25)}
            value={birthYear}
            onChange={setBirthYear}
            type="number"
            inputMode="numeric"
            min="1940"
            max={new Date().getFullYear() - 10}
            style={{ marginTop: 12 }}
          />

          {/* BMI preview */}
          {bmi && bmiInfo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>IMC</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: bmiInfo.color }}>{bmi}</div>
                </div>
                {age && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Idade</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{age} anos</div>
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: bmiInfo.color,
                background: bmiInfo.color + '15',
                borderRadius: 999,
                padding: '4px 10px',
              }}>
                {bmiInfo.label}
              </span>
            </div>
          )}
        </section>

        {/* Seção 4: Experiência */}
        <section>
          <SectionTitle icon={<Trophy size={15} />} title="Nível de experiência" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXPERIENCE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExperience(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: experience === opt.id ? 'rgba(200, 255, 0, 0.08)' : 'var(--bg-card)',
                  border: `1.5px solid ${experience === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 68,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: experience === opt.id ? 'var(--accent)' : 'var(--text-primary)',
                    marginBottom: 2,
                  }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                </div>
                {experience === opt.id && (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Check size={14} color="#000" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Preview de pesos */}
        {weights && (
          <section>
            <SectionTitle icon={<Zap size={15} />} title="Pesos sugeridos para início" />
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(200, 255, 0, 0.2)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(200, 255, 0, 0.05)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Calculado com base no seu peso corporal ({weight}kg) e nível {EXPERIENCE_OPTIONS.find(o => o.id === experience)?.label}. Ajuste conforme necessário.
                </p>
              </div>
              {previewExercises.map((ex, i) => {
                const w = weights[ex.id]
                const unit = getUnitLabel(ex.id)
                return (
                  <div
                    key={ex.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: i < previewExercises.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{ex.name}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15,
                      fontWeight: 700,
                      color: w ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {w ? `${w} ${unit}` : 'Peso corporal'}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14,
            color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 56,
            borderRadius: 14,
            background: loading ? 'var(--bg-surface)' : 'var(--accent)',
            border: 'none',
            color: loading ? 'var(--text-disabled)' : '#000',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {loading ? 'Salvando...' : (
            <>Iniciar treino <ChevronRight size={20} /></>
          )}
        </button>
      </form>
    </div>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    }}>
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}>
        {title}
      </span>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder, inputMode, min, max, style: extraStyle }) {
  return (
    <div style={extraStyle}>
      {label && (
        <label style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          display: 'block',
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        min={min}
        max={max}
        style={{
          width: '100%',
          height: 52,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          color: 'var(--text-primary)',
          fontSize: 16,
          padding: '0 16px',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
      />
    </div>
  )
}
