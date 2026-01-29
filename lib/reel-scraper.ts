/**
 * Instagram Reel Scraping Engine
 * Extracts metadata from Instagram Reel URLs
 */

export interface ReelMetadata {
  caption: string
  hashtags: string[]
  creatorUsername: string
  thumbnailUrl: string
  audioName?: string
}

/**
 * Extract reel ID from Instagram URL
 */
export function extractReelId(url: string): string | null {
  try {
    // Match instagram.com/reel/ABC123 or instagram.com/p/ABC123
    const patterns = [
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Validate Instagram Reel URL
 */
export function validateReelUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com') &&
      (urlObj.pathname.includes('/reel/') || urlObj.pathname.includes('/p/'))
    )
  } catch {
    return false
  }
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

/**
 * Scrape Instagram Reel metadata
 * Uses oEmbed API and HTML parsing as fallback
 */
export async function scrapeReelMetadata(reelUrl: string): Promise<ReelMetadata> {
  try {
    const reelId = extractReelId(reelUrl)
    if (!reelId) {
      throw new Error('Invalid Instagram Reel URL format')
    }

    // Try oEmbed API first (more reliable)
    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(reelUrl)}`
      const oembedResponse = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json()
        
        // Extract username from author_url or title
        let creatorUsername = 'unknown'
        if (oembedData.author_url) {
          const usernameMatch = oembedData.author_url.match(/instagram\.com\/([^\/]+)/)
          if (usernameMatch) {
            creatorUsername = usernameMatch[1]
          }
        }

        // Extract hashtags from title/description
        const text = (oembedData.title || oembedData.description || '').toLowerCase()
        const hashtags = extractHashtags(text)

        // Get thumbnail
        const thumbnailUrl = oembedData.thumbnail_url || `https://www.instagram.com/p/${reelId}/media/?size=l`

        return {
          caption: oembedData.title || '',
          hashtags,
          creatorUsername,
          thumbnailUrl,
          audioName: undefined, // oEmbed doesn't provide audio info
        }
      }
    } catch (oembedError) {
      console.warn('[Reel Scraper] oEmbed failed, trying HTML fallback:', oembedError)
    }

    // Fallback: Try to fetch HTML and parse
    try {
      const htmlResponse = await fetch(reelUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        
        // Try to extract JSON-LD or meta tags
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)
        if (jsonLdMatch) {
          try {
            const jsonLd = JSON.parse(jsonLdMatch[1])
            const caption = jsonLd.caption || jsonLd.description || ''
            const hashtags = extractHashtags(caption)
            
            // Extract username from author or url
            let creatorUsername = 'unknown'
            if (jsonLd.author) {
              if (typeof jsonLd.author === 'string') {
                creatorUsername = jsonLd.author.replace('@', '')
              } else if (jsonLd.author.name) {
                creatorUsername = jsonLd.author.name.replace('@', '')
              }
            }

            return {
              caption,
              hashtags,
              creatorUsername,
              thumbnailUrl: jsonLd.image || `https://www.instagram.com/p/${reelId}/media/?size=l`,
              audioName: undefined,
            }
          } catch (parseError) {
            console.warn('[Reel Scraper] JSON-LD parse failed')
          }
        }

        // Fallback: Extract from meta tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
        const descriptionMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
        
        const caption = (titleMatch?.[1] || descriptionMatch?.[1] || '').trim()
        const hashtags = extractHashtags(caption)
        const thumbnailUrl = imageMatch?.[1] || `https://www.instagram.com/p/${reelId}/media/?size=l`

        // Try to extract username from URL or meta
        let creatorUsername = 'unknown'
        const usernameMatch = html.match(/"owner":\s*{\s*"username":\s*"([^"]+)"/) ||
                             html.match(/"username":\s*"([^"]+)"/)
        if (usernameMatch) {
          creatorUsername = usernameMatch[1]
        }

        return {
          caption,
          hashtags,
          creatorUsername,
          thumbnailUrl,
          audioName: undefined,
        }
      }
    } catch (htmlError) {
      console.warn('[Reel Scraper] HTML fallback failed:', htmlError)
    }

    // Last resort: Return minimal data
    return {
      caption: '',
      hashtags: [],
      creatorUsername: 'unknown',
      thumbnailUrl: `https://www.instagram.com/p/${reelId}/media/?size=l`,
      audioName: undefined,
    }
  } catch (error: any) {
    console.error('[Reel Scraper] Error scraping reel:', error)
    throw new Error(`Failed to scrape reel metadata: ${error.message}`)
  }
}

