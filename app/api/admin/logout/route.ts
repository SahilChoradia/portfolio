import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin-auth')
    
    return NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    console.error('[ADMIN_LOGOUT] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}



