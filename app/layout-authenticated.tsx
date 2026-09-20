import { auth } from "@/lib/auth";
import { SrmI18nProvider } from "@/lib/srm-i18n";
import { SupplierHeader } from "@/components/supplier-header";

export default async function AuthenticatedSupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return null;

  async function handleLogout() {
    "use server";
    const { signOut } = await import("@/lib/auth");
    await signOut({ redirectTo: "/login" });
  }

  return (
    <SrmI18nProvider>
      <div className="min-h-screen bg-[#f0f4f8]">
        <SupplierHeader
          userName={session.user.name || "Supplier Partner"}
          onLogout={handleLogout}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SrmI18nProvider>
  );
}
