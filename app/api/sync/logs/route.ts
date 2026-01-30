import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getSyncLogs } from '@/lib/models'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
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





