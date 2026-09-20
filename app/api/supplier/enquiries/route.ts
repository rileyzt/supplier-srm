import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSupplierEnquiries } from "@/lib/sourcing";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supplierId = session.user.supplierId;
  if (!supplierId) {
    return NextResponse.json(
      { error: "Forbidden: No supplier organization linked to this account" },
      { status: 403 }
    );
  }

  try {
    const data = await getSupplierEnquiries(supplierId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load supplier enquiries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
