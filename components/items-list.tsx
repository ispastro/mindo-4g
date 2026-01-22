"use client"

import { useState } from "react"
import { MapPin, Trash2, Clock, Volume2, ChevronLeft, ChevronRight, Loader2, Search, Pencil, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { DeleteItemDialog } from "@/components/delete-item-dialog"
import type { Item, PaginatedResponse } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ItemsListProps {
  items: Item[]
  onRemove: (id: string) => void
  onUpdate: (id: string, data: { name: string; location: string }) => Promise<void>
  pagination: PaginatedResponse<Item>["pagination"]
  onPageChange: (page: number) => void
  isLoading?: boolean
  searchQuery?: string
}

export function ItemsList({ items, onRemove, onUpdate, pagination, onPageChange, isLoading, searchQuery }: ItemsListProps) {
  const { page, total_pages, total_items, has_next_page, has_previous_page } = pagination
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const speakItem = (item: Item) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Your ${item.name} is ${item.location}`)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      await onRemove(deleteItem.id)
      setDeleteItem(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center border-dashed bg-card/50 p-12 text-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your items...</p>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center border-dashed bg-card/50 p-12 text-center">
        {searchQuery ? (
          <>
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h4 className="mb-2 text-lg font-medium text-foreground">No items found</h4>
            <p className="text-sm text-muted-foreground">
              No items match &quot;{searchQuery}&quot;. Try a different search term.
            </p>
          </>
        ) : (
          <>
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h4 className="mb-2 text-lg font-medium text-foreground">No items saved yet</h4>
            <p className="text-sm text-muted-foreground">
              Use the microphone or type manually to save where you put things
            </p>
          </>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="group flex items-center gap-4 bg-card p-4 transition-all hover:bg-card/80">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium capitalize text-card-foreground">{item.name}</h4>
            <p className="truncate text-sm text-muted-foreground">{item.location}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              <span>
                {item.created_at && !isNaN(new Date(item.created_at).getTime())
                  ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                  : 'Recently added'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop: Show buttons on hover */}
            <div className="hidden md:flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => speakItem(item)}
                className="h-9 w-9 text-muted-foreground hover:text-primary"
                aria-label={`Read ${item.name} location aloud`}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditItem(item)}
                className="h-9 w-9 text-muted-foreground hover:text-primary"
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDeleteItem(item)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile: Dropdown menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => speakItem(item)}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Read Aloud
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditItem(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {total_pages} ({total_items} items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={!has_previous_page || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={!has_next_page || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <EditItemDialog
        item={editItem}
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        onSave={onUpdate}
      />

      {/* Delete Confirmation */}
      <DeleteItemDialog
        item={deleteItem}
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
