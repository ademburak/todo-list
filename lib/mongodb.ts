import { MongoClient, type Db, MongoClientOptions } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || "list-manager"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  waitQueueTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
}

export async function connectToDatabase() {
  try {
    if (cachedClient && cachedDb) {
      // Test the connection before returning cached instance
      await cachedClient.db().admin().ping()
      return { client: cachedClient, db: cachedDb }
    }

    console.log("Establishing new MongoDB connection...")
    const client = new MongoClient(MONGODB_URI, options)
    await client.connect()

    const db = client.db(MONGODB_DB)
    
    // Test the connection
    await db.admin().ping()
    console.log("Successfully connected to MongoDB.")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    
    // Clear cached instances if connection fails
    cachedClient = null
    cachedDb = null
    
    throw new Error("Unable to connect to MongoDB. Please try again later.")
  }
}
