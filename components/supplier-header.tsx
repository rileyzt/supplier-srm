"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSrmI18n } from "@/lib/srm-i18n";
import { SrmLanguageSwitcher } from "@/components/language-switcher";

interface SupplierHeaderProps {
  userName: string;
  onLogout: () => Promise<void>;
}

export function SupplierHeader({ userName, onLogout }: SupplierHeaderProps) {
  const pathname = usePathname();
  const { t } = useSrmI18n();

  const navLinks = [
    { href: "/", label: t("nav.dashboard", "Dashboard") },
    { href: "/enquiries", label: t("nav.enquiries", "Enquiries & Quotes") },
    { href: "/profile", label: t("nav.profile", "Profile") },
  ];

  return (
    <header className="bg-[#1a365d] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left — Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-bold tracking-wider">
              SRM
            </div>
            <div>
              <p className="text-base font-bold leading-none">{t("nav.srmPortal", "SRM Portal")}</p>
              <p className="text-xs text-white/60 mt-0.5">{process.env.NEXT_PUBLIC_PORTAL_NAME || "Partner Operations"}</p>
            </div>
          </Link>

          {/* Center — Nav Tabs with enhanced typography */}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg font-semibold transition ${
                    isActive
                      ? "bg-white/20 text-white shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right — Language Switcher, User & Logout */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Language Switcher in the top right */}
            <SrmLanguageSwitcher />

            <div className="hidden sm:block text-right">
              <span className="text-sm font-semibold text-white/90 block">{userName}</span>
              <span className="text-[11px] text-white/50 block">
                {t("nav.verifiedFactory", "Verified Factory")}
              </span>
            </div>

            <form action={onLogout}>
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
              >
                {t("nav.logout", "Logout")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
