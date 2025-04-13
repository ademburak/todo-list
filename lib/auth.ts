import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error("Missing credentials")
            return null
          }

          console.log("Attempting database connection...")
          const { db } = await connectToDatabase()
          console.log("Database connection successful")

          console.log("Looking up user:", credentials.username)
          const user = await db.collection("users").findOne({
            username: credentials.username,
          })

          if (!user) {
            console.error("User not found:", credentials.username)
            return null
          }

          console.log("Verifying password...")
          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) {
            console.error("Invalid password for user:", credentials.username)
            return null
          }

          console.log("Authentication successful for user:", credentials.username)
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email || "",
          }
        } catch (error) {
          console.error("Authentication error:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            credentials: { username: credentials?.username }
          })
          throw error // Let NextAuth handle the error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: true, // Enable debug logs
}
