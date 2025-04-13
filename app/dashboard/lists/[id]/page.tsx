import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getListById } from "@/lib/lists"
import { getItemsByListId } from "@/lib/items"
import ListDetail from "@/components/list-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListDetailPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect("/login")
  }

  const list = await getListById(id, session.user.id as string)

  if (!list) {
    redirect("/dashboard")
  }

  const items = await getItemsByListId(id)

  return <ListDetail list={list} items={items} />
}
