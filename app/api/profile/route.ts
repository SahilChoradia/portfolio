import { NextResponse } from 'next/server'
import { getProfile, saveProfile } from '@/lib/models'
import { isAuthenticated } from '@/lib/auth-utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  bio: z.string(),
  tagline: z.string(),
  skills: z.array(z.string()),
  personality: z.string(),
})

export async function GET() {
  try {
    const profile = await getProfile()
    return NextResponse.json(profile || null)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    console.error('[PROFILE_PUT] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = profileSchema.parse(body)

    const profile = {
      ...validated,
      lastUpdated: new Date(),
      generatedAt: new Date(),
    }

    await saveProfile(profile)
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile', message: error.message },
      { status: 500 }
    )
  }
}





