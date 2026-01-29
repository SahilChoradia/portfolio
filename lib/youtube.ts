import { YouTubeVideo } from './models'

// HARDCODED CHANNEL ID: Just Peggy
const TRUSTED_CHANNEL_ID = 'UCDryEWPwjZFKL3CtAyqsxDA'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// MANDATORY SECURITY CHECK: Fail fast if YOUTUBE_API_KEY is missing
if (!YOUTUBE_API_KEY) {
  throw new Error('CRITICAL: YOUTUBE_API_KEY environment variable is required. Application cannot start without it.')
}

/**
 * Parse ISO 8601 duration (e.g., "PT1H2M10S") into total seconds
 * This is used to classify videos as Shorts (<=60s) or regular Videos (>60s)
 */
function parseISODuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  
  return hours * 3600 + minutes * 60 + seconds
}

export interface YouTubeFetchResult {
  videos: YouTubeVideo[]
  error?: string
  debug?: {
    channelId: string
    searchApiResponse?: any
    videosApiResponse?: any
    videosBeforeValidation?: number
    videosAfterValidation?: number
    acceptedVideos?: number
    rejectedVideos?: number
    discardedCount?: number
    videoCount: number
    validationPassed?: boolean
  }
}

export async function fetchYouTubeVideos(): Promise<YouTubeFetchResult> {
  console.log(`[YouTube] ========== Starting YouTube fetch ==========`)
  console.log(`[YouTube] TRUSTED_CHANNEL_ID: ${TRUSTED_CHANNEL_ID}`)
  console.log(`[YouTube] YOUTUBE_API_KEY: ${YOUTUBE_API_KEY ? '[SET]' : '[NOT SET]'}`)

  if (!YOUTUBE_API_KEY) {
    const error = 'YOUTUBE_API_KEY is not set'
    console.error(`[YouTube] ${error}`)
    throw new Error(error)
  }

  const debug: YouTubeFetchResult['debug'] = {
    channelId: TRUSTED_CHANNEL_ID,
    videoCount: 0,
  }

  try {
    // STEP 1: Fetch videos using Search API with channelId filter
    console.log(`[YouTube] STEP 1: Fetching videos using Search API for channel: ${TRUSTED_CHANNEL_ID}`)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${TRUSTED_CHANNEL_ID}&order=date&maxResults=12&type=video&key=${YOUTUBE_API_KEY}`
    const searchApiUrl = searchUrl.replace(YOUTUBE_API_KEY, '[API_KEY]')
    console.log(`[YouTube] STEP 1: Search API URL: ${searchApiUrl}`)
    
    const searchResponse = await fetch(searchUrl)

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}))
      console.error(`[YouTube] STEP 1: Search API failed:`, {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        error: errorData
      })
      debug.searchApiResponse = errorData
      throw new Error(`Failed to fetch videos from Search API: ${errorData.error?.message || searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()
    debug.searchApiResponse = searchData

    const searchItemsCount = searchData.items?.length || 0
    console.log(`[YouTube] STEP 1: Number of videos found: ${searchItemsCount}`)

    if (!searchData.items || searchData.items.length === 0) {
      const error = 'No videos found in Search API response'
      console.warn(`[YouTube] STEP 1: ${error}`)
      debug.videoCount = 0
      return {
        videos: [],
        error: 'No verified Just Peggy videos found.',
        debug
      }
    }

    // STEP 2: Extract video IDs from search results
    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter((id: string | undefined) => id)
      .join(',')
    
    const extractedVideoIdsCount = videoIds.split(',').filter((id: string) => id).length
    console.log(`[YouTube] STEP 2: Total video IDs extracted: ${extractedVideoIdsCount}`)

    if (!videoIds) {
      const error = 'No valid video IDs found in search results'
      console.warn(`[YouTube] STEP 2: ${error}`)
      debug.videoCount = 0
      return {
        videos: [],
        error: 'No verified Just Peggy videos found.',
        debug
      }
    }

    // STEP 3: Fetch detailed video information
    console.log(`[YouTube] STEP 3: Fetching detailed video information for ${extractedVideoIdsCount} videos`)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    const videosApiUrl = videosUrl.replace(YOUTUBE_API_KEY, '[API_KEY]')
    console.log(`[YouTube] STEP 3: Videos API URL: ${videosApiUrl}`)
    
    const videosResponse = await fetch(videosUrl)

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json().catch(() => ({}))
      console.error(`[YouTube] STEP 3: Videos API failed:`, {
        status: videosResponse.status,
        statusText: videosResponse.statusText,
        error: errorData
      })
      debug.videosApiResponse = errorData
      throw new Error(`Failed to fetch video details: ${errorData.error?.message || videosResponse.statusText}`)
    }

    const videosData = await videosResponse.json()
    debug.videosApiResponse = videosData

    const videosDataCount = videosData.items?.length || 0
    console.log(`[YouTube] STEP 3: Number of video details fetched: ${videosDataCount}`)
    debug.videosBeforeValidation = videosDataCount

    if (!videosData.items || videosData.items.length === 0) {
      const error = 'No video details found'
      console.warn(`[YouTube] STEP 3: ${error}`)
      debug.videoCount = 0
      return {
        videos: [],
        error: 'No verified Just Peggy videos found.',
        debug
      }
    }

    // STEP 4: HARD FILTER - MANDATORY CHANNEL VALIDATION
    // SECURITY: This is mandatory security logic and must not be removed.
    // Only videos from the hardcoded TRUSTED_CHANNEL_ID are allowed.
    // NEVER trust title, hashtags, description, or thumbnails - only official channelId fields.
    console.log(`[YouTube] ========== STEP 4: HARD FILTER - CHANNEL VALIDATION ==========`)
    console.log(`[YouTube] STEP 4: TRUSTED_CHANNEL_ID: ${TRUSTED_CHANNEL_ID}`)
    console.log(`[YouTube] STEP 4: Filtering ${videosDataCount} videos`)
    console.log(`[YouTube] STEP 4: Requirements:`)
    console.log(`[YouTube] STEP 4:   - video.snippet.channelId MUST equal ${TRUSTED_CHANNEL_ID}`)
    console.log(`[YouTube] STEP 4: If it fails → DISCARD video immediately`)
    
    const videos: YouTubeVideo[] = []
    const acceptedVideos: string[] = []
    const rejectedVideos: Array<{ videoId: string; channelId: string; reason: string }> = []
    let validationPassed = true

    for (const video of videosData.items) {
      const videoId = video.id
      const videoChannelId = video.snippet?.channelId
      
      // HARD FILTER CHECK: channelId MUST match the trusted channel ID
      // This is the primary security check - no exceptions
      if (!videoChannelId) {
        const reason = 'Video has no channelId field'
        console.warn(`[YouTube] STEP 4: REJECTED - Video ${videoId}: ${reason}`)
        rejectedVideos.push({ videoId, channelId: 'MISSING', reason })
        validationPassed = false
        continue
      }
      
      // SECURITY: Validate against the TRUSTED_CHANNEL_ID
      // This is the TRUSTED SOURCE OF TRUTH - no other channel IDs are acceptable
      // MANDATORY: This validation logic must not be removed or bypassed
      if (videoChannelId !== TRUSTED_CHANNEL_ID) {
        const reason = `channelId (${videoChannelId}) does not match trusted channel ID (${TRUSTED_CHANNEL_ID})`
        console.warn(`[YouTube] STEP 4: REJECTED - Video ${videoId}: ${reason}`)
        rejectedVideos.push({ videoId, channelId: videoChannelId, reason })
        validationPassed = false
        continue
      }

      // SECURITY: CHANNEL VALIDATION PASSED - Video is verified from the trusted channel
      // This video has passed all mandatory security validations
      console.log(`[YouTube] STEP 4: ACCEPTED - Video ${videoId} passed channel validation`)
      acceptedVideos.push(videoId)
      
      // Parse duration and classify content type for UI filtering
      const durationStr = video.contentDetails?.duration || ''
      const durationSeconds = parseISODuration(durationStr)
      const liveBroadcastContent = video.snippet.liveBroadcastContent || 'none'
      
      // Content type classification:
      // - isShort: duration <= 60 seconds (YouTube Shorts)
      // - isVideo: duration > 60 seconds (regular videos)
      // - isLive: liveBroadcastContent === "live" (live streams)
      const isShort = durationSeconds > 0 && durationSeconds <= 60
      const isVideo = durationSeconds > 60
      const isLive = liveBroadcastContent === 'live'
      
      videos.push({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description?.substring(0, 200) || '',
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || '',
        publishedAt: video.snippet.publishedAt,
        viewCount: video.statistics?.viewCount || '0',
        duration: durationStr,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        liveBroadcastContent,
        channelId: videoChannelId, // Store channelId for frontend validation
        isShort,
        isVideo,
        isLive,
      })
    }

    const acceptedCount = videos.length
    const rejectedCount = rejectedVideos.length
    
    console.log(`[YouTube] ========== STEP 4: FILTERING COMPLETE ==========`)
    console.log(`[YouTube] STEP 4: Total fetched videos: ${videosDataCount}`)
    console.log(`[YouTube] STEP 4: ACCEPTED videos: ${acceptedCount}`)
    console.log(`[YouTube] STEP 4: REJECTED videos: ${rejectedCount}`)
    if (acceptedCount > 0) {
      console.log(`[YouTube] STEP 4: Accepted video IDs: ${acceptedVideos.join(', ')}`)
    }
    if (rejectedCount > 0) {
      console.warn(`[YouTube] STEP 4: Rejected videos:`)
      rejectedVideos.forEach(({ videoId, channelId, reason }) => {
        console.warn(`[YouTube] STEP 4:   - Video ${videoId} (channelId: ${channelId}): ${reason}`)
      })
    }
    
    debug.videoCount = acceptedCount
    debug.videosAfterValidation = acceptedCount
    debug.acceptedVideos = acceptedCount
    debug.rejectedVideos = rejectedCount
    debug.discardedCount = rejectedCount
    debug.validationPassed = validationPassed

    // FAIL SAFE: If ALL videos fail validation, throw a fatal error
    // This prevents any unauthorized content from being displayed
    if (videos.length === 0 && videosDataCount > 0) {
      const error = 'Blocked: Non-authorized channel content detected.'
      console.error(`[YouTube] STEP 4: FATAL ERROR - No videos passed validation`)
      console.error(`[YouTube] STEP 4: All ${videosDataCount} videos were rejected`)
      console.error(`[YouTube] STEP 4: This is a security measure - only videos from ${TRUSTED_CHANNEL_ID} are allowed`)
      throw new Error(error)
    }
    
    // If no videos were returned from API, return empty array (not an error)
    if (videos.length === 0) {
      console.warn(`[YouTube] STEP 4: No videos found in API response`)
      return {
        videos: [],
        error: 'No verified Just Peggy videos found.',
        debug
      }
    }

    console.log(`[YouTube] ========== YouTube fetch completed ==========`)
    console.log(`[YouTube] Final result: ${acceptedCount} verified videos from TRUSTED_CHANNEL_ID: ${TRUSTED_CHANNEL_ID}`)
    console.log(`[YouTube] Validation passed: ${validationPassed}`)
    
    return {
      videos,
      debug
    }
  } catch (error: any) {
    console.error('[YouTube] ========== YouTube fetch error ==========')
    console.error('[YouTube] Error message:', error.message)
    console.error('[YouTube] Error stack:', error.stack)
    console.error('[YouTube] Full error object:', error)
    console.error('[YouTube] ===========================================')
    
    return {
      videos: [],
      error: error.message || 'Failed to fetch YouTube videos',
      debug
    }
  }
}
