import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { createItem, updateItem, deleteItem } from "@/lib/actions"

// Mock dependencies
jest.mock("next-auth")
jest.mock("@/lib/mongodb")
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("Item API", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock session
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    })

    // Mock database connection
    const mockCollection = {
      insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId("item123") }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      findOne: jest.fn().mockImplementation((query) => {
        if (query && query._id && query._id.toString() === new ObjectId("item123").toString()) {
          return Promise.resolve({
            _id: new ObjectId("item123"),
            title: "Test Item",
            detail: "Test Detail",
            listId: new ObjectId("list123"),
          })
        }
        if (query && query._id && query._id.toString() === new ObjectId("list123").toString()) {
          return Promise.resolve({
            _id: new ObjectId("list123"),
            name: "Test List",
            userId: "user123",
          })
        }
        return Promise.resolve(null)
      }),
    }

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }
    ;(connectToDatabase as jest.Mock).mockResolvedValue({
      client: {},
      db: mockDb,
    })
  })

  describe("createItem", () => {
    it("creates a new item successfully", async () => {
      const result = await createItem("list123", {
        title: "New Item",
        detail: "Item Detail",
      })

      const { db } = await connectToDatabase()
      expect(db.collection).toHaveBeenCalledWith("lists")
      expect(db.collection).toHaveBeenCalledWith("items")
      expect(db.collection("items").insertOne).toHaveBeenCalledWith({
        title: "New Item",
        detail: "Item Detail",
        dateAdded: expect.any(String),
        listId: expect.any(ObjectId),
      })

      expect(result).toEqual({ id: "item123" })
    })

    it("throws an error when list is not found", async () => {
      const { db } = await connectToDatabase()
      db.collection("lists").findOne.mockResolvedValue(null)

      await expect(
        createItem("nonexistent", {
          title: "New Item",
          detail: "Item Detail",
        }),
      ).rejects.toThrow("List not found")
    })
  })

  describe("updateItem", () => {
    it("updates an item successfully", async () => {
      const result = await updateItem("item123", {
        title: "Updated Item",
        detail: "Updated Detail",
      })

      const { db } = await connectToDatabase()
      expect(db.collection("items").updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { title: "Updated Item", detail: "Updated Detail" } },
      )

      expect(result).toEqual({ success: true })
    })

    it("throws an error when item is not found", async () => {
      const { db } = await connectToDatabase()
      db.collection("items").findOne.mockResolvedValue(null)

      await expect(
        updateItem("nonexistent", {
          title: "Updated Item",
          detail: "Updated Detail",
        }),
      ).rejects.toThrow("Item not found")
    })
  })

  describe("deleteItem", () => {
    it("deletes an item successfully", async () => {
      const result = await deleteItem("item123")

      const { db } = await connectToDatabase()
      expect(db.collection("items").deleteOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      })

      expect(result).toEqual({ success: true })
    })
  })
})
