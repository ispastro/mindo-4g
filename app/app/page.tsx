"use client"

import { useState } from "react"
import { VoiceButton } from "@/components/voice-button"
import { ItemsList } from "@/components/items-list"
import { SearchBar } from "@/components/search-bar"
import { TypeForm } from "@/components/type-form"
import { useItems } from "@/hooks/use-items"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, Keyboard, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AppPage() {
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const { items, pagination, isLoading, addItem, removeItem, isCreating } = useItems({
    page: currentPage,
    pageSize,
    search: searchQuery || undefined,
  })

  const handleAddItem = async (item: { name: string; location: string }) => {
    await addItem(item)
    setCurrentPage(1) // Reset to first page after adding
  }

  const handleRemoveItem = async (id: string) => {
    await removeItem(id)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on search
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-primary">Mindo</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Where did you put it?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
            Simply speak to save where you put things. Ask later to find them instantly.
          </p>

          <div className="mb-6 flex items-center justify-center gap-2">
            <Button
              variant={inputMode === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("voice")}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <Button
              variant={inputMode === "type" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("type")}
              className="gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Type Instead
            </Button>
          </div>

          {inputMode === "voice" ? (
            <>
              <VoiceButton onResult={handleAddItem} />
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mic className="h-4 w-4" />
                <span>Try saying: &quot;I put my keys on the kitchen counter&quot;</span>
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
              <TypeForm onSubmit={handleAddItem} isLoading={isCreating} />
              <p className="mt-4 text-sm text-muted-foreground">Enter the item name and where you put it</p>
            </div>
          )}
        </section>

        {/* Search and Items */}
        <section className="mx-auto max-w-2xl">
          <SearchBar value={searchQuery} onChange={handleSearch} />

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Your Items
                {isLoading ? (
                  <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
                ) : (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({pagination.totalItems})</span>
                )}
              </h3>
            </div>

            <ItemsList
              items={items}
              onRemove={handleRemoveItem}
              pagination={pagination}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
