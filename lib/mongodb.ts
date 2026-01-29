import { MongoClient } from 'mongodb'

// Lazy-load MongoDB connection to avoid build-time errors
let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

function initializeClient(): Promise<MongoClient> {
  // Validate environment variable when actually needed
  if (!process.env.MONGODB_URI) {
    throw new Error('CRITICAL: MONGODB_URI environment variable is required. Application cannot start without it.')
  }

  // Return existing promise if already initialized
  if (clientPromise) {
    return clientPromise
  }

  // Use DATABASE_URL as alias for MONGODB_URI if provided
  const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI
  const uri: string = DATABASE_URL

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  }

  return clientPromise
}

// Export a promise-like object that initializes on first await/then
const clientPromiseGetter: Promise<MongoClient> = {
  then: (onFulfilled, onRejected) => {
    return initializeClient().then(onFulfilled, onRejected)
  },
  catch: (onRejected) => {
    return initializeClient().catch(onRejected)
  },
  finally: (onFinally) => {
    return initializeClient().finally(onFinally)
  },
  [Symbol.toStringTag]: 'Promise'
} as Promise<MongoClient>

export default clientPromiseGetter



