import { useState } from 'react'
import { Eye, EyeOff, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      }
    } catch (err) {
      const msg = err.message || 'Algo deu errado'
      if (msg.includes('Invalid login')) setError('Email ou senha incorretos')
      else if (msg.includes('already registered')) setError('Este email já está cadastrado')
      else if (msg.includes('Password should')) setError('Senha precisa ter ao menos 6 caracteres')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--bg-primary)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(200, 255, 0, 0.1)',
          border: '2px solid rgba(200, 255, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Zap size={36} color="var(--accent)" />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
          marginBottom: 6,
        }}>
          FORGEfit
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {mode === 'signin' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
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
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              style={{
                width: '100%',
                height: 52,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 16,
                padding: '0 52px 0 16px',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

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

        {success && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14,
            color: 'var(--success)',
          }}>
            {success}
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
            marginTop: 4,
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      {/* Toggle */}
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {mode === 'signin' ? 'Não tem conta? ' : 'Já tem conta? '}
        </span>
        <button
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            padding: 0,
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {mode === 'signin' ? 'Criar conta' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}
