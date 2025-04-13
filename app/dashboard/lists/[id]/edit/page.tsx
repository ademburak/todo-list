import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getListById } from "@/lib/lists"
import ListForm from "@/components/list-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListPage({
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit List</h1>
      <ListForm list={list} />
    </div>
  )
}
