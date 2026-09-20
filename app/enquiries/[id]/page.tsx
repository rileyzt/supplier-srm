import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSupplierEnquiries } from "@/lib/sourcing";
import { SupplierEnquiryDetailClient } from "@/components/supplier-enquiry-detail-client";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const supplierId = session?.user?.supplierId || "sup_apex";
  const { enquiries } = await getSupplierEnquiries(supplierId);

  const enquiry = enquiries.find((e) => e.assignmentId === id || e.itemId === id);
  if (!enquiry) {
    notFound();
  }

  return <SupplierEnquiryDetailClient enquiry={enquiry} />;
}
