"use client"

import { useState } from "react"
import Link from "next/link"
import type { List } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { deleteList } from "@/lib/actions"
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

export default function ListsContainer({ lists }: { lists: List[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedList, setSelectedList] = useState<List | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteList(id)
      toast({
        title: "List deleted",
        description: "The list has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the list",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setOpenDialog(false)
    }
  }

  if (lists.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg">
        <h3 className="text-xl font-medium mb-2">No lists found</h3>
        <p className="text-muted-foreground mb-4">Create your first list to get started</p>
        <Link href="/dashboard/lists/new">
          <Button>Create a List</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <Card key={list._id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">
                <Link href={`/dashboard/lists/${list._id}`} className="hover:underline">
                  {list.name}
                </Link>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setSelectedList(list)
                    setOpenEditDialog(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsDeleting(list._id)
                    setOpenDialog(true)
                  }}
                  disabled={isDeleting === list._id}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{list.itemCount || 0} items</p>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the list and all its items.
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

      <ListDialog
        list={selectedList || undefined}
        open={openEditDialog}
        onOpenChange={(open) => {
          setOpenEditDialog(open)
          if (!open) setSelectedList(null)
        }}
      />
    </div>
  )
}
