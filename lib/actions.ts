"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// List actions
export async function createList(data: { name: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  const result = await db.collection("lists").insertOne({
    name: data.name,
    userId: session.user.id,
  })

  revalidatePath("/dashboard")
  return { id: result.insertedId.toString() }
}

export async function updateList(id: string, data: { name: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  await db
    .collection("lists")
    .updateOne({ _id: new ObjectId(id), userId: session.user.id }, { $set: { name: data.name } })

  revalidatePath(`/dashboard/lists/${id}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteList(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  // Delete the list
  await db.collection("lists").deleteOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  })

  // Delete all items in the list
  await db.collection("items").deleteMany({
    listId: new ObjectId(id),
  })

  revalidatePath("/dashboard")
  return { success: true }
}

// Item actions
export async function createItem(listId: string, data: { title: string; detail?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  // Verify the list belongs to the user
  const list = await db.collection("lists").findOne({
    _id: new ObjectId(listId),
    userId: session.user.id,
  })

  if (!list) {
    throw new Error("List not found")
  }

  const result = await db.collection("items").insertOne({
    title: data.title,
    detail: data.detail || "",
    dateAdded: new Date().toISOString(),
    listId: new ObjectId(listId),
    completed: false,
  })

  revalidatePath(`/dashboard/lists/${listId}`)
  return { id: result.insertedId.toString() }
}

export async function updateItem(id: string, data: { title: string; detail: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  // Get the item to find its listId
  const item = await db.collection("items").findOne({
    _id: new ObjectId(id),
  })

  if (!item) {
    throw new Error("Item not found")
  }

  // Verify the list belongs to the user
  const list = await db.collection("lists").findOne({
    _id: item.listId,
    userId: session.user.id,
  })

  if (!list) {
    throw new Error("Unauthorized")
  }

  await db
    .collection("items")
    .updateOne({ _id: new ObjectId(id) }, { $set: { title: data.title, detail: data.detail } })

  revalidatePath(`/dashboard/lists/${item.listId.toString()}`)
  return { success: true }
}

export async function deleteItem(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  // Get the item to find its listId
  const item = await db.collection("items").findOne({
    _id: new ObjectId(id),
  })

  if (!item) {
    throw new Error("Item not found")
  }

  // Verify the list belongs to the user
  const list = await db.collection("lists").findOne({
    _id: item.listId,
    userId: session.user.id,
  })

  if (!list) {
    throw new Error("Unauthorized")
  }

  await db.collection("items").deleteOne({ _id: new ObjectId(id) })

  revalidatePath(`/dashboard/lists/${item.listId.toString()}`)
  return { success: true }
}

export async function toggleItemCompletion(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { db } = await connectToDatabase()

  // Get the item to find its listId
  const item = await db.collection("items").findOne({
    _id: new ObjectId(id),
  })

  if (!item) {
    throw new Error("Item not found")
  }

  // Verify the list belongs to the user
  const list = await db.collection("lists").findOne({
    _id: item.listId,
    userId: session.user.id,
  })

  if (!list) {
    throw new Error("Unauthorized")
  }

  await db
    .collection("items")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: !item.completed } }
    )

  revalidatePath(`/dashboard/lists/${item.listId.toString()}`)
  return { success: true }
}
