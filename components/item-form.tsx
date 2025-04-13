"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createItem, updateItem } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface ItemFormProps {
  listId: string
  item?: Item
}

export default function ItemForm({ listId, item }: ItemFormProps) {
  const [title, setTitle] = useState(item?.title || "")
  const [detail, setDetail] = useState(item?.detail || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!item

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEditing) {
        await updateItem(item._id, { title, detail })
        toast({
          title: "Item updated",
          description: "The item has been updated successfully",
        })
      } else {
        await createItem(listId, { title, detail })
        toast({
          title: "Item created",
          description: "The item has been created successfully",
        })
      }
      router.push(`/dashboard/lists/${listId}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update the item" : "Failed to create the item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="detail">Detail</Label>
        <Textarea id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} rows={5} required />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Item" : "Create Item"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
