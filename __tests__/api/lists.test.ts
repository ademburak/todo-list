import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { createList, updateList, deleteList } from "@/lib/actions"

// Mock dependencies
jest.mock("next-auth")
jest.mock("@/lib/mongodb")
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("List API", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock session
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    })

    // Mock database connection
    const mockCollection = {
      insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId("list123") }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      findOne: jest.fn().mockResolvedValue({ _id: new ObjectId("list123"), name: "Test List", userId: "user123" }),
    }

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }
    ;(connectToDatabase as jest.Mock).mockResolvedValue({
      client: {},
      db: mockDb,
    })
  })

  describe("createList", () => {
    it("creates a new list successfully", async () => {
      const result = await createList({ name: "New List" })

      const { db } = await connectToDatabase()
      expect(db.collection).toHaveBeenCalledWith("lists")
      expect(db.collection("lists").insertOne).toHaveBeenCalledWith({
        name: "New List",
        userId: "user123",
      })

      expect(result).toEqual({ id: "list123" })
    })

    it("throws an error when user is not authenticated", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      await expect(createList({ name: "New List" })).rejects.toThrow("Unauthorized")
    })
  })

  describe("updateList", () => {
    it("updates a list successfully", async () => {
      const result = await updateList("list123", { name: "Updated List" })

      const { db } = await connectToDatabase()
      expect(db.collection).toHaveBeenCalledWith("lists")
      expect(db.collection("lists").updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId), userId: "user123" },
        { $set: { name: "Updated List" } },
      )

      expect(result).toEqual({ success: true })
    })
  })

  describe("deleteList", () => {
    it("deletes a list and its items successfully", async () => {
      const mockItemsCollection = {
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }),
      }

      const { db } = await connectToDatabase()
      db.collection.mockImplementation((name) => {
        if (name === "items") return mockItemsCollection
        return db.collection(name)
      })

      const result = await deleteList("list123")

      expect(db.collection).toHaveBeenCalledWith("lists")
      expect(db.collection("lists").deleteOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
        userId: "user123",
      })

      expect(db.collection).toHaveBeenCalledWith("items")
      expect(mockItemsCollection.deleteMany).toHaveBeenCalledWith({
        listId: expect.any(ObjectId),
      })

      expect(result).toEqual({ success: true })
    })
  })
})
