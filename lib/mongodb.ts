import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || "list-manager")

  cachedClient = client
  cachedDb = db

  return { client, db }
}
