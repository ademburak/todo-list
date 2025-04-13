import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <main className="p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
