'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LedgerEntry, LedgerStatus } from '@/lib/types';

export default function HomePage() {
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchLedgers = async () => {
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      setLedgers(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreated = (name: string) => {
    setShowCreate(false);
    fetchLedgers();
    showToast(`✓ Created "${name}"`);
  };

  const statusCounts = {
    intake: ledgers.filter(l => l.status === 'intake').length,
    active: ledgers.filter(l => l.status === 'active').length,
    shipped: ledgers.filter(l => l.status === 'shipped').length,
    archived: ledgers.filter(l => l.status === 'archived').length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="font-semibold text-lg">Campaign Deck</span>
            <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-900 rounded-full border border-zinc-800">
              Editorial OS
            </span>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            + New Project
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          {(['intake', 'active', 'shipped', 'archived'] as LedgerStatus[]).map((status) => (
            <div key={status} className="card px-4 py-3 flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wide px-2 py-1 rounded border status-${status}`}>
                {status}
              </span>
              <span className="text-2xl font-semibold">{statusCounts[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Channels</th>
                <th className="text-left px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : ledgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    No projects yet.{' '}
                    <button onClick={() => setShowCreate(true)} className="text-indigo-400 hover:underline">
                      Create one →
                    </button>
                  </td>
                </tr>
              ) : (
                ledgers.map((ledger) => (
                  <tr key={ledger.ledger_id} className="hover:bg-zinc-800/50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/ledger/${ledger.ledger_id}`} className="block">
                        <div className="font-medium">{ledger.project_name}</div>
                        <div className="text-xs text-zinc-500 mono">{ledger.ledger_id}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{ledger.owner.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded border status-${ledger.status}`}>
                        {ledger.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {ledger.channels.slice(0, 3).map((ch) => (
                          <span key={ch} className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                            {ch}
                          </span>
                        ))}
                        {ledger.channels.length > 3 && (
                          <span className="text-xs text-zinc-500">+{ledger.channels.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(ledger.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {/* Toast */}
      {toast && <div className="toast-success">{toast}</div>}
    </div>
  );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (name: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [channels, setChannels] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ledger/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: name,
          owner: { name: ownerName, email: ownerEmail },
          channels: channels.split(',').map(c => c.trim().toLowerCase()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create');
      }

      onCreated(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 animate-slide-up">
        <h2 className="text-lg font-semibold mb-4">New Project</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Q1 Brand Campaign"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Owner Name *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                placeholder="Sarah Chen"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Owner Email *</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                placeholder="sarah@company.com"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Channels</label>
            <input
              type="text"
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              placeholder="instagram, email, tiktok"
              className="input"
            />
            <p className="text-xs text-zinc-500 mt-1">Comma-separated</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
