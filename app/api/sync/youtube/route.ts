import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth-utils'
import { fetchYouTubeVideos } from '@/lib/youtube'
import { saveYouTubeVideos, addSyncLog } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function POST() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    console.error('[SYNC_YOUTUBE] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await fetchYouTubeVideos()
    
    if (result.error) {
      await addSyncLog({
        type: 'youtube',
        status: 'error',
        message: result.error,
        timestamp: new Date(),
        data: { debug: result.debug },
      })

      return NextResponse.json(
        { 
          error: 'Failed to sync YouTube videos', 
          message: result.error,
          debug: result.debug
        },
        { status: 500 }
      )
    }
    
    await saveYouTubeVideos(result.videos)
    
    await addSyncLog({
      type: 'youtube',
      status: 'success',
      message: `Manually synced ${result.videos.length} videos`,
      timestamp: new Date(),
      data: { count: result.videos.length, debug: result.debug },
    })

    return NextResponse.json({ 
      success: true, 
      count: result.videos.length,
      debug: result.debug
    })
  } catch (error: any) {
    console.error('[Sync YouTube] Unexpected error:', error)
    await addSyncLog({
      type: 'youtube',
      status: 'error',
      message: error.message || 'Failed to sync YouTube videos',
      timestamp: new Date(),
    })

    return NextResponse.json(
      { error: 'Failed to sync YouTube videos', message: error.message },
      { status: 500 }
    )
  }
}

