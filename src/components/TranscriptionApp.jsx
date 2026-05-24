import { useRef, useEffect, useState } from 'react'
import AudioPlayer from './AudioPlayer'
import TranscriptEditor from './TranscriptEditor'

export default function TranscriptionApp({ username, onLogout }) {
  const audioRef  = useRef(null)
  const editorRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  //   F8                   → play / pause
  //   Ctrl + Shift + Space → insert timestamp at cursor
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'F8') {
        e.preventDefault()
        audioRef.current?.togglePlay()
      }
      if (e.code === 'Space' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        editorRef.current?.insertTimestamp()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg)',
        borderBottom: '0.5px solid var(--border)',
        padding: '10px 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <p style={{ fontWeight: 500, fontSize: 14 }}>Transcription tool</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>{username}</span>
          <button onClick={onLogout} style={{ fontSize: 12, padding: '4px 10px' }}>Sign out</button>
        </div>
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 860,
        margin: '0 auto',
        width: '100%',
      }}>
        <AudioPlayer ref={audioRef} onTimeUpdate={setCurrentTime} />
        <TranscriptEditor ref={editorRef} currentTime={currentTime} onSeek={(s) => audioRef.current?.seekTo(s)} />
      </main>
    </div>
  )
}
