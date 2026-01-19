'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LedgerEntry } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()

  // Form state
  const [projectName, setProjectName] = useState('')
  const [objective, setObjective] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ledger list
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([])
  const [loadingLedgers, setLoadingLedgers] = useState(true)

  // Load existing ledgers for the table
  useEffect(() => {
    const loadLedgers = async () => {
      try {
        const res = await fetch('/api/ledger')
        if (!res.ok) throw new Error('Failed to load ledgers')
        const data = await res.json()
        setLedgers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingLedgers(false)
      }
    }

    loadLedgers()
  }, [])

  // Handle brief form submit
  const handleCreateBrief = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Very simple validation
    if (!projectName || !objective || !ownerName || !ownerEmail) {
      setError('Please fill in all fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ledger/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          owner: { name: ownerName, email: ownerEmail },
          snapshot: { objective },
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to create brief')
      }

      const created: LedgerEntry = await res.json()

      // Go to the detail page for the new ledger
      router.push(`/ledger/${created.ledger_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Campaign Deck</h1>
        </header>

        {/* Brief form */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create basic brief</h2>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <form className="space-y-4" onSubmit={handleCreateBrief}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Project name</label>
                <input
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Q1 Brand Campaign"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Objective</label>
                <input
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Increase brand awareness by 25%"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Owner name</label>
                <input
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Sarah Chen"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Owner email</label>
                <input
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="sarah@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-sm font-medium"
            >
              {submitting ? 'Creating…' : 'Create brief'}
            </button>
          </form>
        </section>

        {/* Ledger table */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Campaigns</h2>

          {loadingLedgers ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : ledgers.length === 0 ? (
            <p className="text-sm text-slate-400">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="py-2">Project</th>
                    <th className="py-2">Owner</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Channels</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((ledger) => (
                    <tr
                      key={ledger.ledger_id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => router.push(`/ledger/${ledger.ledger_id}`)}
                    >
                      <td className="py-2">
                        <div className="font-medium">
                          {ledger.project_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ledger.ledger_id}
                        </div>
                      </td>
                      <td className="py-2">
                        <div>{ledger.owner.name}</div>
                        <div className="text-xs text-slate-500">
                          {ledger.owner.email}
                        </div>
                      </td>
                      <td className="py-2 capitalize">{ledger.status}</td>
                      <td className="py-2 text-xs">
                        {ledger.channels.slice(0, 3).join(', ')}
                        {ledger.channels.length > 3 &&
                          ` +${ledger.channels.length - 3}`}
                      </td>
                      <td className="py-2 text-xs">
                        {new Date(ledger.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
