import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/nextjs-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL && !process.env.MONGODB_URI) {
  throw new Error(
    'CRITICAL: DATABASE_URL or MONGODB_URI environment variable is required. ' +
    'Application cannot start without it.'
  )
}

// Use DATABASE_URL or fallback to MONGODB_URI for compatibility
// Prisma will read DATABASE_URL from env automatically, but we set it here for validation
if (!process.env.DATABASE_URL && process.env.MONGODB_URI) {
  process.env.DATABASE_URL = process.env.MONGODB_URI
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Cache Prisma instance in globalThis to prevent multiple instances in serverless environments
// This is critical for Vercel to prevent connection limit issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production (Vercel), also cache to prevent multiple instances per serverless function
  globalForPrisma.prisma = prisma
}

// Export the singleton instance
export default prisma

