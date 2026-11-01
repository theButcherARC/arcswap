'use client'

import { authClient } from '@/lib/auth-client'
import { JoinWithXButton } from '@/components/auth/JoinWithXButton'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { TOKENS } from '@/constants/tokens'
import { useState, useEffect, useCallback } from 'react'

interface ProfileData {
  username: string
  name: string
  image: string
  vibeId: string
}

interface Extras {
  displayName: string
  bio: string
  telegram: string
}

const EMPTY_EXTRAS: Extras = { displayName: '', bio: '', telegram: '' }

export default function SocialProfilePage() {
  const { address, isConnected } = useAccount()
  const { data: balanceRaw, isLoading: balanceLoading } = useReadContract({
    address: TOKENS.USDC.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: 5042,
    query: { enabled: !!address, refetchInterval: 20000 },
  })
  const balanceText =
    balanceRaw === undefined
      ? null
      : Number(formatUnits(balanceRaw, TOKENS.USDC.decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })
  const { data: session, isPending } = authClient.useSession()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [extras, setExtras] = useState<Extras>(EMPTY_EXTRAS)
  const [form, setForm] = useState<Extras>(EMPTY_EXTRAS)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveNote, setSaveNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState('')

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

  const fetchExtras = useCallback(async () => {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      const next: Extras = {
        displayName: json.displayName ?? '',
        bio: json.bio ?? '',
        telegram: json.telegram ?? '',
      }
      setExtras(next)
      setForm(next)
    } catch {
      // Extras are optional; the X profile still carries the page.
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
      fetchExtras()
    }
  }, [session?.user?.id, fetchProfile, fetchExtras])

  async function handleLogout() {
    await authClient.signOut()
    setProfile(null)
    setProfileError(null)
    setMessage('')
    setStatus('idle')
    setExtras(EMPTY_EXTRAS)
    setForm(EMPTY_EXTRAS)
    setEditing(false)
  }

  async function handleSaveProfile() {
    setSaving(true)
    setSaveNote('')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not save profile.')
      const next: Extras = {
        displayName: json.displayName ?? '',
        bio: json.bio ?? '',
        telegram: json.telegram ?? '',
      }
      setExtras(next)
      setForm(next)
      setEditing(false)
      setSaveNote('Profile saved.')
      setTimeout(() => setSaveNote(''), 3000)
    } catch (err) {
      setSaveNote(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
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

  function copyText(key: string, value: string) {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const xConnected = !!session?.user
  const walletConnected = isConnected && !!address
  const canLink = xConnected && walletConnected && !fetchingProfile && status !== 'linking'
  const displayName = extras.displayName || profile?.name || session?.user?.name || ''
  const avatar = profile?.image || session?.user?.image || ''
  const [avatarStage, setAvatarStage] = useState(0)
  useEffect(() => {
    setAvatarStage(0)
  }, [avatar])
  const avatarSrc =
    avatarStage === 0 && avatar.includes('_normal.')
      ? avatar.replace('_normal.', '_400x400.')
      : avatar
  const publicUrl = profile?.username ? 'arcswap-lac.vercel.app/u/' + profile.username : ''

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="mono-label !text-[var(--fg-faint)]">ACCOUNT / PROFILE</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fg)]">Profile</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-muted)]">
            Your public VibeFlow identity. People pay you by your handle, not a raw address.
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* ── Profile header ─────────────────────────────────────────── */}
          <div className="border border-[var(--line)] bg-[var(--glass)] p-6">
            {isPending ? (
              <div className="h-24 animate-pulse bg-black/[0.06]" />
            ) : !xConnected ? (
              <div className="flex flex-col items-start gap-4">
                <p className="text-base font-semibold text-[var(--fg)]">Join with X to create your profile</p>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                  Your X username becomes your VibeID. One tap, no forms, and anyone can pay you by your handle.
                </p>
                <JoinWithXButton variant="hero" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {avatar && avatarStage < 2 ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarStage((stage) => (avatar.includes('_normal.') ? stage + 1 : 2))}
                        className="h-20 w-20 shrink-0 rounded-full border border-[var(--line)] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-bold text-[var(--accent)]">
                        {(displayName || 'V').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      {fetchingProfile && !profile ? (
                        <div className="h-6 w-40 animate-pulse rounded bg-[var(--glass-strong)]" />
                      ) : (
                        <p className="truncate text-[22px] font-bold leading-tight text-[var(--fg)]">{displayName || 'VibeFlow user'}</p>
                      )}
                      <p className="mt-0.5 truncate text-sm text-[var(--fg-muted)]">
                        {profile?.username ? '@' + profile.username : 'Connecting X...'}
                      </p>
                      {profile?.vibeId && (
                        <span className="mt-2 inline-block bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--accent)]">
                          {profile.vibeId}
                        </span>
                      )}
                      {isConnected && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--fg-muted)]">
                          <img src={TOKENS.USDC.logoURI} alt="USDC" className="h-4 w-4" />
                          <span className="font-mono font-semibold text-[var(--fg)]">
                            {balanceLoading ? '...' : balanceText ?? '—'} USDC
                          </span>
                          balance
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => { setForm(extras); setEditing(v => !v) }}
                      className="min-h-[44px] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
                    >
                      Edit profile
                    </button>
                    <button onClick={handleLogout} className="min-h-[44px] px-1 text-sm text-[var(--fg-faint)] transition-colors hover:text-[var(--fg)]">
                      Logout
                    </button>
                  </div>
                </div>

                {extras.bio ? (
                  <p className="mt-4 text-sm leading-relaxed text-[var(--fg)]">{extras.bio}</p>
                ) : (
                  !editing && (
                    <button onClick={() => { setForm(extras); setEditing(true) }} className="mt-4 text-sm text-[var(--fg-faint)] transition-colors hover:text-[var(--accent)]">
                      Add a bio
                    </button>
                  )
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[var(--fg-muted)]">
                  {extras.telegram && (
                    <a href={'https://t.me/' + extras.telegram} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)] hover:underline">
                      t.me/{extras.telegram}
                    </a>
                  )}
                  {status === 'success' && address && (
                    <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)} linked</span>
                  )}
                  <span>Payments open by handle</span>
                </div>

                {profileError && (
                  <p className="mt-4 border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">{profileError}</p>
                )}
                {saveNote && (
                  <p className="mt-4 border border-[rgba(39,117,202,0.25)] bg-[var(--accent-soft)] px-3 py-2 text-xs font-medium text-[var(--accent)]">{saveNote}</p>
                )}

                {editing && (
                  <div className="mt-5 flex flex-col gap-4 border-t border-[var(--line)] pt-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--fg-muted)]">Display name</label>
                      <input
                        value={form.displayName}
                        onChange={e => setForm({ ...form, displayName: e.target.value })}
                        maxLength={50}
                        placeholder={profile?.name || 'Your name'}
                        className="min-h-[44px] w-full border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--fg-muted)]">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={e => setForm({ ...form, bio: e.target.value })}
                        maxLength={160}
                        rows={3}
                        placeholder="What do you build, trade or create?"
                        className="w-full resize-none border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                      />
                      <p className="mt-1 text-right text-[11px] text-[var(--fg-faint)]">{form.bio.length}/160</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--fg-muted)]">Telegram</label>
                      <input
                        value={form.telegram}
                        onChange={e => setForm({ ...form, telegram: e.target.value })}
                        maxLength={40}
                        placeholder="username, without @"
                        className="min-h-[44px] w-full border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="min-h-[44px] bg-[var(--accent)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save profile'}
                      </button>
                      <button
                        onClick={() => { setForm(extras); setEditing(false) }}
                        className="min-h-[44px] px-3 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Public profile link ────────────────────────────────────── */}
          {xConnected && profile?.username && (
            <div className="border border-[var(--line)] bg-[var(--glass)] p-6">
              <p className="text-sm font-semibold text-[var(--fg)]">Your public profile</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">Share this link anywhere. It shows your handle, bio and payment identity.</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="min-w-0 flex-1 truncate border border-[var(--line)] bg-white px-3.5 py-3 font-mono text-sm text-[var(--fg)]">{publicUrl}</div>
                <button
                  onClick={() => copyText('link', 'https://' + publicUrl)}
                  className="min-h-[44px] shrink-0 border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
                >
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={'/u/' + profile.username}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] shrink-0 items-center border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
                >
                  View
                </a>
              </div>
            </div>
          )}

          {/* ── Payment identity ───────────────────────────────────────── */}
          {xConnected && (
            <div className="border border-[rgba(39,117,202,0.2)] bg-[var(--accent-soft)] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center bg-white text-xs font-bold text-[var(--accent)]">V</div>
                <span className="text-sm font-semibold text-[var(--fg)]">VibeID</span>
                <span className="ml-1 text-xs text-[var(--fg-faint)]">Unique Payment Identifier</span>
              </div>
              {fetchingProfile ? (
                <div className="h-12 animate-pulse bg-black/[0.06]" />
              ) : profile?.vibeId ? (
                <>
                  <div className="flex items-center justify-between gap-3 border border-[rgba(39,117,202,0.3)] bg-white px-4 py-3">
                    <div>
                      <p className="font-mono text-lg font-bold tracking-widest text-[var(--accent)]">{profile.vibeId}</p>
                      <p className="mt-0.5 text-xs text-[var(--fg-faint)]">Permanent · Cannot be changed</p>
                    </div>
                    <button
                      onClick={() => copyText('vibe', profile.vibeId)}
                      title="Copy VibeID"
                      className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(39,117,202,0.3)] bg-white text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                    >
                      {copied === 'vibe' ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--fg-muted)]">
                    Anyone can pay you using <span className="font-mono font-semibold text-[var(--accent)]">@{profile.username}</span> or this code in the Bulk Pay recipient field. Your wallet address fills in automatically once linked below.
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--fg-faint)]">Connect X to generate your VibeID.</p>
              )}
            </div>
          )}

          {/* ── Wallet ─────────────────────────────────────────────────── */}
          <div className="border border-[var(--line)] bg-[var(--glass)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={'flex h-7 w-7 items-center justify-center text-xs font-bold ' + (walletConnected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--glass-strong)] text-[var(--fg-muted)]')}>
                {walletConnected ? '✓' : '1'}
              </div>
              <span className="text-sm font-semibold text-[var(--fg)]">Wallet Address</span>
              <span className="ml-1 text-xs font-normal text-[var(--fg-faint)]">Primary Identity</span>
            </div>
            {walletConnected ? (
              <>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 border border-[rgba(39,117,202,0.2)] bg-[var(--accent-soft)] px-4 py-3">
                  <p className="break-all font-mono text-sm text-[var(--fg)]">{address}</p>
                  <p className="mt-0.5 text-xs text-[var(--fg-faint)]">Wallet connected</p>
                </div>
                <button
                  onClick={() => copyText('wallet', address ?? '')}
                  className="min-h-[44px] shrink-0 border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
                >
                  {copied === 'wallet' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                <img src={TOKENS.USDC.logoURI} alt="USDC" className="h-6 w-6" />
                <div>
                  <p className="font-mono text-lg font-semibold leading-tight text-[var(--fg)]">
                    {balanceLoading ? '...' : balanceText ?? '—'} USDC
                  </p>
                  <p className="text-xs text-[var(--fg-faint)]">
                    Balance · Arc Mainnet
                  </p>
                </div>
              </div>
              </>
            ) : (
              <p className="text-sm text-[var(--fg-faint)]">Use the &quot;Connect Wallet&quot; button in the header to connect your wallet.</p>
            )}
          </div>

          {/* ── Link handle to wallet ──────────────────────────────────── */}
          <div className="border border-[var(--line)] bg-[var(--glass)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={'flex h-7 w-7 items-center justify-center text-xs font-bold ' + (status === 'success' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--glass-strong)] text-[var(--fg-muted)]')}>
                {status === 'success' ? '✓' : '2'}
              </div>
              <span className="text-sm font-semibold text-[var(--fg)]">Link Handle to Wallet</span>
            </div>

            {status === 'success' ? (
              <div className="border border-[rgba(39,117,202,0.25)] bg-[var(--accent-soft)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--accent)]">Linked successfully</p>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{message}</p>
              </div>
            ) : (
              <>
                {status === 'error' && message && (
                  <div className="mb-3 border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                    <p className="text-sm text-rose-500">{message}</p>
                  </div>
                )}
                {profile?.username && (
                  <div className="mb-4 border border-[rgba(39,117,202,0.2)] bg-[var(--accent-soft)] px-4 py-3">
                    <p className="mb-1 text-xs text-[var(--fg-muted)]">X Handle (auto-detected)</p>
                    <p className="text-sm font-medium text-[var(--accent)]">@{profile.username}</p>
                  </div>
                )}
                <button
                  onClick={handleLinkWallet}
                  disabled={!canLink}
                  className={'flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ' + (canLink ? 'bg-[#0f1419] text-white hover:opacity-85' : 'cursor-not-allowed bg-[var(--glass-strong)] text-[var(--fg-faint)]')}
                >
                  {status === 'linking' && (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {status === 'linking' ? 'Linking...' : profile?.username ? `Link @${profile.username} to Wallet` : 'Link X Handle to This Wallet'}
                </button>
                {!xConnected || !walletConnected ? (
                  <p className="mt-2 text-center text-xs text-[var(--fg-faint)]">Connect X and your wallet first</p>
                ) : null}
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
