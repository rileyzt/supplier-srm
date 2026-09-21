"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Package,
} from "lucide-react";
import { useSrmI18n } from "@/lib/srm-i18n";
import type { FlatSupplierEnquiry, SupplierOption } from "@/lib/sourcing";

interface SupplierDashboardClientProps {
  enquiries: FlatSupplierEnquiry[];
  supplier: SupplierOption;
}

export function SupplierDashboardClient({
  enquiries,
  supplier,
}: SupplierDashboardClientProps) {
  const { t } = useSrmI18n();

  const pendingQuotes = enquiries.filter((a) => !a.quote || a.status === "SENT");
  const inProduction = enquiries.filter((a) => a.productionTracking?.status === "IN_PROGRESS");
  const approvedQuotes = enquiries.filter((a) => a.status === "APPROVED");

  const stats = [
    {
      label: t("dash.stat.pending", "Pending Quotations"),
      value: pendingQuotes.length.toString(),
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgLight: "bg-amber-50",
    },
    {
      label: t("dash.stat.approved", "Approved Orders"),
      value: approvedQuotes.length.toString(),
      icon: CheckCircle2,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgLight: "bg-emerald-50",
    },
    {
      label: t("dash.stat.inProduction", "In Production"),
      value: inProduction.length.toString(),
      icon: Truck,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      label: t("dash.stat.total", "Total Requests"),
      value: enquiries.length.toString(),
      icon: FileText,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#1a365d] border border-blue-200">
              {supplier.name}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {supplier.city ? `${supplier.city}, ` : ""}{supplier.country}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {t("dash.title", "Manufacturer Operations Portal")}
          </h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            {t(
              "dash.subtitle",
              "Review incoming sourcing requests, submit costings, and upload production updates."
            )}
          </p>
        </div>
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a365d] hover:bg-[#152c4d] text-white text-sm font-bold rounded-xl transition shadow-sm flex-shrink-0"
        >
          <span>{t("dash.viewAll", "View All Enquiries")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Cards with larger readable typography */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1.5">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bgLight} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action Items: Pending Quotations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {t("dash.awaiting.title", "Awaiting Quotation")}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              {t("dash.awaiting.action", "Action Required")}
            </span>
          </div>
          <Link
            href="/enquiries"
            className="text-sm font-bold text-[#1a365d] hover:underline flex items-center gap-1.5"
          >
            {t("dash.viewAll", "View all")} ({pendingQuotes.length}){" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingQuotes.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            {t(
              "dash.awaiting.none",
              "No pending quote requests. All enquiries have been responded to."
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingQuotes.slice(0, 4).map((asgn) => (
              <div
                key={asgn.assignmentId}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition"
              >
                <div className="flex items-center gap-4">
                  {asgn.productImageUrl ? (
                    <img
                      src={asgn.productImageUrl}
                      alt={asgn.productTitle}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{asgn.productTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("dash.order", "Order")}:{" "}
                      <span className="font-semibold text-gray-800">{asgn.orderNumber}</span> •{" "}
                      {t("dash.qty", "Qty")}:{" "}
                      <span className="font-semibold text-gray-800">{asgn.quantity}</span> •{" "}
                      {t("dash.variant", "Variant")}:{" "}
                      <span className="font-semibold text-gray-800">
                        {asgn.variantTitle || "Default"}
                      </span>
                    </p>
                  </div>
                </div>

                <Link
                  href={`/enquiries?quote=${asgn.assignmentId}`}
                  className="w-10 h-10 bg-[#1a365d] hover:bg-[#152c4d] text-white rounded-xl transition flex items-center justify-center shadow-sm"
                  aria-label={t("dash.submitQuote", "Submit Quote")}
                  title={t("dash.submitQuote", "Submit Quote")}
                >
                  <ExternalLink className="w-4.5 h-4.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
