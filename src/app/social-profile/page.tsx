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

  // Check if already linked — also verify against DB on load
  useEffect(() => {
    if (!session?.user) return
    const handle = (session.user as { username?: string }).username ?? ''
    if (handle) {
      setLinkedHandle(handle)
      // Check DB to see if this handle is already linked
      fetch('/api/social/resolve?username=' + encodeURIComponent(handle))
        .then(r => r.json())
        .then(json => {
          if (json.address) {
            setStatus('success')
            setMessage('@' + handle + ' is now linked to ' + json.address.slice(0, 6) + '...' + json.address.slice(-4))
            setLinkedAddress(json.address)
          }
        })
        .catch(() => {/* not linked yet, that's fine */})
    }
    if (isConnected && address) {
      setLinkedAddress(address)
    }
  }, [session, isConnected, address])

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

    const usernameRaw = (session.user as { username?: string }).username ?? session.user.name ?? ''
    const username = usernameRaw.replace(/^@/, '').toLowerCase()

    if (!username) {
      setStatus('error')
      setMessage('Could not determine your X username. Please try logging in again.')
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
      setMessage('@' + username + ' is now linked to ' + address.slice(0, 6) + '...' + address.slice(-4))
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  // Twitter username comes from session.user.username (the handle, e.g. "The_Last_Dip")
  // session.user.name is the display name (e.g. "Butcher") - we never want to use that as handle
  const username = (session?.user as { username?: string } | undefined)?.username ?? null

  return (
    <main className="min-h-screen bg-[#050508] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent text-balance">
            Social Profile
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Link your X account to your wallet so others can pay you by handle.
          </p>
        </div>

        <div className="space-y-4">

          {/* Step 1 — X Login */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
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
                <div>
                  <p className="text-sm font-medium text-white">
                    {'@' + (username ?? session.user.name)}
                  </p>
                  <p className="text-xs text-white/40">Connected via X</p>
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
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
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
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
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
                <button
                  onClick={handleLinkWallet}
                  disabled={status === 'linking' || !session?.user || !isConnected}
                  className={
                    'w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ' +
                    (session?.user && isConnected
                      ? 'bg-violet-600 hover:bg-violet-500 text-white active:scale-[0.98]'
                      : 'bg-white/5 text-white/30 cursor-not-allowed')
                  }
                >
                  {status === 'linking' ? 'Linking...' : 'Link My X Handle to This Wallet'}
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
