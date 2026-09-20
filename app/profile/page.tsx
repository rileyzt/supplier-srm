import { auth } from "@/lib/auth";
import { getSupplierEnquiries } from "@/lib/sourcing";
import { SupplierProfileClient } from "@/components/supplier-profile-client";

export default async function ProfilePage() {
  const session = await auth();
  const supplierId = session?.user?.supplierId || "sup_apex";
  const { supplier, enquiries } = await getSupplierEnquiries(supplierId);

  return (
    <SupplierProfileClient
      supplier={supplier}
      enquiries={enquiries}
      userEmail={session?.user?.email || supplier.email || "supplier@apexjerseys.com"}
    />
  );
}
