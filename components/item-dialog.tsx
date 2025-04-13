"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createItem } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ItemDialogProps {
  listId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ItemDialog({ listId, open, onOpenChange }: ItemDialogProps) {
  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createItem(listId, { title, detail: detail || undefined })
      toast({
        title: "Item created",
        description: "The item has been created successfully",
      })
      router.refresh()
      onOpenChange(false)
      setTitle("")
      setDetail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the item",
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
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your list. Only the title is required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter item title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail">Detail (Optional)</Label>
              <Textarea
                id="detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Enter item details"
                rows={3}
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
              {isLoading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 