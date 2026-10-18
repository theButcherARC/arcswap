'use client'

import { authClient } from '@/lib/auth-client'
import { useAccount } from 'wagmi'
import { useState, useEffect, useCallback } from 'react'

interface ProfileData {
  username: string
  name: string
  image: string
  vibeId: string
}

export default function SocialProfilePage() {
  const { address, isConnected } = useAccount()
  const { data: session, isPending } = authClient.useSession()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [status, setStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [copiedVibeId, setCopiedVibeId] = useState(false)

  const fetchProfile = useCallback(async () => {
    setFetchingProfile(true)
    setProfileError(null)
    try {
      const res = await fetch('/api/social/me', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not load profile.')
      const handle = String(json.username ?? '').replace(/^@/, '').trim().toLowerCase()
      setProfile({
        username: handle,
        name: json.name ?? '',
        image: json.image ?? '',
        vibeId: json.vibeId ?? '',
      })
      // Check if already linked
      if (handle) {
        const resolveRes = await fetch('/api/social/resolve?username=' + encodeURIComponent(handle), { cache: 'no-store' })
        const resolveJson = await resolveRes.json()
        if (resolveRes.ok && resolveJson.address) {
          setStatus('success')
          setMessage('@' + handle + ' is linked to ' + resolveJson.address.slice(0, 6) + '...' + resolveJson.address.slice(-4))
        }
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not load your profile.')
    } finally {
      setFetchingProfile(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) fetchProfile()
  }, [session?.user?.id, fetchProfile])

  async function handleLoginWithX() {
    await authClient.signIn.social({ provider: 'twitter', callbackURL: '/social-profile' })
  }

  async function handleLogout() {
    await authClient.signOut()
    setProfile(null)
    setProfileError(null)
    setMessage('')
    setStatus('idle')
  }

  async function handleLinkWallet() {
    if (!session?.user || !isConnected || !address) return

    let username = profile?.username ?? ''

    if (!username) {
      setStatus('linking')
      setMessage('Verifying your X handle...')
      try {
        const res = await fetch('/api/social/me', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Could not verify X profile.')
        username = String(json.username ?? '').replace(/^@/, '').trim().toLowerCase()
        if (!username) throw new Error('X username not returned. Please reconnect X.')
        if (json.vibeId) setProfile(prev => prev ? { ...prev, username, vibeId: json.vibeId } : null)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Could not verify your X profile.')
        return
      }
    }

    setStatus('linking')
    setMessage('')

    try {
      const res = await fetch('/api/social/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, walletAddress: address }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to link account.')
      setStatus('success')
      setMessage('@' + username + ' is now linked to ' + address.slice(0, 6) + '...' + address.slice(-4))
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unexpected error.')
    }
  }

  function copyVibeId() {
    if (!profile?.vibeId) return
    navigator.clipboard.writeText(profile.vibeId).then(() => {
      setCopiedVibeId(true)
      setTimeout(() => setCopiedVibeId(false), 2000)
    })
  }

  const xConnected = !!session?.user
  const walletConnected = isConnected && !!address
  const canLink = xConnected && walletConnected && !fetchingProfile && status !== 'linking'

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-lg">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            <span className="text-[var(--fg)]">VibeID</span>
          </h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">
            Get your unique VibeID. Link X account. Get paid by anyone with just an identifier.
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* ── Section 1: Wallet Address ───────────────────────────────── */}
          <div className="border border-white/10 bg-[var(--glass)] p-6 ">
            <div className="flex items-center gap-3 mb-4">
              <div className={
                'flex h-7 w-7 items-center justify-center text-xs font-bold ' +
                (walletConnected ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
              }>
                {walletConnected ? '✓' : '1'}
              </div>
              <span className="text-sm font-semibold text-white">Wallet Address</span>
              <span className="text-xs text-white/30 font-normal ml-1">Primary Identity</span>
            </div>

            {walletConnected ? (
              <div className="border border-violet-500/20 bg-[var(--accent-soft)] px-4 py-3">
                <p className="text-sm font-mono text-white break-all">{address}</p>
                <p className="text-xs text-white/40 mt-0.5">Wallet connected</p>
              </div>
            ) : (
              <p className="text-sm text-white/40">
                Use the &quot;Connect Wallet&quot; button in the header to connect your wallet.
              </p>
            )}
          </div>

          {/* ── Section 2: Connect X ────────────────────────────────────── */}
          <div className="border border-white/10 bg-[var(--glass)] p-6 ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={
                  'flex h-7 w-7 items-center justify-center text-xs font-bold ' +
                  (xConnected ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
                }>
                  {xConnected ? '✓' : '2'}
                </div>
                <span className="text-sm font-semibold text-white">Connect X Account</span>
              </div>
              {xConnected && (
                <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Logout
                </button>
              )}
            </div>

            {isPending ? (
              <div className="h-10 bg-white/5 animate-pulse" />
            ) : xConnected ? (
              <div className="flex items-center gap-3 border border-violet-500/20 bg-[var(--accent-soft)] px-4 py-3">
                {session!.user.image && (
                  <img src={session!.user.image} alt="X avatar" className="h-9 w-9 rounded-full shrink-0" />
                )}
                <div className="min-w-0">
                  {fetchingProfile ? (
                    <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                  ) : (
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.username ? '@' + profile.username : session!.user.name ?? 'Connected to X'}
                    </p>
                  )}
                  <p className="text-xs text-white/40 truncate mt-0.5">{session!.user.name ?? 'X account'}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLoginWithX}
                className="flex w-full items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Continue with X
              </button>
            )}

            {profileError && xConnected && (
              <p className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2">
                {profileError}
              </p>
            )}
          </div>

          {/* ── Section 3: VibeID ───────────────────────────────────────── */}
          {xConnected && (
            <div className="border border-violet-500/20 bg-[var(--accent-soft)] p-6 ">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center bg-violet-600/30 text-xs font-bold text-violet-300">
                  V
                </div>
                <span className="text-sm font-semibold text-white">VibeID</span>
                <span className="text-xs text-white/30 ml-1">Unique Payment Identifier</span>
              </div>

              {fetchingProfile ? (
                <div className="h-12 bg-white/5 animate-pulse" />
              ) : profile?.vibeId ? (
                <div className="flex items-center justify-between gap-3 border border-violet-500/30 bg-[var(--accent-soft)] px-4 py-3">
                  <div>
                    <p className="text-lg font-bold font-mono text-violet-300 tracking-widest">
                      {profile.vibeId}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Permanent · Cannot be changed</p>
                  </div>
                  <button
                    onClick={copyVibeId}
                    title="Copy VibeID"
                    className="flex h-8 w-8 shrink-0 items-center justify-center border border-violet-500/30 bg-[var(--accent-soft)] text-violet-400 hover:bg-violet-500/20 transition-colors"
                  >
                    {copiedVibeId ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/40">Connect X to generate your VibeID.</p>
              )}
            </div>
          )}

          {/* ── Section 4: Link Handle to Wallet ───────────────────────── */}
          <div className="border border-white/10 bg-[var(--glass)] p-6 ">
            <div className="flex items-center gap-3 mb-4">
              <div className={
                'flex h-7 w-7 items-center justify-center text-xs font-bold ' +
                (status === 'success' ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
              }>
                {status === 'success' ? '✓' : '3'}
              </div>
              <span className="text-sm font-semibold text-white">Link Handle to Wallet</span>
            </div>

            {status === 'success' ? (
              <div className="border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <p className="text-sm text-emerald-400 font-semibold">Linked successfully</p>
                <p className="text-xs text-white/50 mt-0.5">{message}</p>
              </div>
            ) : (
              <>
                {status === 'error' && message && (
                  <div className="mb-3 border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                    <p className="text-sm text-rose-400">{message}</p>
                  </div>
                )}
                {profile?.username && (
                  <div className="mb-4 border border-violet-500/20 bg-[var(--accent-soft)] px-4 py-3">
                    <p className="text-xs text-white/50 mb-1">X Handle (auto-detected)</p>
                    <p className="text-sm font-medium text-violet-300">@{profile.username}</p>
                  </div>
                )}
                <button
                  onClick={handleLinkWallet}
                  disabled={!canLink}
                  className={
                    'w-full px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ' +
                    (canLink
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'bg-white/5 text-white/30 cursor-not-allowed')
                  }
                >
                  {status === 'linking' && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {status === 'linking'
                    ? 'Linking...'
                    : profile?.username
                      ? `Link @${profile.username} to Wallet`
                      : 'Link X Handle to This Wallet'}
                </button>
                {!xConnected || !walletConnected ? (
                  <p className="mt-2 text-xs text-white/30 text-center">Complete steps 1 and 2 first</p>
                ) : null}
              </>
            )}
          </div>

          {/* Info card */}
          <div className="border border-white/5 bg-white/[0.02] px-6 py-5">
            <p className="text-xs text-white/40 leading-relaxed">
              Once linked, anyone can pay you using{' '}
              <span className="text-violet-400 font-mono">@{profile?.username ?? 'yourhandle'}</span>
              {profile?.vibeId && (
                <> or <span className="text-violet-400 font-mono">{profile.vibeId}</span></>
              )}{' '}
              in the Bulk Pay recipient field - your wallet address will auto-fill.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
