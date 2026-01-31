// Run this script to seed the database: node scripts/seed.js
require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Seed profile
    const profileCollection = db.collection('profile')
    const existingProfile = await profileCollection.findOne({})
    
    if (!existingProfile) {
      await profileCollection.insertOne({
        bio: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai! Main videos banati hoon, art create karti hoon, aur apne journey ko share karti hoon.',
        tagline: 'Creating magic, one video at a time ✨',
        skills: [
          'Video Editing',
          'Digital Art',
          'Content Creation',
          'Storytelling',
          'Graphic Design',
          'Animation'
        ],
        personality: 'Creative, passionate, aur always exploring new ideas!',
        lastUpdated: new Date(),
        generatedAt: new Date(),
      })
      console.log('✅ Seeded profile')
    }
    
    console.log('✅ Seeding complete')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

seed()







