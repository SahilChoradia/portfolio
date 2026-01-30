import { NextResponse } from 'next/server'
import { getYouTubeVideos } from '@/lib/models'
import { fetchYouTubeVideos } from '@/lib/youtube'

export const dynamic = 'force-dynamic'

// HARDCODED CHANNEL ID: Just Peggy
const TRUSTED_CHANNEL_ID = 'UCDryEWPwjZFKL3CtAyqsxDA'

/**
 * SECURITY: Validate that a video's channelId matches the trusted channel ID
 * This is mandatory security logic and must not be removed or bypassed.
 * Only videos from the hardcoded TRUSTED_CHANNEL_ID are allowed.
 */
function validateVideoChannel(video: any): boolean {
  if (!video.channelId) {
    console.warn(`[API /youtube] REJECTED: Video ${video.videoId} has no channelId`)
    return false
  }
  
  if (video.channelId !== TRUSTED_CHANNEL_ID) {
    console.warn(`[API /youtube] REJECTED: Video ${video.videoId} channelId (${video.channelId}) does not match trusted channel ID (${TRUSTED_CHANNEL_ID})`)
    return false
  }
  
  return true
}

export async function GET() {
  try {
    // Try to get from database first
    const dbVideos = await getYouTubeVideos()
    
    // SECURITY: Even database videos must be re-validated against the trusted channel ID
    // This ensures no unauthorized content can persist in the database
    if (dbVideos.length > 0) {
      const validatedVideos = dbVideos.filter(video => validateVideoChannel(video))
      
      if (validatedVideos.length !== dbVideos.length) {
        const rejectedCount = dbVideos.length - validatedVideos.length
        console.warn(`[API /youtube] Rejected ${rejectedCount} videos from database that failed channel validation`)
      }
      
      if (validatedVideos.length > 0) {
        return NextResponse.json({ videos: validatedVideos })
      }
      
      // If all database videos were rejected, fall through to fetch fresh
      console.warn(`[API /youtube] All database videos failed validation, fetching fresh from API`)
    }
    
    // Otherwise, fetch fresh from API (with full debug info)
    const result = await fetchYouTubeVideos()
    
    if (result.error) {
      return NextResponse.json(
        { 
          videos: [],
          error: result.error,
          debug: result.debug
        },
        { status: 500 }
      )
    }
    
    // SECURITY: Final validation: ensure all returned videos pass channel validation
    // This is a double-check to ensure no unauthorized content slips through
    const finalVideos = result.videos.filter(video => validateVideoChannel(video))
    
    if (finalVideos.length !== result.videos.length) {
      console.error(`[API /youtube] CRITICAL: Some videos from fetchYouTubeVideos failed validation!`)
      return NextResponse.json(
        {
          videos: [],
          error: 'Blocked: Non-authorized channel content detected.',
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      videos: finalVideos,
      debug: result.debug
    })
  } catch (error: any) {
    console.error('[API /youtube] Error:', error)
    return NextResponse.json(
      { 
        videos: [],
        error: error.message || 'Failed to fetch videos',
        message: error.message
      },
      { status: 500 }
    )
  }
}
