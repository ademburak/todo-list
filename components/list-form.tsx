"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { List } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createList, updateList } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface ListFormProps {
  list?: List
}

export default function ListForm({ list }: ListFormProps) {
  const [name, setName] = useState(list?.name || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!list

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEditing) {
        await updateList(list._id, { name })
        toast({
          title: "List updated",
          description: "The list has been updated successfully",
        })
      } else {
        await createList({ name })
        toast({
          title: "List created",
          description: "The list has been created successfully",
        })
      }
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update the list" : "Failed to create the list",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">List Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update List" : "Create List"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
