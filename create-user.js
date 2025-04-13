import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

// Replace with your MongoDB connection string
const uri = "mongodb+srv://ademburak:kuz60TOL12@test.rrk5it5.mongodb.net/?retryWrites=true&w=majority&appName=Test";
const client = new MongoClient(uri);

async function createUser() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("list-manager");
    const usersCollection = db.collection("users");
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username: "admin" });
    
    if (existingUser) {
      console.log("User already exists");
      return;
    }
    
    // Create a new user with hashed password
    const hashedPassword = await hash("password123", 10);
    
    const result = await usersCollection.insertOne({
      username: "admin",
      password: hashedPassword,
      email: "admin@example.com"
    });
    
    console.log(`User created with ID: ${result.insertedId}`);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

createUser().catch(console.error);