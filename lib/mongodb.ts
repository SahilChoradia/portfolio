import { MongoClient } from 'mongodb'

/**
 * MongoDB Client Singleton Pattern for Next.js App Router + Vercel
 * 
 * CRITICAL: In serverless environments (Vercel), each function invocation
 * can create a new MongoClient instance, leading to connection exhaustion.
 * 
 * Solution: Use globalThis to cache the MongoClient instance across
 * all serverless function invocations on the same container.
 * 
 * This ensures only ONE connection is created and reused across all requests.
 */

// Type-safe globalThis access
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient
  _mongoClientPromise?: Promise<MongoClient>
}

// ============================================
// STEP 1: GET DATABASE URL
// ============================================
function getDatabaseUrl(): string {
  // Primary: Use MONGO_URI (required for production)
  // Fallback: MONGODB_URI (for backward compatibility in development)
  const MONGO_URI = process.env.MONGO_URI
  const MONGODB_URI = process.env.MONGODB_URI
  
  if (MONGO_URI) {
    return MONGO_URI
  }
  
  // Backward compatibility: allow MONGODB_URI in development
  if (MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[MONGODB] WARNING: Using MONGODB_URI fallback in production. Please migrate to MONGO_URI.')
    } else {
      console.warn('[MONGODB] WARNING: Using MONGODB_URI fallback. Please update your .env.local to use MONGO_URI instead.')
    }
    return MONGODB_URI
  }
  
  // No valid URI found - throw error
  throw new Error(
    'CRITICAL: MONGO_URI environment variable is required. ' +
    'Application cannot start without it. ' +
    'Please set MONGO_URI in your environment variables. ' +
    '(MONGODB_URI is deprecated and only works in development)'
  )
}

// ============================================
// STEP 2: CREATE OR REUSE MONGO CLIENT
// ============================================
function getMongoClient(): Promise<MongoClient> {
  // Check if client already exists in globalThis (cached from previous invocation)
  if (globalForMongo._mongoClientPromise) {
    console.log('[MONGODB] Reusing existing MongoClient from globalThis')
    return globalForMongo._mongoClientPromise
  }

  console.log('[MONGODB] Creating new MongoClient instance...')
  
  // Get database URL
  const uri = getDatabaseUrl()
  
  // Create new MongoClient
  const client = new MongoClient(uri, {
    // Connection pool settings for production
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 1, // Minimum number of connections in the pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // How long to try selecting a server
    socketTimeoutMS: 45000, // How long to wait for a socket connection
  })

  // Connect and cache the promise in globalThis
  globalForMongo._mongoClientPromise = client.connect().then((connectedClient) => {
    console.log('[MONGODB] MongoClient connected successfully')
    globalForMongo._mongoClient = connectedClient
    return connectedClient
  }).catch((error) => {
    // Clear the promise on error so we can retry
    globalForMongo._mongoClientPromise = undefined
    console.error('[MONGODB_ERROR] Failed to connect:', error)
    throw error
  })

  return globalForMongo._mongoClientPromise
}

// ============================================
// STEP 3: EXPORT CLIENT PROMISE
// ============================================
// Export a promise that resolves to the MongoClient
// This ensures only ONE connection is created and reused
const clientPromise = getMongoClient()

export default clientPromise

// ============================================
// STEP 4: EXPORT HELPER FUNCTION
// ============================================
/**
 * Get MongoDB database instance
 * @param dbName Optional database name (defaults to database name in connection string)
 */
export async function getDatabase(dbName?: string) {
  const client = await clientPromise
  return client.db(dbName)
}



