import AuthenticatedSupplierLayout from "../layout-authenticated";

export default function EnquiriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedSupplierLayout>{children}</AuthenticatedSupplierLayout>;
}
