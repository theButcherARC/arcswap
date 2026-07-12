import { randomBytes } from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I confusion

/** Generate a candidate VibeID string: VIBE-XXXXXX */
export function generateVibeId(): string {
  const bytes = randomBytes(6)
  let suffix = ''
  for (const b of bytes) {
    suffix += CHARS[b % CHARS.length]
  }
  return 'VIBE-' + suffix
}
