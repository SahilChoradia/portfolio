import clientPromise from './mongodb'
import { Profile, YouTubeVideo, InstagramPost } from './models'

export async function seedDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Seed Profile
    const profileCollection = db.collection<Profile>('profile')
    const existingProfile = await profileCollection.findOne({})
    
    if (!existingProfile) {
      await profileCollection.insertOne({
        bio: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai! Main videos banati hoon, art create karti hoon, aur apne journey ko share karti hoon. Meri creativity se main logon ko motivate karna chahti hoon.',
        tagline: 'Creating magic, one video at a time ✨',
        skills: [
          'Video Editing',
          'Digital Art',
          'Content Creation',
          'Storytelling',
          'Graphic Design',
          'Animation',
          'Photography',
          'Social Media Marketing'
        ],
        personality: 'Creative, passionate, aur always exploring new ideas! Main believe karti hoon ki art se duniya change ho sakti hai. Main ek curious soul hoon jo har din kuch naya seekhna chahti hai.',
        lastUpdated: new Date(),
        generatedAt: new Date(),
      })
      console.log('✅ Seeded profile data')
    }

    // Seed sample YouTube videos (placeholder structure)
    const youtubeCollection = db.collection<YouTubeVideo>('youtube_videos')
    const existingVideos = await youtubeCollection.countDocuments()
    
    if (existingVideos === 0) {
      // These will be replaced by actual API data
      console.log('📝 YouTube videos will be populated via API sync')
    }

    // Seed sample Instagram posts (placeholder structure)
    const instagramCollection = db.collection<InstagramPost>('instagram_posts')
    const existingPosts = await instagramCollection.countDocuments()
    
    if (existingPosts === 0) {
      // Instagram posts are configured in lib/instagram-config.ts
      // Add post URLs there, then sync via admin panel or API
      console.log('📝 Instagram posts: Add post URLs in lib/instagram-config.ts')
    }

    console.log('✅ Database seeding completed')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

