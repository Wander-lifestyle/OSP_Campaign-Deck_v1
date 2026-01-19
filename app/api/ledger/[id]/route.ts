import { NextRequest, NextResponse } from 'next/server';
import { getLedgerById, updateStatus } from '@/lib/store';
import { LedgerStatus } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ledger = getLedgerById(id);

  if (!ledger) {
    return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
  }

  return NextResponse.json(ledger);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status || !body.actor) {
      return NextResponse.json(
        { error: 'status and actor are required' },
        { status: 400 }
      );
    }

    const result = updateStatus(id, body.status as LedgerStatus, body.actor);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
