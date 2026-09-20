import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { submitSupplierQuote } from "@/lib/sourcing";

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
    const {
      assignmentId,
      availability,
      price,
      currency,
      productionDays,
      estimatedDelivery,
      supplierNotes,
    } = body;

    if (!assignmentId || !availability) {
      return NextResponse.json({ error: "Missing required fields (assignmentId, availability)" }, { status: 400 });
    }

    const validAvailability = ["AVAILABLE", "NOT_AVAILABLE", "PARTIALLY_AVAILABLE"];
    if (!validAvailability.includes(availability)) {
      return NextResponse.json({ error: "Invalid availability value" }, { status: 400 });
    }

    const result = await submitSupplierQuote(assignmentId, supplierId, {
      availability,
      price: price != null ? parseFloat(price) : null,
      currency: currency || "CNY",
      productionDays: productionDays != null ? parseInt(productionDays, 10) : null,
      estimatedDelivery: estimatedDelivery ? String(estimatedDelivery).substring(0, 100) : null,
      supplierNotes: supplierNotes ? String(supplierNotes).substring(0, 1000) : null,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      const statusCode = result.status || (result.error?.includes("Forbidden") ? 403 : 400);
      return NextResponse.json({ error: result.error || "Failed to update quote" }, { status: statusCode });
    }
  } catch (error) {
    console.error("Supplier quote submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
