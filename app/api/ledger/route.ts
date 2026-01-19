import { NextRequest, NextResponse } from 'next/server'
import { getAllLedgers, createLedger } from '@/lib/store'

export async function GET() {
  const ledgers = getAllLedgers()
  return NextResponse.json(ledgers)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Expecting: { project_name, owner, snapshot }
    if (!body.project_name || !body.owner || !body.owner.email) {
      return NextResponse.json(
        { error: 'project_name and owner (with email) are required' },
        { status: 400 }
      )
    }

    const entry = createLedger({
      project_name: body.project_name,
      owner: body.owner,
      channels: body.channels || [],
      snapshot: body.snapshot || {},
      brief_id: body.brief_id,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Create ledger error', error)
    return NextResponse.json(
      { error: 'Failed to create ledger' },
      { status: 500 }
    )
  }
}
