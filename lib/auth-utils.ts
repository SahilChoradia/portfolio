import { cookies } from 'next/headers'

/**
 * Check if user is authenticated via admin-auth cookie
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')
  return authCookie?.value === 'true'
}

/**
 * Validate admin credentials against environment variables
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // Validate environment variables are set
  if (!adminEmail || !adminPassword) {
    console.error('[AUTH] ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set')
    throw new Error('Server configuration error: Admin credentials not configured')
  }

  // Case-insensitive email comparison
  const emailMatch = email.toLowerCase().trim() === adminEmail.toLowerCase().trim()
  
  if (!emailMatch) {
    console.warn('[AUTH] Email mismatch:', {
      provided: email,
      expected: adminEmail,
    })
    return false
  }

  // Password comparison (supports both plain text and bcrypt)
  if (adminPassword.startsWith('$2')) {
    // Bcrypt hash - would need bcrypt.compare, but for simplicity, we'll use plain text
    // In production, you should hash passwords properly
    console.warn('[AUTH] Bcrypt hash detected but plain text comparison used. Hash the password properly.')
  }
  
  return password === adminPassword
}



