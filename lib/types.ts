export type LedgerStatus = 'intake' | 'active' | 'shipped' | 'archived';

export interface LedgerEntry {
  ledger_id: string;
  project_name: string;
  brief: {
    brief_id: string;
    snapshot: Record<string, unknown>;
  };
  owner: {
    name: string;
    email: string;
  };
  channels: string[];
  status: LedgerStatus;
  assets: Asset[];
  outputs: Output[];
  events: LedgerEvent[];
  created_at: string;
  updated_at: string;
}

export interface Asset {
  asset_id: string;
  dam_ref: string;
  asset_type: string;
  filename: string;
  added_at: string;
  added_by: string;
}

export interface Output {
  output_id: string;
  variant_ref: string;
  channel: string;
  status: string;
  created_at: string;
}

export interface LedgerEvent {
  event_id: string;
  type: string;
  actor: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface BriefInput {
  brief_id?: string;
  project_name: string;
  owner: {
    name: string;
    email: string;
  };
  channels?: string[];
  snapshot?: Record<string, unknown>;
}

// Valid state transitions
export const VALID_TRANSITIONS: Record<LedgerStatus, LedgerStatus[]> = {
  intake: ['active'],
  active: ['shipped'],
  shipped: ['archived'],
  archived: [],
};
