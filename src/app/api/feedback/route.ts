import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { pin },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
  }
}
