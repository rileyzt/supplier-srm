import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // WEBP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  return false;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 photos allowed per upload" }, { status: 400 });
    }

    const uploadedImages: { url: string; storageKey: string }[] = [];
    const hasVercelBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

    for (const file of files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File ${file.name} must be JPEG, PNG, or WebP` }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 });
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      if (!validateImageMagicBytes(fileBuffer)) {
        return NextResponse.json({ error: `File ${file.name} is not a valid image` }, { status: 400 });
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `qc/${Date.now()}_${safeName}`;

      if (hasVercelBlob) {
        const blob = await put(storageKey, fileBuffer, {
          access: "public",
          contentType: file.type,
        });
        uploadedImages.push({ url: blob.url, storageKey });
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "qc");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, `${Date.now()}_${safeName}`);
        await fs.writeFile(filePath, fileBuffer);
        const url = `/uploads/qc/${path.basename(filePath)}`;
        uploadedImages.push({ url, storageKey });
      }
    }

    return NextResponse.json({ success: true, files: uploadedImages });
  } catch (error) {
    console.error("Supplier photo upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
