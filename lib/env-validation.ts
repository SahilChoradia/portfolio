/**
 * Runtime environment variable validation
 * This will throw errors on server startup if required env vars are missing
 */

// MONGO_URI is required, but we allow MONGODB_URI as fallback in development
const requiredEnvVars = [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
] as const

// Check MongoDB URI separately with fallback support
function checkMongoUri() {
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    throw new Error('CRITICAL: MONGO_URI (or MONGODB_URI) environment variable is required')
  }
  if (process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn('WARNING: Using deprecated MONGODB_URI. Please migrate to MONGO_URI for production.')
  }
}

const optionalEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  'YOUTUBE_API_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'CONTACT_EMAIL',
] as const

export function validateEnvironmentVariables() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check MongoDB URI separately (with fallback support)
  try {
    checkMongoUri()
  } catch (error: any) {
    missing.push('MONGO_URI (or MONGODB_URI)')
  }

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  if (missing.length > 0) {
    const errorMessage = `CRITICAL: Missing required environment variables: ${missing.join(', ')}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`WARNING: Missing optional environment variables: ${warnings.join(', ')}`)
  }

  console.log('✅ Environment variables validated successfully')
}

// Run validation on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnvironmentVariables()
  } catch (error) {
    // In production, we want to fail fast
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    // In development, just warn
    console.warn('Environment validation failed:', error)
  }
}



