import { LedgerEntry, BriefInput, LedgerStatus, VALID_TRANSITIONS } from './types';
import { v4 as uuidv4 } from 'uuid';

// Use global to persist across hot reloads in dev
// In production, this resets per serverless instance but that's OK for demo
declare global {
  var ledgerStore: Map<string, LedgerEntry> | undefined;
}

// Initialize store with sample data
function initStore(): Map<string, LedgerEntry> {
  const store = new Map<string, LedgerEntry>();
  
  // Sample data
  const samples: LedgerEntry[] = [
    {
      ledger_id: 'ldg_sample_001',
      project_name: 'Q1 Brand Campaign',
      brief: {
        brief_id: 'brf_001',
        snapshot: { objective: 'Increase brand awareness by 25%' },
      },
      owner: { name: 'Sarah Chen', email: 'sarah@company.com' },
      channels: ['instagram', 'tiktok', 'email'],
      status: 'active',
      assets: [],
      outputs: [],
      events: [
        {
          event_id: 'evt_001',
          type: 'status_change',
          actor: 'sarah@company.com',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          payload: { from: 'intake', to: 'active' },
        },
      ],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      ledger_id: 'ldg_sample_002',
      project_name: 'Holiday Email Series',
      brief: {
        brief_id: 'brf_002',
        snapshot: { objective: 'Drive holiday sales' },
      },
      owner: { name: 'Mike Johnson', email: 'mike@company.com' },
      channels: ['email'],
      status: 'shipped',
      assets: [],
      outputs: [],
      events: [],
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      ledger_id: 'ldg_sample_003',
      project_name: 'Product Launch - Widget Pro',
      brief: {
        brief_id: 'brf_003',
        snapshot: { objective: 'Launch new product line' },
      },
      owner: { name: 'Alex Kim', email: 'alex@company.com' },
      channels: ['instagram', 'youtube', 'landing'],
      status: 'intake',
      assets: [],
      outputs: [],
      events: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  samples.forEach(s => store.set(s.ledger_id, s));
  return store;
}

// Get or create store
function getStore(): Map<string, LedgerEntry> {
  if (!global.ledgerStore) {
    global.ledgerStore = initStore();
  }
  return global.ledgerStore;
}

// CRUD operations
export function getAllLedgers(): LedgerEntry[] {
  const store = getStore();
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getLedgerById(id: string): LedgerEntry | null {
  return getStore().get(id) || null;
}

export function createLedger(input: BriefInput): LedgerEntry {
  const store = getStore();
  const now = new Date().toISOString();
  const ledgerId = `ldg_${uuidv4().slice(0, 8)}`;

  const entry: LedgerEntry = {
    ledger_id: ledgerId,
    project_name: input.project_name,
    brief: {
      brief_id: input.brief_id || `brf_${Date.now()}`,
      snapshot: input.snapshot || {},
    },
    owner: input.owner,
    channels: input.channels || [],
    status: 'intake',
    assets: [],
    outputs: [],
    events: [
      {
        event_id: `evt_${uuidv4().slice(0, 8)}`,
        type: 'created',
        actor: input.owner.email,
        timestamp: now,
        payload: {},
      },
    ],
    created_at: now,
    updated_at: now,
  };

  store.set(ledgerId, entry);
  return entry;
}

export function updateStatus(
  id: string, 
  newStatus: LedgerStatus, 
  actor: string
): LedgerEntry | { error: string } {
  const store = getStore();
  const entry = store.get(id);
  
  if (!entry) {
    return { error: 'Ledger not found' };
  }

  // Validate transition
  const validNext = VALID_TRANSITIONS[entry.status];
  if (!validNext.includes(newStatus)) {
    return { error: `Invalid transition: ${entry.status} → ${newStatus}` };
  }

  const now = new Date().toISOString();
  const oldStatus = entry.status;
  
  entry.status = newStatus;
  entry.updated_at = now;
  entry.events.push({
    event_id: `evt_${uuidv4().slice(0, 8)}`,
    type: 'status_change',
    actor,
    timestamp: now,
    payload: { from: oldStatus, to: newStatus },
  });

  store.set(id, entry);
  return entry;
}

// Slack notification (fire-and-forget)
export async function sendSlackNotification(
  projectName: string,
  status: string,
  actor: string,
  ledgerId: string
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `📊 *Campaign Deck*\n*${projectName}*\nStatus: ${status}\nBy: ${actor}\nID: \`${ledgerId}\``,
      }),
    });
    return true;
  } catch {
    return false;
  }
}
