/**
 * Convert seconds to MM:SS string.
 */
export function toMMSS(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Parse a transcript string into segments keyed by timestamp.
 * Each segment: { seconds, label, text }
 * Text before the first timestamp gets seconds: null.
 *
 * Example input:  "intro [00:12] hello there [00:45] more text"
 * Output:
 *   [
 *     { seconds: null,  label: null,    text: "intro " },
 *     { seconds: 12,    label: "[00:12]", text: " hello there " },
 *     { seconds: 45,    label: "[00:45]", text: " more text" },
 *   ]
 */
export function parseSegments(text) {
  const regex = /\[(\d{2}):(\d{2})\]/g
  const timestamps = []
  let match

  while ((match = regex.exec(text)) !== null) {
    timestamps.push({
      index: match.index,
      length: match[0].length,
      seconds: parseInt(match[1]) * 60 + parseInt(match[2]),
      label: match[0],
    })
  }

  if (!timestamps.length) return [{ seconds: null, label: null, text }]

  const parts = []

  if (timestamps[0].index > 0) {
    parts.push({ seconds: null, label: null, text: text.slice(0, timestamps[0].index) })
  }

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i]
    const start = ts.index + ts.length
    const end = i + 1 < timestamps.length ? timestamps[i + 1].index : text.length
    parts.push({ seconds: ts.seconds, label: ts.label, text: text.slice(start, end) })
  }

  return parts
}
