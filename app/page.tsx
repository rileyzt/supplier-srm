import { auth } from "@/lib/auth";
import { getSupplierEnquiries } from "@/lib/sourcing";
import { SupplierDashboardClient } from "@/components/supplier-dashboard-client";
import AuthenticatedSupplierLayout from "./layout-authenticated";

export default async function DashboardPage() {
  const session = await auth();
  const supplierId = session?.user?.supplierId || "sup_apex";
  const { enquiries, supplier } = await getSupplierEnquiries(supplierId);

  return (
    <AuthenticatedSupplierLayout>
      <SupplierDashboardClient enquiries={enquiries} supplier={supplier} />
    </AuthenticatedSupplierLayout>
  );
}
