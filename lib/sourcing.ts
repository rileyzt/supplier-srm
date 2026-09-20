import { prisma } from "@/lib/db";

export interface FlatSupplierEnquiry {
  assignmentId: string;
  itemId: string;
  sourcingRequestId: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerName: string | null;
  productTitle: string;
  variantTitle: string | null;
  quantity: number;
  customization: Record<string, any> | null;
  productImageUrl: string | null;
  referenceImages?: { id?: string; url: string; storageKey?: string }[];
  status: string;
  assignedAt: string;
  quote?: {
    id: string;
    availability: "AVAILABLE" | "NOT_AVAILABLE" | "PARTIALLY_AVAILABLE";
    price: number | null;
    currency: string;
    productionDays: number | null;
    estimatedDelivery: string | null;
    supplierNotes: string | null;
    status: string;
  } | null;
  productionTracking?: {
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    notes: string | null;
  } | null;
  qcSubmissions?: {
    id: string;
    status: string;
    supplierNotes: string | null;
    adminNotes: string | null;
    photos: { id: string; url: string }[];
    submittedAt: string | null;
  }[];
}

export interface SupplierOption {
  id: string;
  name: string;
  country: string;
  city?: string | null;
  contactPerson?: string | null;
  email?: string;
  phone?: string | null;
  preferredLang?: string;
  category?: string | null;
  isActive?: boolean;
  paymentTerms?: string | null;
  currency?: string;
  capabilities?: string[];
}

export async function getSupplierEnquiries(
  supplierId: string
): Promise<{
  enquiries: FlatSupplierEnquiry[];
  supplier: SupplierOption;
}> {
  if (process.env.DATABASE_URL) {
    try {
      const supplierRecord = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplierRecord) {
        throw new Error("Supplier record not found");
      }

      const assignments = await prisma.supplierAssignment.findMany({
        where: {
          supplierId,
          isActive: true,
        },
        include: {
          supplier: true,
          sourcingRequestItem: {
            include: {
              sourcingRequest: true,
              referenceImages: true,
            },
          },
          quote: true,
          productionTracking: true,
          qcSubmissions: {
            include: {
              photos: true,
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      });

      const enquiries: FlatSupplierEnquiry[] = assignments.map((asgn) => ({
        assignmentId: asgn.id,
        itemId: asgn.sourcingRequestItem.id,
        sourcingRequestId: asgn.sourcingRequestItem.sourcingRequest.id,
        shopifyOrderId: asgn.sourcingRequestItem.sourcingRequest.shopifyOrderId,
        orderNumber: asgn.sourcingRequestItem.sourcingRequest.shopifyOrderNumber,
        customerName: asgn.sourcingRequestItem.sourcingRequest.customerName,
        productTitle: asgn.sourcingRequestItem.productTitle,
        variantTitle: asgn.sourcingRequestItem.variantTitle,
        quantity: asgn.sourcingRequestItem.quantity,
        customization: asgn.sourcingRequestItem.customization as Record<string, any> | null,
        productImageUrl: asgn.sourcingRequestItem.referenceImages[0]?.id
          ? `/api/reference-images/${asgn.sourcingRequestItem.referenceImages[0].id}`
          : asgn.sourcingRequestItem.productImageUrl,
        referenceImages: asgn.sourcingRequestItem.referenceImages.map((img) => ({
          id: img.id,
          url: `/api/reference-images/${img.id}`,
          storageKey: img.storageKey,
        })),
        status: asgn.status,
        assignedAt: asgn.assignedAt.toISOString(),
        quote: asgn.quote
          ? {
              id: asgn.quote.id,
              availability: asgn.quote.availability as any,
              price: asgn.quote.price ? Number(asgn.quote.price) : null,
              currency: asgn.quote.currency,
              productionDays: asgn.quote.productionDays,
              estimatedDelivery: asgn.quote.estimatedDelivery,
              supplierNotes: asgn.quote.supplierNotes,
              status: asgn.quote.status,
            }
          : null,
        productionTracking: asgn.productionTracking
          ? {
              status: asgn.productionTracking.status,
              startedAt: asgn.productionTracking.startedAt ? asgn.productionTracking.startedAt.toISOString() : null,
              completedAt: asgn.productionTracking.completedAt ? asgn.productionTracking.completedAt.toISOString() : null,
              notes: asgn.productionTracking.notes,
            }
          : null,
        qcSubmissions: asgn.qcSubmissions.map((qc) => ({
          id: qc.id,
          status: qc.status,
          supplierNotes: qc.supplierNotes,
          adminNotes: qc.adminNotes,
          photos: qc.photos.map((p) => ({ id: p.id, url: p.url })),
          submittedAt: qc.submittedAt ? qc.submittedAt.toISOString() : null,
        })),
      }));

      return {
        enquiries,
        supplier: supplierRecord,
      };
    } catch (err) {
      console.error("Database query failed in getSupplierEnquiries:", err);
      throw err;
    }
  }

  // Fallback for offline development without DB
  return {
    enquiries: [],
    supplier: {
      id: supplierId || "sup_apex",
      name: "Guangzhou Apex Sportswear Ltd",
      country: "China",
      city: "Guangzhou",
      currency: "CNY",
    },
  };
}

export async function submitSupplierQuote(
  assignmentId: string,
  supplierId: string,
  quoteData: {
    availability: "AVAILABLE" | "NOT_AVAILABLE" | "PARTIALLY_AVAILABLE";
    price: number | null;
    currency: string;
    productionDays: number | null;
    estimatedDelivery?: string | null;
    supplierNotes?: string | null;
  }
): Promise<{ success: boolean; error?: string; status?: number }> {
  if (!process.env.DATABASE_URL) {
    return { success: true };
  }

  try {
    const assignment = await prisma.supplierAssignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, supplierId: true },
    });

    if (!assignment) {
      return { success: false, error: "Assignment not found", status: 404 };
    }

    // STRICT SERVER-SIDE IDOR CHECK: Supplier can ONLY quote their own assignments
    if (assignment.supplierId !== supplierId) {
      return {
        success: false,
        error: "Forbidden: You do not own this assignment",
        status: 403,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.supplierQuote.upsert({
        where: { assignmentId },
        create: {
          assignmentId,
          availability: quoteData.availability,
          price: quoteData.price != null ? quoteData.price : null,
          currency: quoteData.currency || "CNY",
          productionDays: quoteData.productionDays,
          estimatedDelivery: quoteData.estimatedDelivery || null,
          supplierNotes: quoteData.supplierNotes || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
        update: {
          availability: quoteData.availability,
          price: quoteData.price != null ? quoteData.price : null,
          currency: quoteData.currency || "CNY",
          productionDays: quoteData.productionDays,
          estimatedDelivery: quoteData.estimatedDelivery || null,
          supplierNotes: quoteData.supplierNotes || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      await tx.supplierAssignment.update({
        where: { id: assignmentId },
        data: { status: "RESPONDED" },
      });
    });

    return { success: true };
  } catch (err) {
    console.error("Database submitSupplierQuote error:", err);
    return { success: false, error: "Failed to save quotation to database", status: 500 };
  }
}
