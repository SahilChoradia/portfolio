import { NextResponse } from 'next/server'
import { generateProfile } from '@/lib/ai-profile'
import { saveProfile, addSyncLog } from '@/lib/models'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await generateProfile()
    await saveProfile(profile)
    
    await addSyncLog({
      type: 'profile',
      status: 'success',
      message: 'Profile generated successfully',
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    await addSyncLog({
      type: 'profile',
      status: 'error',
      message: error.message || 'Failed to generate profile',
      timestamp: new Date(),
    })

    return NextResponse.json(
      { error: 'Failed to generate profile', message: error.message },
      { status: 500 }
    )
  }
}



