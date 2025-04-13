import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
