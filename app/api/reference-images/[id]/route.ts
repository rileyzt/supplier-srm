import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing image ID" }, { status: 400 });
  }

  // 1. Authenticate user session
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supplierId = session.user.supplierId;
  if (!supplierId) {
    return NextResponse.json({ error: "Forbidden: No supplier organization" }, { status: 403 });
  }

  // 2. Fetch ReferenceImage record from database
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Storage unconfigured" }, { status: 500 });
  }

  const refImage = await prisma.referenceImage.findUnique({
    where: { id },
    include: {
      sourcingRequestItem: {
        include: {
          assignments: {
            where: { isActive: true },
            select: { supplierId: true },
          },
        },
      },
    },
  });

  if (!refImage) {
    return NextResponse.json({ error: "Reference image not found" }, { status: 404 });
  }

  // STRICT IDOR OWNERSHIP: Supplier can only view reference images for items assigned to them
  const isAuthorized = refImage.sourcingRequestItem.assignments.some(
    (a) => a.supplierId === supplierId
  );

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to view this reference image" },
      { status: 403 }
    );
  }

  // 3. Stream private blob from Vercel Blob store
  try {
    const { get } = await import("@vercel/blob");
    const result = await get(refImage.url, { access: "private" });

    if (!result || !result.stream) {
      return NextResponse.json({ error: "Private image unavailable" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", result.blob.contentType || "image/jpeg");
    headers.set("Cache-Control", "private, max-age=3600");

    return new Response(result.stream, {
      status: 200,
      headers,
    });
  } catch (blobErr) {
    console.error("Private blob retrieval error:", blobErr);
    return NextResponse.json({ error: "Failed to stream private image" }, { status: 500 });
  }
}
