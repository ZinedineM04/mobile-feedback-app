import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

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
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      
      // Upload to Vercel Blob
      const blob = await put(fileName, file, { access: 'public' });
      imageUrl = blob.url;
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
