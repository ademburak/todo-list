import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getLists } from "@/lib/lists"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const lists = await getLists(session?.user?.id as string)

  return <DashboardClient lists={lists} />
}
