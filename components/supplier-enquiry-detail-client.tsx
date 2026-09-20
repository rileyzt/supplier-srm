"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  Camera,
  Eye,
  Info,
} from "lucide-react";
import { useSrmI18n } from "@/lib/srm-i18n";
import type { FlatSupplierEnquiry } from "@/lib/sourcing";

interface SupplierEnquiryDetailClientProps {
  enquiry: FlatSupplierEnquiry;
}

export function SupplierEnquiryDetailClient({
  enquiry,
}: SupplierEnquiryDetailClientProps) {
  const { t } = useSrmI18n();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isApproved = enquiry.status === "APPROVED";
  const hasQuote = !!enquiry.quote && enquiry.quote.price != null;
  const refImages = enquiry.referenceImages || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("detail.back", "Back to All Enquiries")}
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-extrabold text-xs px-3 py-1 rounded-md bg-blue-50 text-[#1a365d] border border-blue-200">
              Order {enquiry.orderNumber}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {t("detail.assigned", "Assigned")} {new Date(enquiry.assignedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {enquiry.productTitle}
          </h1>
          <p className="text-sm text-gray-600 mt-1.5 font-medium">
            {t("detail.variant", "Variant")}: <strong className="text-gray-900">{enquiry.variantTitle || "Default"}</strong> • {t("dash.qty", "Qty")}:{" "}
            <strong className="text-gray-900">{enquiry.quantity} {t("detail.pcs", "pcs")}</strong>
          </p>
        </div>

        <div>
          {isApproved ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {t("enq.status.approved", "Approved & Awarded")}
            </span>
          ) : hasQuote ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {t("enq.status.quoted", "Quote Submitted")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-sm">
              <Clock className="w-5 h-5 text-amber-600" />
              {t("enq.status.awaiting", "Awaiting Quote")}
            </span>
          )}
        </div>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Item specs, images, customization */}
        <div className="lg:col-span-2 space-y-7">
          {/* Specifications Overview */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
              <Package className="w-5 h-5 text-[#1a365d]" />
              {t("detail.specsTitle", "Item Specifications & Production Requirements")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {enquiry.productImageUrl ? (
                <img
                  src={enquiry.productImageUrl}
                  alt={enquiry.productTitle}
                  onClick={() => setSelectedPhoto(enquiry.productImageUrl)}
                  className="w-36 h-36 rounded-2xl object-cover bg-gray-50 border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition shadow-xs"
                />
              ) : (
                <div className="w-36 h-36 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 border border-gray-200">
                  <Package className="w-10 h-10" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5 flex-1 w-full text-sm">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    {t("dash.order", "Order Number")}
                  </span>
                  <span className="font-bold text-gray-900">{enquiry.orderNumber}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    {t("dash.variant", "Size / Cut")}
                  </span>
                  <span className="font-bold text-gray-900">{enquiry.variantTitle || "Standard"}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    {t("dash.qty", "Quantity")}
                  </span>
                  <span className="font-bold text-gray-900">{enquiry.quantity} pcs</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">Status</span>
                  <span className="font-bold text-[#1a365d]">{enquiry.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Photos Gallery (Up to 5 images) */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#1a365d]" />
                {t("detail.refPhotos", "Reference Photos & Details (Up to 5 images)")}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#1a365d] border border-blue-200">
                {refImages.length > 0 ? `${refImages.length} images` : "1 image"}
              </span>
            </div>

            {refImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {refImages.slice(0, 5).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(img.url)}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 cursor-pointer shadow-xs"
                  >
                    <img
                      src={img.url}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="absolute bottom-1 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
                      Photo {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : enquiry.productImageUrl ? (
              <div
                onClick={() => setSelectedPhoto(enquiry.productImageUrl)}
                className="w-36 h-36 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition"
              >
                <img
                  src={enquiry.productImageUrl}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {t("detail.noPhotos", "No additional reference photos uploaded.")}
              </p>
            )}
          </div>

          {/* Jersey Customization Specs */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#1a365d]" />
              {t("enq.table.specs", "Manufacturing & Customization Details")}
            </h2>

            {enquiry.customization && Object.keys(enquiry.customization).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.entries(enquiry.customization).map(([k, v]) => {
                  if (!v || v === "—") return null;
                  return (
                    <div
                      key={k}
                      className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold text-gray-700">{k}</span>
                      <span className="text-sm font-bold text-[#1a365d] bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
                        {String(v)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {t("spec.standard", "Standard catalog item without personal customization.")}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Factory Quotation Summary & Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">
              {t("detail.quoteSummary", "Quotation Summary")}
            </h2>

            {enquiry.quote ? (
              <div className="space-y-3.5 text-sm">
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-gray-600 font-medium">
                    {t("detail.unitPrice", "Unit Price")}:
                  </span>
                  <span className="font-extrabold text-gray-900 text-lg">
                    {enquiry.quote.currency} {enquiry.quote.price}
                  </span>
                </div>
                <div className="p-4 bg-blue-50/60 rounded-xl flex items-center justify-between border border-blue-100">
                  <span className="text-[#1a365d] font-semibold">
                    {t("modal.totalFor", "Total for")} {enquiry.quantity} pcs:
                  </span>
                  <span className="font-extrabold text-[#1a365d] text-lg">
                    {enquiry.quote.currency}{" "}
                    {((enquiry.quote.price || 0) * enquiry.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-gray-600 font-medium">
                    {t("detail.leadTime", "Lead Time")}:
                  </span>
                  <span className="font-bold text-gray-900">
                    {enquiry.quote.productionDays || "3-4"} days
                  </span>
                </div>
                {enquiry.quote.supplierNotes && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 block mb-1">
                      {t("detail.craftNotes", "Craftsmanship Notes")}:
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {enquiry.quote.supplierNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 font-medium">
                No quote submitted yet for this item.
              </div>
            )}

            <Link
              href="/supplier/enquiries"
              className="w-full py-3.5 bg-[#1a365d] hover:bg-[#152c4d] text-white text-sm font-bold rounded-xl text-center block transition shadow-sm"
            >
              {hasQuote
                ? t("enq.btn.updateQuote", "Update Quotation on Enquiries Table")
                : t("enq.btn.submitQuote", "Submit Quotation Now")}
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img
              src={selectedPhoto}
              alt="Preview"
              className="rounded-2xl object-contain max-h-[80vh] w-auto border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-sm shadow-lg hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
