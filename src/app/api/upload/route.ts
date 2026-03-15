import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pin = formData.get("pin") as string;
    const category = (formData.get("category") as string) || "Other";
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    // Validate access logic (0000 to 0014)
    const validPins = Array.from({ length: 15 }, (_, i) => i.toString().padStart(4, "0"));
    if (!validPins.includes(pin)) {
      return NextResponse.json({ error: "Invalid Access PIN" }, { status: 401 });
    }

    let imageUrl = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Local storage configuration
      const uploadDir = join(process.cwd(), "public/uploads");
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate a unique file name
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      
      // Vercel Ready note: Replace local file save with Vercel Blob based on env variables
      // e.g. if (process.env.BLOB_READ_WRITE_TOKEN) { ... }
      
      imageUrl = `/uploads/${fileName}`;
    }

    const feedback = await prisma.feedback.create({
      data: {
        pin,
        category,
        text,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
