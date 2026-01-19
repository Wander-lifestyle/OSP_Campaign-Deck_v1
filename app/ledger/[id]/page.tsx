'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LedgerEntry } from '@/lib/types'

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [ledger, setLedger] = useState<LedgerEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/ledger/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch ledger')
        const data = await res.json()
        setLedger(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLedger(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLedger()
  }, [params.id])

  if (loading) {
    return (
      <section className="p-8">
        <p className="text-slate-600">Loading ledger…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="p-8">
        <p className="text-red-600">Error: {error}</p>
        <Link href="/ledger" className="text-blue-600 hover:underline mt-4 block">
          ← Back to ledger list
        </Link>
      </section>
    )
  }

  if (!ledger) {
    return (
      <section className="p-8">
        <p className="text-slate-600">Ledger not found.</p>
        <Link href="/ledger" className="text-blue-600 hover:underline mt-4 block">
          ← Back to ledger list
        </Link>
      </section>
    )
  }

  return (
    <section className="p-8 space-y-6">
      <div>
        <Link href="/ledger" className="text-blue-600 hover:underline text-sm">
          ← Back to ledger
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{ledger.project_name}</h1>
        <p className="text-slate-600 text-sm">Ledger ID: {ledger.ledger_id}</p>
      </div>
    </section>
  )
}
