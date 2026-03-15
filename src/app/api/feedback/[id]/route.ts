import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Delete the file if it exists locally
    if (feedback.imageUrl && feedback.imageUrl.startsWith("/uploads/")) {
      try {
        const filePath = join(process.cwd(), "public", feedback.imageUrl);
        await unlink(filePath);
      } catch (fileError) {
        console.error("Could not delete image file:", fileError);
        // Continue to delete db record even if file deletion fails
      }
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
