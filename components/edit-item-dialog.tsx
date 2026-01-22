"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Item } from "@/lib/types"

interface EditItemDialogProps {
  item: Item | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, data: { name: string; location: string }) => Promise<void>
}

export function EditItemDialog({ item, open, onOpenChange, onSave }: EditItemDialogProps) {
  const [name, setName] = useState(item?.name || "")
  const [location, setLocation] = useState(item?.location || "")
  const [isLoading, setIsLoading] = useState(false)

  // Update form when item changes
  useState(() => {
    if (item) {
      setName(item.name)
      setLocation(item.location)
    }
  })

  const handleSave = async () => {
    if (!item || !name.trim() || !location.trim()) return

    setIsLoading(true)
    try {
      await onSave(item.id, { name: name.trim(), location: location.trim() })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Keys"
              className="capitalize"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Kitchen counter"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim() || !location.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
