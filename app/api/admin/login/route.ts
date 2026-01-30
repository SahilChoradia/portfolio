import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateAdminCredentials } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[ADMIN_LOGIN] Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    const { email, password } = body

    // Validate input
    if (!email || !password) {
      console.error('[ADMIN_LOGIN] Missing email or password')
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required'
        },
        { status: 400 }
      )
    }

    // Validate credentials
    let isValid = false
    try {
      isValid = validateAdminCredentials(email, password)
    } catch (error: any) {
      console.error('[ADMIN_LOGIN] Server configuration error:', error.message)
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error',
          message: 'Admin authentication is not properly configured'
        },
        { status: 500 }
      )
    }

    if (!isValid) {
      console.warn('[ADMIN_LOGIN] Invalid credentials for email:', email)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        },
        { status: 401 }
      )
    }

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('[ADMIN_LOGIN] Successful login for email:', email)
    
    return NextResponse.json({ 
      success: true,
      message: 'Login successful'
    })
  } catch (error: any) {
    console.error('[ADMIN_LOGIN] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}

