/**
 * API Route: POST /api/admin/analyze-reel
 * Analyzes Instagram Reel using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateReelUrl, scrapeReelMetadata } from '@/lib/reel-scraper'
import { analyzeReelContent, discoverCompetitors } from '@/lib/gemini-analyzer'
import { getReelAnalysis, saveReelAnalysis } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reelUrl } = body

    // Validate input
    if (!reelUrl || typeof reelUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'reelUrl is required' },
        { status: 400 }
      )
    }

    // Sanitize URL - remove any query parameters or fragments
    const sanitizedUrl = reelUrl.trim().split('?')[0].split('#')[0]

    // Validate URL format
    if (!validateReelUrl(sanitizedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Instagram Reel URL. Must be instagram.com/reel/* or instagram.com/p/*' },
        { status: 400 }
      )
    }

    // Rate limiting: Simple check - prevent same URL from being analyzed too frequently
    // (More sophisticated rate limiting can be added with Redis or similar)

    // Check cache first
    const cached = await getReelAnalysis(sanitizedUrl)
    if (cached) {
      console.log('[API] Returning cached analysis for:', sanitizedUrl)
      return NextResponse.json({
        success: true,
        analysis: cached,
        cached: true,
      })
    }

    // Scrape reel metadata
    console.log('[API] Scraping reel metadata:', sanitizedUrl)
    const metadata = await scrapeReelMetadata(sanitizedUrl)

    // Analyze with Gemini
    console.log('[API] Analyzing content with Gemini...')
    const aiAnalysis = await analyzeReelContent(metadata.caption, metadata.hashtags)

    // Discover competitors
    console.log('[API] Discovering competitors...')
    const competitors = await discoverCompetitors(
      [...metadata.hashtags, ...aiAnalysis.keywords],
      metadata.creatorUsername
    )

    // Save to database
    const analysis = await saveReelAnalysis({
      reelUrl: sanitizedUrl,
      caption: metadata.caption,
      hashtags: metadata.hashtags,
      creatorUsername: metadata.creatorUsername,
      thumbnailUrl: metadata.thumbnailUrl,
      audioName: metadata.audioName,
      aiAnalysis,
      competitors,
    })

    console.log('[API] Analysis saved successfully')

    return NextResponse.json({
      success: true,
      analysis,
      cached: false,
    })
  } catch (error: any) {
    console.error('[API] Error analyzing reel:', error)
    
    // Return user-friendly error
    const errorMessage = error.message || 'Failed to analyze reel'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

