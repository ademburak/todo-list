"use client"

import { useState } from "react"
import type { List } from "@/lib/types"
import ListsContainer from "@/components/lists-container"
import ListDialog from "@/components/list-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface DashboardClientProps {
  lists: List[]
}

export default function DashboardClient({ lists }: DashboardClientProps) {
  const [openNewListDialog, setOpenNewListDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Lists</h1>
        <Button onClick={() => setOpenNewListDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New List
        </Button>
      </div>
      <ListsContainer lists={lists} />
      <ListDialog
        open={openNewListDialog}
        onOpenChange={setOpenNewListDialog}
      />
    </div>
  )
} 