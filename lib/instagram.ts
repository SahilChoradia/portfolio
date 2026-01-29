import { InstagramPost } from './models'
import { INSTAGRAM_POSTS, extractPostIdFromUrl } from './instagram-config'

/**
 * Get Instagram posts from configuration
 * No API calls - just returns post URLs from config
 */
export function getInstagramPosts(): InstagramPost[] {
  const posts: InstagramPost[] = []
  const now = new Date().toISOString()

  // Add main account posts
  INSTAGRAM_POSTS.main.forEach((postUrl, index) => {
    const postId = extractPostIdFromUrl(postUrl)
    if (postId) {
      posts.push({
        postId: `main-${postId}`,
        postUrl,
        accountType: 'main',
        timestamp: new Date(Date.now() - index * 86400000).toISOString(), // Stagger timestamps
      })
    }
  })

  // Add art account posts
  INSTAGRAM_POSTS.art.forEach((postUrl, index) => {
    const postId = extractPostIdFromUrl(postUrl)
    if (postId) {
      posts.push({
        postId: `art-${postId}`,
        postUrl,
        accountType: 'art',
        timestamp: new Date(Date.now() - (INSTAGRAM_POSTS.main.length + index) * 86400000).toISOString(),
      })
    }
  })

  // Sort by timestamp (newest first)
  return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Re-export helper for convenience
export { extractPostIdFromUrl } from './instagram-config'

