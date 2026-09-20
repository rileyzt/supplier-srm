import AuthenticatedSupplierLayout from "../layout-authenticated";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedSupplierLayout>{children}</AuthenticatedSupplierLayout>;
}
