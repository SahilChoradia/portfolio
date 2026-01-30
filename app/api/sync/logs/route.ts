import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth-utils'
import { getSyncLogs } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    console.error('[SYNC_LOGS] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const logs = await getSyncLogs(100)
    return NextResponse.json({ logs })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch logs', message: error.message },
      { status: 500 }
    )
  }
}





