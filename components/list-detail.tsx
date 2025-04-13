"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { List, Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Plus, Trash2, EyeOff, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { deleteItem, toggleItemCompletion } from "@/lib/actions"
import ItemDialog from "@/components/item-dialog"
import ListDialog from "@/components/list-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface ListDetailProps {
  list: List
  items: Item[]
}

export default function ListDetail({ list, items }: ListDetailProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openNewItemDialog, setOpenNewItemDialog] = useState(false)
  const [openEditListDialog, setOpenEditListDialog] = useState(false)
  const [hideCompleted, setHideCompleted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const filteredItems = hideCompleted ? items.filter(item => !item.completed) : items
  const completedCount = items.filter(item => item.completed).length

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteItem(id)
      toast({
        title: "Item deleted",
        description: "The item has been deleted successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the item",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setOpenDialog(false)
    }
  }

  const handleToggleCompletion = async (id: string) => {
    try {
      await toggleItemCompletion(id)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{list.name}</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
            {completedCount > 0 && ` • ${completedCount} completed`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setOpenNewItemDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button variant="outline" onClick={() => setOpenEditListDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit List
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">Add your first item to this list</p>
          <Button onClick={() => setOpenNewItemDialog(true)}>Add an Item</Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideCompleted(!hideCompleted)}
              className="text-muted-foreground"
            >
              {hideCompleted ? (
                <Eye className="mr-2 h-4 w-4" />
              ) : (
                <EyeOff className="mr-2 h-4 w-4" />
              )}
              {hideCompleted ? "Show Completed" : "Hide Completed"}
            </Button>
          </div>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/5"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleCompletion(item._id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/lists/${list._id}/items/${item._id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setIsDeleting(item._id)
                          setOpenDialog(true)
                        }}
                        disabled={isDeleting === item._id}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  {item.detail && (
                    <p className={`mt-1 text-sm ${item.completed ? 'text-muted-foreground' : ''}`}>
                      {item.detail}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Added on {formatDate(item.dateAdded)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => isDeleting && handleDelete(isDeleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ItemDialog
        listId={list._id}
        open={openNewItemDialog}
        onOpenChange={setOpenNewItemDialog}
      />

      <ListDialog
        list={list}
        open={openEditListDialog}
        onOpenChange={setOpenEditListDialog}
      />
    </div>
  )
}
