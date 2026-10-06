import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateProductionTracking } from "@/lib/sourcing";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Derive supplier identity exclusively from server session — NEVER trust client-supplied ID
  const supplierId = session.user.supplierId;
  if (!supplierId) {
    return NextResponse.json(
      { error: "Forbidden: No supplier organization linked to this account" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { assignmentId, status, notes, qcNotes, qcPhotos } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "Missing required field: assignmentId" }, { status: 400 });
    }

    if (status && !["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const result = await updateProductionTracking(assignmentId, supplierId, {
      status,
      notes: notes != null ? String(notes).substring(0, 2000) : undefined,
      qcNotes: qcNotes != null ? String(qcNotes).substring(0, 2000) : undefined,
      qcPhotos: Array.isArray(qcPhotos) ? qcPhotos : undefined,
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      const statusCode = result.status || (result.error?.includes("Forbidden") ? 403 : 400);
      return NextResponse.json({ error: result.error || "Failed to update production" }, { status: statusCode });
    }
  } catch (error) {
    console.error("Supplier production API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
