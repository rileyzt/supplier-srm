"use client";

import {
  Building2,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useSrmI18n } from "@/lib/srm-i18n";
import type { FlatSupplierEnquiry, SupplierOption } from "@/lib/sourcing";

interface SupplierProfileClientProps {
  supplier: SupplierOption;
  enquiries: FlatSupplierEnquiry[];
  userEmail: string;
}

export function SupplierProfileClient({
  supplier,
  enquiries,
  userEmail,
}: SupplierProfileClientProps) {
  const { t } = useSrmI18n();

  const completedOrders = enquiries.filter((e) => e.status === "APPROVED");

  return (
    <div className="space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-[#1a365d] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {supplier.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {supplier.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t("profile.verified", "Verified Core Supplier")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5 font-medium">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>
                  {supplier.city ? `${supplier.city}, ` : ""}{supplier.country}
                </span>
                <span>•</span>
                <span>
                  {t("profile.category", "Category")}: <strong className="text-gray-800">{supplier.category || "Football Kits"}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">
                {t("profile.loggedInAs", "Logged in as")}
              </span>
              <span className="text-sm font-bold text-gray-800">{userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details & Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Organization & Contact Info */}
        <div className="lg:col-span-2 space-y-7">
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#1a365d]" />
              {t("profile.title", "Manufacturing Organization Details")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  {t("profile.companyName", "Company Name")}
                </span>
                <span className="font-bold text-gray-900 text-base">{supplier.name}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  {t("profile.country", "Country / Region")}
                </span>
                <span className="font-bold text-gray-900 text-base">
                  {supplier.city ? `${supplier.city}, ` : ""}{supplier.country}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  {t("profile.contact", "Primary Contact Person")}
                </span>
                <span className="font-bold text-gray-900 text-base">
                  {supplier.contactPerson || "Li Wei"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">Contact Email</span>
                <span className="font-bold text-gray-900 text-base">
                  {supplier.email || "contact@apexjerseys.com"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  Direct Phone / WeChat
                </span>
                <span className="font-bold text-gray-900 text-base">
                  {supplier.phone || "+86 20 8888 1234"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  {t("profile.currency", "Operating Currency")}
                </span>
                <span className="font-extrabold text-[#1a365d] text-base">
                  {supplier.currency} (¥)
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#1a365d]" />
              {t("profile.capabilities", "Verified Manufacturing Capabilities")}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              These verified manufacturing capabilities determine which custom jersey requests are routed to your facility:
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {(supplier.capabilities || []).map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#1a365d] border border-blue-200 font-bold text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settlement & Terms */}
        <div className="space-y-7">
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-[#1a365d]" />
              {t("profile.paymentTerms", "Payment & Settlement Terms")}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  Agreed Payment Terms
                </span>
                <span className="font-extrabold text-gray-900 text-base">
                  {supplier.paymentTerms || "30% Advance, 70% Post-QC"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  Standard Production Cycle
                </span>
                <span className="font-bold text-gray-900 text-base">3-5 business days</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block mb-1">
                  {t("profile.compliance", "Factory Audit Score")}
                </span>
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-base">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grade A (98.4% Pass Rate)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-[#1a365d] text-white rounded-3xl p-7 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-bold text-white/60 tracking-wider">
              Historical Operational Volume
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-3xl font-extrabold">{enquiries.length}</span>
                <span className="text-xs text-white/70 block mt-1">Total RFQs Received</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold">{completedOrders.length}</span>
                <span className="text-xs text-white/70 block mt-1">Approved Orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
