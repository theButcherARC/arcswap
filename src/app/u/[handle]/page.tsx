'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JoinWithXButton } from '@/components/auth/JoinWithXButton'
import { ROUTES } from '@/constants/routes'

interface PublicProfile {
  username: string
  name: string
  image: string
  vibeId: string
  bio: string
  telegram: string
  walletAddress: string
  verified: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const handle = String(params?.handle ?? '').replace(/^@/, '').toLowerCase()
  const [data, setData] = useState<PublicProfile | null>(null)
  const [state, setState] = useState<'loading' | 'found' | 'missing' | 'error'>('loading')
  const [copied, setCopied] = useState(false)
  const [imgStage, setImgStage] = useState(0)

  useEffect(() => {
    setImgStage(0)
  }, [data?.image])

  useEffect(() => {
    if (!handle) return
    let alive = true
    fetch('/api/profile/' + encodeURIComponent(handle), { cache: 'no-store' })
      .then(async res => {
        if (!alive) return
        if (res.status === 404) { setState('missing'); return }
        if (!res.ok) { setState('error'); return }
        const json = await res.json()
        if (!alive) return
        setData(json)
        setState('found')
      })
      .catch(() => { if (alive) setState('error') })
    return () => { alive = false }
  }, [handle])

  function copyVibe() {
    if (!data?.vibeId) return
    navigator.clipboard.writeText(data.vibeId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-lg">
        {state === 'loading' && (
          <div className="border border-[var(--line)] bg-[var(--glass)] p-8">
            <div className="h-24 animate-pulse bg-black/[0.06]" />
            <div className="mt-4 h-5 w-40 animate-pulse rounded bg-[var(--glass-strong)]" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-[var(--glass-strong)]" />
          </div>
        )}

        {state === 'missing' && (
          <div className="border border-[var(--line)] bg-[var(--glass)] p-8 text-center">
            <p className="text-lg font-bold text-[var(--fg)]">This VibeID does not exist yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--fg-muted)]">
              @{handle} has not joined VibeFlow. Your handle could be yours in one tap.
            </p>
            <div className="mt-6 flex justify-center">
              <JoinWithXButton variant="hero" />
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="border border-[var(--line)] bg-[var(--glass)] p-8 text-center">
            <p className="text-base font-semibold text-[var(--fg)]">Profile unavailable right now</p>
            <p className="mt-1.5 text-sm text-[var(--fg-muted)]">Please try again in a moment.</p>
          </div>
        )}

        {state === 'found' && data && (
          <div className="border border-[var(--line)] bg-[var(--glass)] p-8">
            <div className="flex flex-col items-center text-center">
              {data.image && imgStage < 2 ? (
                <img
                  src={imgStage === 0 && data.image.includes('_normal.') ? data.image.replace('_normal.', '_400x400.') : data.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImgStage((stage) => (data.image?.includes('_normal.') ? stage + 1 : 2))}
                  className="h-[88px] w-[88px] rounded-full border border-[var(--line)] object-cover"
                />
              ) : (
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[var(--accent-soft)] text-3xl font-bold text-[var(--accent)]">
                  {(data.name || data.username || 'V').slice(0, 1).toUpperCase()}
                </div>
              )}
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--fg)]">{data.name || '@' + data.username}</h1>
              <p className="mt-0.5 text-sm text-[var(--fg-muted)]">@{data.username}</p>
              {data.bio && <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--fg)]">{data.bio}</p>}

              {data.vibeId && (
                <button
                  onClick={copyVibe}
                  title="Copy VibeID"
                  className="mt-4 bg-[var(--accent-soft)] px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  {data.vibeId} {copied ? '· Copied' : ''}
                </button>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-[var(--fg-muted)]">
                {data.telegram && (
                  <a href={'https://t.me/' + data.telegram} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)] hover:underline">
                    t.me/{data.telegram}
                  </a>
                )}
                {data.walletAddress && (
                  <a
                    href={'https://explorer.arc.io/address/' + data.walletAddress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-[var(--fg)]"
                  >
                    {data.walletAddress.slice(0, 6)}...{data.walletAddress.slice(-4)} on Arc
                  </a>
                )}
              </div>
            </div>

            <Link
              href={ROUTES.BULK_PAY}
              className="mt-7 flex min-h-[52px] w-full items-center justify-center bg-[var(--accent)] px-6 text-base font-semibold text-white transition-opacity hover:opacity-85"
            >
              Pay @{data.username}
            </Link>
            <p className="mt-3 text-center text-xs leading-relaxed text-[var(--fg-faint)]">
              Opens Bulk Pay with the handle as the recipient. You review everything and sign in your own wallet, nothing moves without your signature.
            </p>
          </div>
        )}

        <p className="mono-label mt-8 text-center !text-[var(--fg-faint)]">VibeFlow · The people layer of Arc</p>
      </div>
    </main>
  )
}
