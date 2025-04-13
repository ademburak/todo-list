import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getListById } from "@/lib/lists"
import { getItemById } from "@/lib/items"
import ItemForm from "@/components/item-form"

interface PageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default async function EditItemPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions)
  const { id, itemId } = await params

  if (!session) {
    redirect("/login")
  }

  const list = await getListById(id, session.user.id as string)

  if (!list) {
    redirect("/dashboard")
  }

  const item = await getItemById(itemId)

  if (!item) {
    redirect(`/dashboard/lists/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Item</h1>
      <ItemForm listId={id} item={item} />
    </div>
  )
}
