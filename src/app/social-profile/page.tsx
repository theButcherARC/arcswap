'use client'

import { authClient } from '@/lib/auth-client'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

export default function SocialProfilePage() {
  const { address, isConnected } = useAccount()
  const { data: session, isPending } = authClient.useSession()

  const [status, setStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [linkedHandle, setLinkedHandle] = useState<string | null>(null)
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null)
  const [dbUsername, setDbUsername] = useState<string | null>(null)
  const [fetchingUsername, setFetchingUsername] = useState(false)

  // Fetch username from DB once session is ready (session.user.username may be empty)
  useEffect(() => {
    if (!session?.user?.id) return

    setFetchingUsername(true)
    fetch('/api/social/me')
      .then(r => r.json())
      .then(json => {
        const handle = json.username ?? ''
        setDbUsername(handle || null)
        if (handle) setLinkedHandle(handle)

        // Check if already linked in social_profiles
        return fetch('/api/social/resolve?username=' + encodeURIComponent(handle))
          .then(r => r.json())
          .then(resolveJson => {
            if (resolveJson.address) {
              setStatus('success')
              setMessage('@' + handle + ' is now linked to ' + resolveJson.address.slice(0, 6) + '...' + resolveJson.address.slice(-4))
              setLinkedAddress(resolveJson.address)
            }
          })
          .catch(() => {/* not linked yet */})
      })
      .catch(() => setDbUsername(null))
      .finally(() => setFetchingUsername(false))
  }, [session?.user?.id])

  // Keep linked address in sync with wallet
  useEffect(() => {
    if (isConnected && address) setLinkedAddress(address)
  }, [isConnected, address])

  async function handleLoginWithX() {
    await authClient.signIn.social({ provider: 'twitter', callbackURL: '/social-profile' })
  }

  async function handleLogout() {
    await authClient.signOut()
    setLinkedHandle(null)
    setLinkedAddress(null)
    setMessage('')
    setStatus('idle')
  }

  async function handleLinkWallet() {
    if (!session?.user) {
      setStatus('error')
      setMessage('Please login with X first.')
      return
    }
    if (!isConnected || !address) {
      setStatus('error')
      setMessage('Please connect your wallet first.')
      return
    }

    const username = (dbUsername ?? '').replace(/^@/, '').toLowerCase()

    if (!username) {
      setStatus('error')
      setMessage('Could not fetch your X username. Please logout and login again.')
      return
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
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to link account')
      }
      setStatus('success')
      setLinkedHandle(username)
      setLinkedAddress(address)
      const message = '@' + username + ' is now linked to ' + address.slice(0, 6) + '...' + address.slice(-4)
      setMessage(message)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  const username = dbUsername

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Ambient background depth */}
      <div className="pointer-events-none absolute top-10 left-1/3 h-[350px] w-[450px] rounded-full bg-violet-600/[0.06] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-[300px] w-[350px] rounded-full bg-indigo-600/[0.04] blur-[110px]" />

      <div className="relative mx-auto max-w-lg">
        {/* Header */}
        <div className="animate-fade-in-up mb-10">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent text-balance">
            Social Profile
          </h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">
            Link your X account to your wallet so others can pay you by handle.
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Step 1 — X Login */}
          <div className="animate-fade-in-up delay-100 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl p-6 transition-colors duration-300 hover:border-white/[0.15]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                  (session?.user ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
                }>
                  {session?.user ? '✓' : '1'}
                </div>
                <span className="text-sm font-medium text-white">Login with X</span>
              </div>
              {session?.user && (
                <button
                  onClick={handleLogout}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

            {isPending ? (
              <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? 'X avatar'}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {fetchingUsername
                      ? <span className="text-white/40 italic text-xs">Loading handle...</span>
                      : username
                        ? '@' + username
                        : (session.user.name ?? 'Connected to X')}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {session.user.name ?? 'X account'}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLoginWithX}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Continue with X
              </button>
            )}
          </div>

          {/* Step 2 — Wallet */}
          <div className="animate-fade-in-up delay-200 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl p-6 transition-colors duration-300 hover:border-white/[0.15]">
            <div className="flex items-center gap-3 mb-4">
              <div className={
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                (isConnected && address ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
              }>
                {isConnected && address ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium text-white">Connect Wallet</span>
            </div>

            {isConnected && address ? (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
                <p className="text-sm font-mono text-white">
                  {address.slice(0, 6) + '...' + address.slice(-4)}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Wallet connected</p>
              </div>
            ) : (
              <p className="text-sm text-white/40">
                Use the &quot;Connect Wallet&quot; button in the top-right header to connect your wallet.
              </p>
            )}
          </div>

          {/* Step 3 — Link */}
          <div className="animate-fade-in-up delay-300 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl p-6 transition-colors duration-300 hover:border-white/[0.15]">
            <div className="flex items-center gap-3 mb-4">
              <div className={
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                (status === 'success' ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50')
              }>
                {status === 'success' ? '✓' : '3'}
              </div>
              <span className="text-sm font-medium text-white">Link Handle to Wallet</span>
            </div>

            {status === 'success' ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <p className="text-sm text-emerald-400 font-medium">Linked successfully</p>
                <p className="text-xs text-white/50 mt-0.5">{message}</p>
              </div>
            ) : (
              <>
                {status === 'error' && message && (
                  <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                    <p className="text-sm text-rose-400">{message}</p>
                  </div>
                )}
                {username && (
                  <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
                    <p className="text-xs text-white/60 mb-1">Your X Handle (Auto-detected)</p>
                    <p className="text-sm font-medium text-violet-300">@{username}</p>
                  </div>
                )}
                <button
                  onClick={handleLinkWallet}
                  disabled={status === 'linking' || !session?.user || !isConnected}
                  className={
                    'w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ' +
                    (session?.user && isConnected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 active:scale-[0.98]'
                      : 'bg-white/5 text-white/30 cursor-not-allowed')
                  }
                >
                  {status === 'linking' && (
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {status === 'linking' ? 'Linking...' : username ? `Link @${username} to Wallet` : 'Link X Handle to This Wallet'}
                </button>
                <p className="mt-2 text-xs text-white/30 text-center">
                  Complete steps 1 and 2 first
                </p>
              </>
            )}
          </div>

          {/* Info card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5">
            <p className="text-xs text-white/40 leading-relaxed">
  Once linked, anyone using VibeFlow can type{' '}
  <span className="text-violet-400 font-mono">{'@' + (username ?? 'yourhandle')}</span>{' '}
  in the Bulk Pay recipient field and your wallet address will auto-fill. You can re-link
              at any time to update your wallet address.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
