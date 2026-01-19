'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LedgerEntry, VALID_TRANSITIONS, LedgerStatus } from '@/lib/types';

export default function LedgerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [ledger, setLedger] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/ledger/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setLedger(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const advanceStatus = async () => {
    if (!ledger) return;
    const nextStatuses = VALID_TRANSITIONS[ledger.status];
    if (nextStatuses.length === 0) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/ledger/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatuses[0],
          actor: ledger.owner.email,
        }),
      });
      const data = await res.json();
      if (!data.error) setLedger(data);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-zinc-500">
        <p>Ledger not found</p>
        <Link href="/" className="text-indigo-400 mt-2">← Back to list</Link>
      </div>
    );
  }

  const nextStatus = VALID_TRANSITIONS[ledger.status][0];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-500 hover:text-white">
              ← Back
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="font-semibold">{ledger.project_name}</span>
          </div>
          {nextStatus && (
            <button
              onClick={advanceStatus}
              disabled={updating}
              className="btn btn-primary disabled:opacity-50"
            >
              {updating ? 'Updating...' : `Move to ${nextStatus}`}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Status + Meta */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">{ledger.project_name}</h1>
              <p className="text-sm text-zinc-500 mono mt-1">{ledger.ledger_id}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1.5 rounded border status-${ledger.status}`}>
              {ledger.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Owner</h3>
              <p>{ledger.owner.name}</p>
              <p className="text-sm text-zinc-500">{ledger.owner.email}</p>
            </div>
            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Channels</h3>
              <div className="flex flex-wrap gap-1">
                {ledger.channels.map(ch => (
                  <span key={ch} className="text-xs bg-zinc-800 px-2 py-1 rounded">{ch}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brief Snapshot */}
        {ledger.brief.snapshot && Object.keys(ledger.brief.snapshot).length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Brief Snapshot</h2>
            <pre className="text-sm bg-zinc-950 p-4 rounded overflow-auto mono">
              {JSON.stringify(ledger.brief.snapshot, null, 2)}
            </pre>
          </div>
        )}

        {/* Events */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Events ({ledger.events.length})</h2>
          {ledger.events.length === 0 ? (
            <p className="text-zinc-500 text-sm">No events yet</p>
          ) : (
            <div className="space-y-2">
              {ledger.events.map((evt) => (
                <div key={evt.event_id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <span className="text-zinc-300">{evt.type}</span>
                    <span className="text-zinc-500 ml-2">by {evt.actor}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
