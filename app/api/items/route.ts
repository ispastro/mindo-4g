import { type NextRequest, NextResponse } from "next/server"
import { itemsService } from "@/lib/items-service"
import type { CreateItemInput } from "@/lib/types"

// GET /api/items - List items with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || undefined

    // TODO: Get userId from auth session
    const userId = "anonymous" // Placeholder until auth is implemented

    const result = await itemsService.getItems(userId, { page, pageSize, search })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const body: CreateItemInput = await request.json()

    if (!body.name || !body.location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 })
    }

    // TODO: Get userId from auth session
    const userId = "anonymous" // Placeholder until auth is implemented

    const item = await itemsService.createItem(body, userId)

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
