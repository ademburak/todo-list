"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { List, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState(!isMobile)

  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          isMobile ? "shadow-lg" : "",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold">List Manager</h2>
          </div>
          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-2">
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
                  <List className="mr-2 h-4 w-4" />
                  My Lists
                </Button>
              </Link>
            </nav>
          </ScrollArea>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      {isMobile && open && <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />}
    </>
  )
}
