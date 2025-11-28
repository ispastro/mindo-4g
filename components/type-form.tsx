"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Loader2 } from "lucide-react"

interface TypeFormProps {
  onSubmit: (item: { name: string; location: string }) => void
  isLoading?: boolean
}

export function TypeForm({ onSubmit, isLoading }: TypeFormProps) {
  const [itemName, setItemName] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemName.trim() || !location.trim()) return

    onSubmit({
      name: itemName.trim(),
      location: location.trim(),
    })

    // Clear form
    setItemName("")
    setLocation("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="item-name" className="text-sm font-medium text-foreground">
          Item
        </label>
        <Input
          id="item-name"
          placeholder="e.g. Keys, Wallet, Glasses"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="bg-background"
          disabled={isLoading}
        />
      </div>
      <div className="flex-1 space-y-1.5">
        <label htmlFor="item-location" className="text-sm font-medium text-foreground">
          Location
        </label>
        <Input
          id="item-location"
          placeholder="e.g. Kitchen counter, Drawer"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-background"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={!itemName.trim() || !location.trim() || isLoading} className="gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add Item
      </Button>
    </form>
  )
}
