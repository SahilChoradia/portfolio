import { NextResponse } from 'next/server'
import { fetchYouTubeVideos } from '@/lib/youtube'

export async function GET() {
  try {
    const result = await fetchYouTubeVideos()
    
    return NextResponse.json({
      channelId: result.debug?.channelId || 'N/A',
      videosBeforeValidation: result.debug?.videosBeforeValidation || 0,
      videosAfterValidation: result.debug?.videosAfterValidation || 0,
      discardedCount: result.debug?.discardedCount || 0,
      rawSearchApiResponse: result.debug?.searchApiResponse || null,
      rawVideosApiResponse: result.debug?.videosApiResponse || null,
      parsedVideos: result.videos,
      videoCount: result.videos.length,
      validationPassed: result.debug?.validationPassed ?? true,
      error: result.error || null,
      debug: result.debug,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Unknown error',
        channelId: 'N/A',
        videosBeforeValidation: 0,
        videosAfterValidation: 0,
        discardedCount: 0,
        rawSearchApiResponse: null,
        rawVideosApiResponse: null,
        parsedVideos: [],
        videoCount: 0,
        validationPassed: false,
        debug: null,
      },
      { status: 500 }
    )
  }
}
