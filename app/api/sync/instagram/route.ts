import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth-utils'
import { getInstagramPosts } from '@/lib/instagram'
import { saveInstagramPost, addSyncLog } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function POST() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    console.error('[SYNC_INSTAGRAM] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get posts from config (no API calls)
    const posts = getInstagramPosts()
    
    // Save to database for caching/override capability
    for (const post of posts) {
      await saveInstagramPost(post)
    }
    
    await addSyncLog({
      type: 'instagram',
      status: 'success',
      message: `Synced ${posts.length} Instagram posts from config`,
      timestamp: new Date(),
      data: { count: posts.length },
    })

    return NextResponse.json({ success: true, count: posts.length })
  } catch (error: any) {
    await addSyncLog({
      type: 'instagram',
      status: 'error',
      message: error.message || 'Failed to sync Instagram posts',
      timestamp: new Date(),
    })

    return NextResponse.json(
      { error: 'Failed to sync Instagram posts', message: error.message },
      { status: 500 }
    )
  }
}

