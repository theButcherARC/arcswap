'use client'

import { useAccount } from 'wagmi'
import { useState } from 'react'
import useSWR from 'swr'

const ADMIN_WALLET = '0xa04C24A33Dd54cE8142319FEccDd9602C5D1AAaE'

interface SocialProfile {
  id: string
  username: string
  walletAddress: string
  verified: boolean
  addedByAdmin: boolean
  createdAt: string
}

async function fetchProfiles(url: string, wallet: string): Promise<SocialProfile[]> {
  const res = await fetch(url, {
    headers: { 'x-wallet-address': wallet },
  })
  if (!res.ok) throw new Error('Forbidden')
  return res.json()
}

export default function AdminSocialPage() {
  const { address, isConnected } = useAccount()
  const isAdmin =
    isConnected &&
    address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

  const { data: profiles, error, mutate } = useSWR(
    isAdmin ? ['/api/social/admin', address] : null,
    ([url, wallet]) => fetchProfiles(url, wallet as string),
    { revalidateOnFocus: false }
  )

  const [handle, setHandle] = useState('')
  const [wallet, setWallet] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [addMsg, setAddMsg] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddStatus('loading')
    setAddMsg('')
    try {
      const res = await fetch('/api/social/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address ?? '',
        },
        body: JSON.stringify({ username: handle, walletAddress: wallet }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setAddStatus('success')
      setAddMsg('@' + handle.replace(/^@/, '') + ' linked to ' + wallet.slice(0, 6) + '...' + wallet.slice(-4))
      setHandle('')
      setWallet('')
      mutate()
    } catch (err) {
      setAddStatus('error')
      setAddMsg(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  async function handleDelete(username: string) {
    await fetch('/api/social/admin', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': address ?? '',
      },
      body: JSON.stringify({ username }),
    })
    mutate()
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 text-center max-w-sm w-full">
          <p className="text-white/60 text-sm">Connect your admin wallet to access this page.</p>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-2xl p-8 text-center max-w-sm w-full">
          <p className="text-rose-400 text-sm font-medium">Access Denied</p>
          <p className="text-white/40 text-xs mt-1">This page is restricted to the admin wallet.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050508] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Admin - Social Profiles
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Manually add or remove X handle &rarr; wallet address mappings.
          </p>
        </div>

        {/* Add form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Add Mapping</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="@xhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
            />
            <input
              type="text"
              placeholder="0x... wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              required
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addStatus === 'loading'}
              className="whitespace-nowrap rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {addStatus === 'loading' ? 'Adding...' : 'Add'}
            </button>
          </form>
          {addMsg && (
            <p className={
              'mt-3 text-xs ' +
              (addStatus === 'success' ? 'text-emerald-400' : 'text-rose-400')
            }>
              {addMsg}
            </p>
          )}
        </div>

        {/* Profiles table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">
              Registered Handles
              {profiles && (
                <span className="ml-2 text-white/40 font-normal">({profiles.length})</span>
              )}
            </h2>
          </div>

          {!profiles && !error && (
            <div className="px-6 py-8 text-center text-sm text-white/40">Loading...</div>
          )}
          {error && (
            <div className="px-6 py-8 text-center text-sm text-rose-400">Failed to load profiles.</div>
          )}
          {profiles && profiles.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-white/40">No profiles yet.</div>
          )}
          {profiles && profiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Handle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Wallet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-violet-400 font-mono">
                        {'@' + p.username}
                      </td>
                      <td className="px-6 py-4 text-white/60 font-mono text-xs">
                        {p.walletAddress.slice(0, 6) + '...' + p.walletAddress.slice(-4)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                          (p.verified
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
                        }>
                          {p.verified ? 'Verified' : 'Admin-added'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(p.username)}
                          className="text-xs text-rose-400/60 hover:text-rose-400 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
