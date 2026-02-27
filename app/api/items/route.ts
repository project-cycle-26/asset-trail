export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        quantity_total: true,
        quantity_available: true,
        location: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, quantity_total, location } = body;

    if (!name || !category || quantity_total == null || !location) {
      return NextResponse.json(
        { error: "Name, category, quantity_total, and location are required" },
        { status: 400 }
      );
    }

    const total = Number(quantity_total);

    if (isNaN(total) || total < 0) {
      return NextResponse.json(
        { error: "Invalid quantity_total" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        quantity_total: total,
        quantity_available: total,
        location: location.trim(),
        status: "WORKING",
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity_total: true,
        quantity_available: true,
        location: true,
        status: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}