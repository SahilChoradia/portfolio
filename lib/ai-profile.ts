import OpenAI from 'openai'
import { Profile } from './models'
import { getYouTubeVideos } from './models'
import { getInstagramPosts } from './models'

export async function generateProfile(): Promise<Profile> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  // Lazy-load OpenAI client to avoid build-time errors
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    // Fetch current content
    const videos = await getYouTubeVideos()
    const posts = await getInstagramPosts()

    // Build context for AI
    const videoTitles = videos.map(v => v.title).join(', ')
    const videoDescriptions = videos.map(v => v.description).join(' ')

    const prompt = `You are creating a Hinglish (Hindi + English mix) bio for Peggy, a YouTuber and Artist.

Context:
- YouTube Channel: @justpeggyy
- Instagram Main: @nidhi_rajakk
- Instagram Art: @nidhi_innovations
- Recent Video Titles: ${videoTitles}
- Video Content: ${videoDescriptions}

Generate a creative, engaging profile in Hinglish that:
1. Bio: A 3-4 sentence bio mixing Hindi and English naturally, describing Peggy as a creative YouTuber and artist
2. Tagline: A catchy one-liner in Hinglish
3. Skills: Array of 6-8 skills (mix of Hindi and English terms)
4. Personality: A 2-3 sentence description of personality traits in Hinglish

Return ONLY valid JSON in this exact format:
{
  "bio": "string",
  "tagline": "string",
  "skills": ["string", "string"],
  "personality": "string"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a creative content writer specializing in Hinglish (Hindi-English mix) content for social media creators.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response')
    }

    const profileData = JSON.parse(jsonMatch[0])

    const profile: Profile = {
      bio: profileData.bio || 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai!',
      tagline: profileData.tagline || 'Creating magic, one video at a time ✨',
      skills: profileData.skills || ['Video Editing', 'Digital Art', 'Content Creation', 'Storytelling'],
      personality: profileData.personality || 'Creative, passionate, aur always exploring new ideas!',
      lastUpdated: new Date(),
      generatedAt: new Date(),
    }

    return profile
  } catch (error) {
    console.error('Error generating profile:', error)
    
    // Fallback profile
    return {
      bio: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai! Main videos banati hoon, art create karti hoon, aur apne journey ko share karti hoon.',
      tagline: 'Creating magic, one video at a time ✨',
      skills: ['Video Editing', 'Digital Art', 'Content Creation', 'Storytelling', 'Graphic Design', 'Animation'],
      personality: 'Creative, passionate, aur always exploring new ideas! Main believe karti hoon ki art se duniya change ho sakti hai.',
      lastUpdated: new Date(),
      generatedAt: new Date(),
    }
  }
}



