import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import useWorkoutStore from '../store/workoutStore'
import useAuthStore from '../store/authStore'
import { clearWgerCache } from '../lib/wgerApi'
import { requestNotificationPermission, scheduleNotification, cancelNotification, hasNotificationSupport } from '../lib/notifications'
import { Clock, Trash2, ChevronRight, LogOut, User, Edit3, Bell, BellOff } from 'lucide-react'

function OptionRow({ label, children, description }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div style={{ marginLeft: 16 }}>{children}</div>
    </div>
  )
}

function RestSelector({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            background: value === opt ? 'var(--accent)' : 'var(--bg-surface)',
            border: `1px solid ${value === opt ? 'var(--accent)' : 'var(--border)'}`,
            color: value === opt ? '#000' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: value === opt ? 700 : 400,
            cursor: 'pointer',
            minHeight: 36,
            fontFamily: 'var(--font-display)',
          }}
        >
          {opt}s
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useWorkoutStore()
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [cacheCleared, setCacheCleared] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    hasNotificationSupport() ? Notification.permission : 'denied'
  )

  const handleToggleNotification = async (type, enabled) => {
    if (enabled && notifPermission !== 'granted') {
      const granted = await requestNotificationPermission()
      if (!granted) return
      setNotifPermission('granted')
    }
    const key = type === 'creatine' ? 'creatineNotification' : 'gymNotification'
    const timeKey = type === 'creatine' ? 'creatineTime' : 'gymTime'
    updateSettings({ [key]: enabled })
    if (enabled) {
      scheduleNotification(type, settings[timeKey])
    } else {
      cancelNotification(type)
    }
  }

  const handleTimeChange = (type, time) => {
    const key = type === 'creatine' ? 'creatineTime' : 'gymTime'
    const enabledKey = type === 'creatine' ? 'creatineNotification' : 'gymNotification'
    updateSettings({ [key]: time })
    if (settings[enabledKey]) {
      scheduleNotification(type, time)
    }
  }

  const handleClearCache = () => {
    clearWgerCache()
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
  }

  return (
    <>
      <Header title="Configurações" />
      <div style={{ padding: '20px 20px 100px' }}>

        {/* Profile card */}
        {user && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(200, 255, 0, 0.1)',
              border: '2px solid rgba(200, 255, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={24} color="var(--accent)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {profile?.username || 'Usuário'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
              {profile?.weight_kg && profile?.height_cm && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {profile.weight_kg}kg · {profile.height_cm}cm ·{' '}
                  {{ beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }[profile.experience] || 'Intermediário'}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/setup')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                minHeight: 44,
                minWidth: 44,
                justifyContent: 'center',
              }}
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}

        {/* Rest time section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '0 16px',
          marginBottom: 20,
        }}>
          <div style={{
            padding: '14px 0 10px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Clock size={16} color="var(--accent)" />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Descanso entre Séries
              </span>
            </div>
          </div>

          <OptionRow
            label="Força"
            description="Exercícios pesados: 4–6 reps"
          >
            <RestSelector
              value={settings.restStrength}
              onChange={v => updateSettings({ restStrength: v })}
              options={[60, 90, 120, 180]}
            />
          </OptionRow>

          <OptionRow
            label="Hipertrofia"
            description="Volume: 8–15 reps"
          >
            <RestSelector
              value={settings.restHypertrophy}
              onChange={v => updateSettings({ restHypertrophy: v })}
              options={[45, 60, 90, 120]}
            />
          </OptionRow>

          <OptionRow
            label="Resistência"
            description="Alta repetição: 15+ reps"
          >
            <RestSelector
              value={settings.restResistance}
              onChange={v => updateSettings({ restResistance: v })}
              options={[30, 45, 60, 90]}
            />
          </OptionRow>
        </div>

        {/* Notifications section */}
        {hasNotificationSupport() && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '0 16px',
            marginBottom: 20,
          }}>
            <div style={{ padding: '14px 0 10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Bell size={16} color="var(--accent)" />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Lembretes
                </span>
              </div>
              {notifPermission === 'denied' && (
                <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 6 }}>
                  Ative as notificações no navegador para usar lembretes.
                </p>
              )}
            </div>

            {/* Creatine */}
            <OptionRow
              label=" Lembrete de creatina"
              description="Lembrete diário para tomar 5g de creatina"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {settings.creatineNotification && (
                  <input
                    type="time"
                    value={settings.creatineTime}
                    onChange={e => handleTimeChange('creatine', e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontFamily: 'var(--font-display)',
                    }}
                  />
                )}
                <button
                  onClick={() => handleToggleNotification('creatine', !settings.creatineNotification)}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 999,
                    background: settings.creatineNotification ? 'var(--accent)' : 'var(--bg-surface)',
                    border: `1px solid ${settings.creatineNotification ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: settings.creatineNotification ? '#000' : 'var(--text-disabled)',
                    position: 'absolute',
                    top: 3,
                    left: settings.creatineNotification ? 24 : 3,
                    transition: 'all 0.2s',
                  }} />
                </button>
              </div>
            </OptionRow>

            {/* Gym */}
            <OptionRow
              label=" Lembrete da academia"
              description="Mensagem motivacional para ir treinar"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {settings.gymNotification && (
                  <input
                    type="time"
                    value={settings.gymTime}
                    onChange={e => handleTimeChange('gym', e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontFamily: 'var(--font-display)',
                    }}
                  />
                )}
                <button
                  onClick={() => handleToggleNotification('gym', !settings.gymNotification)}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 999,
                    background: settings.gymNotification ? 'var(--accent)' : 'var(--bg-surface)',
                    border: `1px solid ${settings.gymNotification ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: settings.gymNotification ? '#000' : 'var(--text-disabled)',
                    position: 'absolute',
                    top: 3,
                    left: settings.gymNotification ? 24 : 3,
                    transition: 'all 0.2s',
                  }} />
                </button>
              </div>
            </OptionRow>
          </div>
        )}

        {/* Cache section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '0 16px',
          marginBottom: 20,
        }}>
          <div style={{ padding: '14px 0 10px', borderBottom: '1px solid var(--border)' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Dados
            </span>
          </div>

          <button
            onClick={handleClearCache}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: cacheCleared ? 'var(--success)' : 'var(--text-primary)',
              minHeight: 44,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Trash2 size={16} color={cacheCleared ? 'var(--success)' : 'var(--danger)'} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500 }}>
                  {cacheCleared ? 'Cache limpo!' : 'Limpar cache de mídias'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Imagens dos exercícios (wger.de)
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-disabled)" />
          </button>
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <LogOut size={18} />
            {loggingOut ? 'Saindo...' : 'Sair da conta'}
          </button>
        )}

        {/* About */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
              <span style={{ fontSize: 20 }}>⚡</span>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                FORGEfit
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Versão 1.0.0
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            App pessoal de treino com divisão PPL (Push/Pull/Legs), integração com wger.de, histórico local e rastreamento de carga.
          </p>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(200, 255, 0, 0.06)', borderRadius: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              Lembre-se: tome creatina diariamente (5g), inclusive nos dias de descanso
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
