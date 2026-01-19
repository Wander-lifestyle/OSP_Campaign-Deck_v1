import { NextResponse } from 'next/server';
import { getAllLedgers } from '@/lib/store';

export async function GET() {
  const ledgers = getAllLedgers();
  return NextResponse.json(ledgers);
}
