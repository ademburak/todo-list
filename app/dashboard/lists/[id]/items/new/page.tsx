import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getListById } from "@/lib/lists"
import ItemForm from "@/components/item-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewItemPage({
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
      <h1 className="text-3xl font-bold mb-6">Add New Item</h1>
      <ItemForm listId={id} />
    </div>
  )
}
