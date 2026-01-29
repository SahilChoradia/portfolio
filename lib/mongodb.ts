import { MongoClient } from 'mongodb'

// Environment validation on server startup
if (!process.env.MONGODB_URI) {
  throw new Error('CRITICAL: MONGODB_URI environment variable is required. Application cannot start without it.')
}

// Use DATABASE_URL as alias for MONGODB_URI if provided
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI

const uri: string = DATABASE_URL
let client: MongoClient
let clientPromise: Promise<MongoClient>

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

export default clientPromise



