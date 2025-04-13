import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { List } from "@/lib/types"

export async function getLists(userId: string): Promise<List[]> {
  const { db } = await connectToDatabase()

  // Aggregate to get lists with item counts
  const lists = await db
    .collection("lists")
    .aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "listId",
          as: "items",
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          userId: 1,
          itemCount: { $size: "$items" },
        },
      },
    ])
    .toArray()

  return lists as List[]
}

export async function getListById(id: string, userId: string): Promise<List | null> {
  const { db } = await connectToDatabase()

  try {
    const list = await db.collection("lists").findOne({
      _id: new ObjectId(id),
      userId,
    })

    if (!list) return null

    return {
      ...list,
      _id: list._id.toString(),
    } as List
  } catch (error) {
    return null
  }
}
