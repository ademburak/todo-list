import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { Item } from "@/lib/types"

export async function getItemsByListId(listId: string): Promise<Item[]> {
  const { db } = await connectToDatabase()

  const items = await db
    .collection("items")
    .find({ listId: new ObjectId(listId) })
    .sort({ dateAdded: -1 })
    .toArray()

  return items.map((item) => ({
    ...item,
    _id: item._id.toString(),
    listId: item.listId.toString(),
  })) as Item[]
}

export async function getItemById(id: string): Promise<Item | null> {
  const { db } = await connectToDatabase()

  try {
    const item = await db.collection("items").findOne({
      _id: new ObjectId(id),
    })

    if (!item) return null

    return {
      ...item,
      _id: item._id.toString(),
      listId: item.listId.toString(),
    } as Item
  } catch (error) {
    return null
  }
}
