/**
 * Gemini AI Analysis Engine
 * Analyzes Instagram Reel content using Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Lock to officially supported model
const MODEL_NAME = 'gemini-1.5-flash'

// Lazy-load Gemini client to avoid build-time errors
let genAI: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required for reel analysis.')
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  
  return genAI
}

export interface GeminiAnalysis {
  topic: string
  language: string
  tone: string
  keywords: string[]
  audience: string
  viralityScore: number
  improvementIdeas: string[]
  recommendedHashtags: string[]
}

export interface Competitor {
  username: string
  reelUrl: string
  reason: string
}

/**
 * Analyze reel content using Gemini
 */
export async function analyzeReelContent(
  caption: string,
  hashtags: string[]
): Promise<GeminiAnalysis> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: MODEL_NAME })

    const prompt = `Analyze this Instagram reel content and return ONLY valid JSON (no markdown, no code blocks):

Caption: ${caption}
Hashtags: ${hashtags.join(', ')}

Return JSON in this exact format:
{
  "topic": "string describing the main topic/theme",
  "language": "string (e.g., English, Hindi, Hinglish)",
  "tone": "string (e.g., funny, educational, inspirational, casual)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "audience": "string describing target audience",
  "viralityScore": number (1-10, where 10 is most viral),
  "improvementIdeas": ["idea1", "idea2", "idea3"],
  "recommendedHashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Only return valid JSON, nothing else.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    
    if (!response || !response.text) {
      throw new Error('Empty response from Gemini API')
    }
    
    let text = response.text().trim()

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }

    const analysis = JSON.parse(text) as GeminiAnalysis

    // Validate and sanitize
    return {
      topic: analysis.topic || 'Unknown',
      language: analysis.language || 'Unknown',
      tone: analysis.tone || 'Unknown',
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      audience: analysis.audience || 'General',
      viralityScore: Math.max(1, Math.min(10, analysis.viralityScore || 5)),
      improvementIdeas: Array.isArray(analysis.improvementIdeas) ? analysis.improvementIdeas : [],
      recommendedHashtags: Array.isArray(analysis.recommendedHashtags) ? analysis.recommendedHashtags : [],
    }
  } catch (error: any) {
    // Log full error server-side for debugging
    console.error('[Gemini Analyzer] Error analyzing content:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      model: MODEL_NAME,
    })
    
    // Return user-friendly error message
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error('Gemini model not found. Please check API configuration.')
    }
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      throw new Error('Gemini API key is invalid. Please check your GEMINI_API_KEY.')
    }
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please retry later.')
    }
    
    throw new Error(`Gemini analysis failed: ${error.message || 'Unknown error'}. Please retry.`)
  }
}

/**
 * Discover and rank competitors using keywords
 */
export async function discoverCompetitors(
  keywords: string[],
  originalUsername: string
): Promise<Competitor[]> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: MODEL_NAME })

    // Generate search queries from keywords
    const searchQueries = keywords.slice(0, 5).map(keyword => 
      `site:instagram.com/reel ${keyword}`
    ).join(' OR ')

    const prompt = `Based on these keywords: ${keywords.join(', ')}

Find and rank 5-10 Instagram reel creators who create similar content. These should be potential competitors.

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "username": "creator_username",
    "reelUrl": "https://www.instagram.com/reel/ABC123/",
    "reason": "Why this creator is a competitor (1-2 sentences)"
  }
]

Only return valid JSON array, nothing else. If you cannot find real competitors, return an empty array [].`

    const result = await model.generateContent(prompt)
    const response = await result.response
    
    if (!response || !response.text) {
      console.warn('[Gemini Analyzer] Empty response from competitor discovery, returning empty array')
      return []
    }
    
    let text = response.text().trim()

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Try to extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }

    const competitors = JSON.parse(text) as Competitor[]

    // Filter out the original creator and validate
    const validCompetitors = competitors
      .filter(c => c.username && c.username.toLowerCase() !== originalUsername.toLowerCase())
      .slice(0, 10)
      .map(c => ({
        username: c.username || 'unknown',
        reelUrl: c.reelUrl || '',
        reason: c.reason || 'Similar content',
      }))

    return validCompetitors
  } catch (error: any) {
    // Log full error server-side for debugging
    console.error('[Gemini Analyzer] Error discovering competitors:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      model: MODEL_NAME,
    })
    
    // Return empty array on error rather than failing the entire analysis
    // This allows the main analysis to succeed even if competitor discovery fails
    return []
  }
}

