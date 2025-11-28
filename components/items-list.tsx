"use client"

import { MapPin, Trash2, Clock, Volume2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Item, PaginatedResponse } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ItemsListProps {
  items: Item[]
  onRemove: (id: string) => void
  pagination: PaginatedResponse<Item>["pagination"]
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ItemsList({ items, onRemove, pagination, onPageChange, isLoading }: ItemsListProps) {
  const { page, totalPages, totalItems, hasNextPage, hasPreviousPage } = pagination

  const speakItem = (item: Item) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Your ${item.name} is ${item.location}`)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
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
        <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h4 className="mb-2 text-lg font-medium text-foreground">No items saved yet</h4>
        <p className="text-sm text-muted-foreground">
          Use the microphone or type manually to save where you put things
        </p>
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
              <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
              onClick={() => onRemove(item.id)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalItems} items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPreviousPage || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
