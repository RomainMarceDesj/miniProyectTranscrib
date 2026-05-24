import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const submit = () => {
    if (onLogin(form.username, form.password)) {
      setError('')
    } else {
      setError('Invalid username or password.')
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 360 }}>
        <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Transcription tool</p>
        <p className="muted" style={{ marginBottom: 24, fontSize: 13 }}>
          Research use only — sign in to continue
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p className="muted" style={{ marginBottom: 4, fontSize: 12 }}>Username</p>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onKeyDown={handleKey}
              placeholder="your username"
              autoFocus
            />
          </div>

          <div>
            <p className="muted" style={{ marginBottom: 4, fontSize: 12 }}>Password</p>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKey}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>
          )}

          <button className="primary" onClick={submit} style={{ marginTop: 4 }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
