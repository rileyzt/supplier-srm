import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PORTAL_NAME
    ? `${process.env.NEXT_PUBLIC_PORTAL_NAME} — SRM Portal`
    : "SRM Portal — Partner Operations",
  description: "Manufacturer & Supplier Relationship Management Portal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f0f4f8]">
        {children}
      </body>
    </html>
  );
}
