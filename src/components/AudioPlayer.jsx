import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { toMMSS } from '../utils/time'

const AudioPlayer = forwardRef(function AudioPlayer({ onTimeUpdate }, ref) {
  const [audioURL, setAudioURL] = useState(null)
  const [audioName, setAudioName] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioElRef = useRef(null)
  const fileInputRef = useRef(null)
  const isPlayingRef = useRef(false)

  // Keep ref in sync so imperative handle closure is always fresh
  isPlayingRef.current = isPlaying

  useImperativeHandle(ref, () => ({
    togglePlay() {
      const a = audioElRef.current
      if (!a || !audioURL) return
      if (isPlayingRef.current) { a.pause(); setIsPlaying(false) }
      else { a.play(); setIsPlaying(true) }
    },
    seekTo(secs) {
      const a = audioElRef.current
      if (!a || !audioURL) return
      a.currentTime = secs
      a.play()
      setIsPlaying(true)
    },
  }), [audioURL])

  useEffect(() => {
    const a = audioElRef.current
    if (!a) return
    const onTime = () => {
      setCurrentTime(a.currentTime)
      onTimeUpdate?.(a.currentTime)
    }
    const onMeta = () => setDuration(a.duration)
    const onEnd  = () => setIsPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
    }
  }, [audioURL, onTimeUpdate])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (audioURL) URL.revokeObjectURL(audioURL)
    setAudioURL(URL.createObjectURL(file))
    setAudioName(file.name)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    onTimeUpdate?.(0)
  }

  const togglePlay = () => {
    const a = audioElRef.current
    if (!a || !audioURL) return
    if (isPlaying) { a.pause(); setIsPlaying(false) }
    else { a.play(); setIsPlaying(true) }
  }

  const skip = (secs) => {
    const a = audioElRef.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(a.currentTime + secs, duration))
  }

  const handleSeek = (e) => {
    const a = audioElRef.current
    if (!a) return
    a.currentTime = Number(e.target.value)
  }

  return (
    <div className="card">
      {audioURL && <audio ref={audioElRef} src={audioURL} style={{ display: 'none' }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontWeight: 500, fontSize: 14 }}>Audio</p>
        <button onClick={() => fileInputRef.current.click()} style={{ fontSize: 12, padding: '4px 10px' }}>
          {audioURL ? 'Change file' : 'Upload audio'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {audioURL ? (
        <>
          <p className="muted" style={{ fontSize: 12, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={audioName}>
            {audioName}
          </p>

          <div style={{ marginBottom: 8 }}>
            <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={handleSeek} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span className="hint">{toMMSS(currentTime)}</span>
              <span className="hint">{duration ? toMMSS(duration) : '--:--'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => skip(-10)} style={{ fontSize: 12, padding: '5px 10px' }}>−10s</button>
            <button onClick={() => skip(-5)}  style={{ fontSize: 12, padding: '5px 8px'  }}>−5s</button>
            <button className="primary" onClick={togglePlay} style={{ padding: '7px 20px', fontSize: 14, minWidth: 90 }}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={() => skip(5)}   style={{ fontSize: 12, padding: '5px 8px'  }}>+5s</button>
            <button onClick={() => skip(10)}  style={{ fontSize: 12, padding: '5px 10px' }}>+10s</button>
          </div>

          <p className="hint" style={{ marginTop: 10, textAlign: 'center' }}>
            F8 — play / pause &nbsp;·&nbsp; Ctrl+Shift+Space — insert timestamp
          </p>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem 1rem',
          border: '0.5px dashed var(--border-strong)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p className="muted" style={{ marginBottom: 4 }}>No audio loaded</p>
          <p className="hint">File stays local — never sent to any server</p>
        </div>
      )}
    </div>
  )
})

export default AudioPlayer
