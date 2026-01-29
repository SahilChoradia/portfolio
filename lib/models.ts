import clientPromise from './mongodb'

export interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount: string
  duration: string
  url: string
  liveBroadcastContent?: string
  channelId: string // MANDATORY: Channel ID for strict validation - MUST match hardcoded channel ID: UCDryEWPwjZFKL3CtAyqsxDA
  isShort?: boolean // true if duration <= 60 seconds
  isVideo?: boolean // true if duration > 60 seconds
  isLive?: boolean // true if liveBroadcastContent === "live"
}

export interface InstagramPost {
  postId: string
  postUrl: string // Full Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)
  accountType: 'main' | 'art' // Which Instagram account this post belongs to
  timestamp: string
}

export interface Profile {
  _id?: string
  bio: string
  tagline: string
  skills: string[]
  personality: string
  lastUpdated: Date
  generatedAt: Date
}

export interface SyncLog {
  _id?: string
  type: 'youtube' | 'instagram' | 'profile'
  status: 'success' | 'error'
  message: string
  timestamp: Date
  data?: any
}

export interface ContactMessage {
  _id?: string
  name: string
  contactInfo: string // Mobile number or Instagram ID
  message: string
  status: 'new' | 'read'
  createdAt: Date
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<YouTubeVideo>('youtube_videos')
  return collection.find({}).sort({ publishedAt: -1 }).limit(6).toArray()
}

export async function saveYouTubeVideos(videos: YouTubeVideo[]): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<YouTubeVideo>('youtube_videos')
  
  await collection.deleteMany({})
  if (videos.length > 0) {
    await collection.insertMany(videos)
  }
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<InstagramPost>('instagram_posts')
  return collection.find({}).sort({ timestamp: -1 }).toArray()
}

export async function saveInstagramPost(post: InstagramPost): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<InstagramPost>('instagram_posts')
  
  const existing = await collection.findOne({ postId: post.postId })
  if (!existing) {
    await collection.insertOne(post)
  }
}

export async function getProfile(): Promise<Profile | null> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<Profile>('profile')
  return collection.findOne({})
}

export async function saveProfile(profile: Profile): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<Profile>('profile')
  
  const existing = await collection.findOne({})
  if (existing) {
    await collection.updateOne({ _id: existing._id }, { $set: profile })
  } else {
    await collection.insertOne(profile)
  }
}

export async function addSyncLog(log: Omit<SyncLog, '_id'>): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<SyncLog>('sync_logs')
  await collection.insertOne(log as SyncLog)
}

export async function getSyncLogs(limit: number = 50): Promise<SyncLog[]> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<SyncLog>('sync_logs')
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()
}

export async function saveContactMessage(message: Omit<ContactMessage, '_id' | 'createdAt'>): Promise<ContactMessage> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ContactMessage>('contact_messages')
  
  const newMessage: Omit<ContactMessage, '_id'> = {
    ...message,
    createdAt: new Date(),
  }
  
  const result = await collection.insertOne(newMessage as ContactMessage)
  return { ...newMessage, _id: result.insertedId } as ContactMessage
}

export async function getContactMessages(limit: number = 100): Promise<ContactMessage[]> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ContactMessage>('contact_messages')
  
  // Create index on createdAt if it doesn't exist
  await collection.createIndex({ createdAt: -1 })
  
  return collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray()
}

export async function updateMessageStatus(id: string, status: 'new' | 'read'): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ContactMessage>('contact_messages')
  
  const { ObjectId } = await import('mongodb')
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  )
}

export async function deleteContactMessage(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ContactMessage>('contact_messages')
  
  const { ObjectId } = await import('mongodb')
  await collection.deleteOne({ _id: new ObjectId(id) })
}

// Removed all playlist and channel caching logic - no longer needed
// Videos are now fetched directly using Search API with hardcoded channel ID

export interface ReelAnalysis {
  _id?: string
  reelUrl: string
  caption: string
  hashtags: string[]
  creatorUsername: string
  thumbnailUrl: string
  audioName?: string
  aiAnalysis: {
    topic: string
    language: string
    tone: string
    keywords: string[]
    audience: string
    viralityScore: number
    improvementIdeas: string[]
    recommendedHashtags: string[]
  }
  competitors: Array<{
    username: string
    reelUrl: string
    reason: string
  }>
  createdAt: Date
}

export async function saveReelAnalysis(analysis: Omit<ReelAnalysis, '_id' | 'createdAt'>): Promise<ReelAnalysis> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ReelAnalysis>('reel_analyses')
  
  // Create indexes if they don't exist
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex({ reelUrl: 1 }, { unique: true })
  
  // Check for existing analysis
  const existing = await collection.findOne({ reelUrl: analysis.reelUrl })
  
  if (existing) {
    // Update existing analysis
    const updated = {
      ...analysis,
      createdAt: existing.createdAt, // Preserve original creation date
    }
    await collection.updateOne(
      { _id: existing._id },
      { $set: updated }
    )
    return { ...updated, _id: existing._id } as ReelAnalysis
  } else {
    // Insert new analysis
    const newAnalysis: Omit<ReelAnalysis, '_id'> = {
      ...analysis,
      createdAt: new Date(),
    }
    const result = await collection.insertOne(newAnalysis as ReelAnalysis)
    return { ...newAnalysis, _id: result.insertedId } as ReelAnalysis
  }
}

export async function getReelAnalysis(reelUrl: string): Promise<ReelAnalysis | null> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ReelAnalysis>('reel_analyses')
  return collection.findOne({ reelUrl })
}

export async function getAllReelAnalyses(limit: number = 50): Promise<ReelAnalysis[]> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection<ReelAnalysis>('reel_analyses')
  return collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray()
}

