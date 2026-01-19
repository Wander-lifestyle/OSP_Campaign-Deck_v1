import { NextRequest, NextResponse } from 'next/server';
import { createLedger, sendSlackNotification } from '@/lib/store';
import { BriefInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: BriefInput = await request.json();

    // Validate required fields
    if (!body.project_name) {
      return NextResponse.json(
        { error: 'project_name is required' },
        { status: 400 }
      );
    }

    if (!body.owner?.name || !body.owner?.email) {
      return NextResponse.json(
        { error: 'owner.name and owner.email are required' },
        { status: 400 }
      );
    }

    // Create the ledger entry
    const entry = createLedger(body);

    // Send Slack notification (non-blocking)
    sendSlackNotification(
      entry.project_name,
      entry.status,
      entry.owner.email,
      entry.ledger_id
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      ledger_id: entry.ledger_id,
      entry,
    }, { status: 201 });
  } catch (error) {
    console.error('[Create Ledger] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ledger' },
      { status: 500 }
    );
  }
}
