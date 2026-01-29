import { NextResponse } from 'next/server'
import { getInstagramPosts } from '@/lib/instagram'
import { getInstagramPosts as getDBPosts } from '@/lib/models'

export async function GET() {
  try {
    // Get posts from config (primary source)
    const configPosts = getInstagramPosts()
    
    // Optionally merge with database posts (if any exist)
    // Database posts can override config posts
    const dbPosts = await getDBPosts()
    const dbPostMap = new Map(dbPosts.map(p => [p.postId, p]))
    
    // Merge: config posts first, then database posts (database overrides)
    const allPosts = [...configPosts]
    dbPosts.forEach(dbPost => {
      const index = allPosts.findIndex(p => p.postId === dbPost.postId)
      if (index >= 0) {
        allPosts[index] = dbPost
      } else {
        allPosts.push(dbPost)
      }
    })
    
    return NextResponse.json({ posts: allPosts })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch Instagram posts', message: error.message },
      { status: 500 }
    )
  }
}

