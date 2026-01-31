// Instagram post URLs configuration
// Add your Instagram post URLs here. You can get these by copying the URL from any Instagram post.
// Format: https://www.instagram.com/p/{POST_ID}/

export const INSTAGRAM_POSTS = {
  main: [
    // Add main Instagram account post URLs here
    // Example: 'https://www.instagram.com/p/ABC123xyz/',
  ],
  art: [
    // Add art Instagram account post URLs here
    // Example: 'https://www.instagram.com/p/XYZ789abc/',
  ],
}

// Helper to extract post ID from URL
export function extractPostIdFromUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// Helper to get embed URL for a post ID
export function getEmbedUrl(postId: string): string {
  return `https://www.instagram.com/p/${postId}/embed`
}







