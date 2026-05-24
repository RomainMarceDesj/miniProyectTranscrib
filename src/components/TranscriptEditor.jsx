import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { toMMSS, parseSegments } from '../utils/time'

const TranscriptEditor = forwardRef(function TranscriptEditor({ currentTime, onSeek }, ref) {
  const [transcript, setTranscript] = useState('')
  const [tab, setTab] = useState('edit')
  const [copied, setCopied] = useState(false)
  const taRef = useRef(null)

  useImperativeHandle(ref, () => ({
    insertTimestamp() {
      const ta = taRef.current
      if (!ta) return
      const stamp = `[${toMMSS(currentTime)}] `
      const start = ta.selectionStart
      const end   = ta.selectionEnd
      const next  = transcript.slice(0, start) + stamp + transcript.slice(end)
      setTranscript(next)
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + stamp.length
        ta.focus()
      }, 0)
    },
  }), [currentTime, transcript])

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount  = transcript.split(/\s+/).filter(Boolean).length
  const stampCount = (transcript.match(/\[\d{2}:\d{2}\]/g) || []).length
  const segments   = parseSegments(transcript)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Tab bar + toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: '0.5px solid var(--border)',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['edit', 'preview'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 13,
                padding: '4px 12px',
                background: tab === t ? 'var(--bg-secondary)' : 'transparent',
                borderColor: tab === t ? 'var(--border-strong)' : 'transparent',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => ref?.current?.insertTimestamp()}
            title="Insert timestamp at cursor (Ctrl+Shift+Space)"
            style={{ fontFamily: 'monospace', fontSize: 12, padding: '4px 10px' }}
          >
            [{toMMSS(currentTime)}] ↵
          </button>
          <button onClick={handleCopy} style={{ fontSize: 12, padding: '4px 10px' }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} style={{ fontSize: 12, padding: '4px 10px' }}>
            ↓ .txt
          </button>
        </div>
      </div>

      {/* Edit */}
      {tab === 'edit' && (
        <textarea
          ref={taRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={[
            'Start typing your transcription here…',
            '',
            'Keyboard shortcuts:',
            '  F8                   play / pause audio',
            '  Ctrl+Shift+Space     insert timestamp at cursor',
          ].join('\n')}
          spellCheck
        />
      )}

      {/* Preview */}
      {tab === 'preview' && (
        <div style={{ minHeight: 320, fontSize: 14, lineHeight: 1.9, padding: '4px 2px' }}>
          {transcript ? (
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {segments.map((seg, i) => (
                <span key={i}>
                  {seg.label && (
                    <span
                      onClick={() => onSeek(seg.seconds)}
                      title={`Seek to ${seg.label}`}
                      style={{
                        display: 'inline-block',
                        background: 'var(--bg-secondary)',
                        border: '0.5px solid var(--border-strong)',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        marginRight: 2,
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--info-bg)'
                        e.target.style.color = 'var(--info-text)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--bg-secondary)'
                        e.target.style.color = 'var(--text-secondary)'
                      }}
                    >
                      {seg.label}
                    </span>
                  )}
                  {seg.text && (
                    seg.seconds != null ? (
                      <span
                        onClick={() => onSeek(seg.seconds)}
                        title={`Seek to ${seg.label}`}
                        style={{ cursor: 'pointer', borderRadius: 3, padding: '1px 2px', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--info-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span>{seg.text}</span>
                    )
                  )}
                </span>
              ))}
            </p>
          ) : (
            <p className="muted" style={{ fontStyle: 'italic', padding: '1rem 0' }}>
              Nothing to preview yet — write something in the Edit tab.
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="hint" style={{ marginTop: 10 }}>
        {transcript.length} chars · {wordCount} words · {stampCount} timestamps
        {tab === 'preview' && transcript && ' — click any segment to seek'}
      </p>
    </div>
  )
})

export default TranscriptEditor
