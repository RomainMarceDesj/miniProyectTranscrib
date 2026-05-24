import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import TranscriptionApp from './components/TranscriptionApp'

// ⚠️  Temporary hardcoded credentials — secure with a backend before sharing publicly
const USERS = [
  { username: 'Eriri',       password: 'eri'  },
  { username: 'Mayuyu', password: 'mayu'   },
]

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (username, password) => {
    const match = USERS.find(u => u.username === username && u.password === password)
    if (match) { setUser(match.username); return true }
    return false
  }

  return user
    ? <TranscriptionApp username={user} onLogout={() => setUser(null)} />
    : <LoginScreen onLogin={handleLogin} />
}
