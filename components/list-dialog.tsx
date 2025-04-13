"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createList, updateList } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import type { List } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ListDialogProps {
  list?: List
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ListDialog({ list, open, onOpenChange }: ListDialogProps) {
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
      router.refresh()
      onOpenChange(false)
      setName("")
      if (!isEditing) {
        router.push("/dashboard")
      }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit List" : "Create New List"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit your list name below."
              : "Create a new list to organize your items."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter list name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update List"
                : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 