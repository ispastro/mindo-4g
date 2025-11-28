import { type NextRequest, NextResponse } from "next/server"
import { itemsService } from "@/lib/items-service"
import type { UpdateItemInput } from "@/lib/types"

// GET /api/items/:id - Get a single item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // TODO: Get userId from auth session
    const userId = "anonymous"

    const item = await itemsService.getItem(id, userId)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

// PATCH /api/items/:id - Update an item
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body: UpdateItemInput = await request.json()

    // TODO: Get userId from auth session
    const userId = "anonymous"

    const item = await itemsService.updateItem(id, body, userId)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

// DELETE /api/items/:id - Delete an item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // TODO: Get userId from auth session
    const userId = "anonymous"

    const deleted = await itemsService.deleteItem(id, userId)

    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
