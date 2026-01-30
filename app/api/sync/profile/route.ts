import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth-utils'
import { generateProfile } from '@/lib/ai-profile'
import { saveProfile, addSyncLog } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function POST() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    console.error('[SYNC_PROFILE] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await generateProfile()
    await saveProfile(profile)
    
    await addSyncLog({
      type: 'profile',
      status: 'success',
      message: 'Profile regenerated successfully',
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    await addSyncLog({
      type: 'profile',
      status: 'error',
      message: error.message || 'Failed to regenerate profile',
      timestamp: new Date(),
    })

    return NextResponse.json(
      { error: 'Failed to regenerate profile', message: error.message },
      { status: 500 }
    )
  }
}





