"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  X,
  Send,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useSrmI18n } from "@/lib/srm-i18n";

interface FlatEnquiry {
  assignmentId: string;
  itemId: string;
  orderNumber: string;
  productTitle: string;
  variantTitle: string | null;
  quantity: number;
  customization: Record<string, any> | null;
  productImageUrl: string | null;
  referenceImages?: { id?: string; url: string; storageKey?: string }[];
  status: string;
  quote?: {
    id: string;
    availability: string;
    price: number | null;
    currency: string;
    productionDays: number | null;
    estimatedDelivery: string | null;
    supplierNotes: string | null;
    status: string;
  } | null;
  productionTracking?: {
    status: string;
  } | null;
}

export default function SupplierEnquiriesPage() {
  const { t } = useSrmI18n();
  const searchParams = useSearchParams();
  const [enquiries, setEnquiries] = useState<FlatEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Quotation Modal
  const [quotingEnquiry, setQuotingEnquiry] = useState<FlatEnquiry | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    availability: "AVAILABLE" as "AVAILABLE" | "NOT_AVAILABLE" | "PARTIALLY_AVAILABLE",
    price: "",
    currency: "CNY",
    productionDays: "3",
    estimatedDelivery: "3-5 business days",
    supplierNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/supplier/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Auto-open quote modal from ?quote= param (dashboard shortcut)
  useEffect(() => {
    const quoteId = searchParams.get("quote");
    if (quoteId && enquiries.length > 0 && !quotingEnquiry) {
      const target = enquiries.find(
        (e) => e.assignmentId === quoteId || e.itemId === quoteId
      );
      if (target) {
        openQuoteModal(target);
        // Clear the query param to avoid re-opening on navigation
        window.history.replaceState(null, "", "/enquiries");
      }
    }
  }, [searchParams, enquiries]);

  const openQuoteModal = (enquiry: FlatEnquiry) => {
    setQuotingEnquiry(enquiry);
    if (enquiry.quote) {
      setQuoteForm({
        availability: enquiry.quote.availability as any,
        price: enquiry.quote.price ? enquiry.quote.price.toString() : "",
        currency: enquiry.quote.currency || "CNY",
        productionDays: enquiry.quote.productionDays ? enquiry.quote.productionDays.toString() : "3",
        estimatedDelivery: enquiry.quote.estimatedDelivery || "3-5 business days",
        supplierNotes: enquiry.quote.supplierNotes || "",
      });
    } else {
      setQuoteForm({
        availability: "AVAILABLE",
        price: "",
        currency: "CNY",
        productionDays: "3",
        estimatedDelivery: "3-5 business days",
        supplierNotes: "",
      });
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingEnquiry) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/supplier/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: quotingEnquiry.assignmentId,
          ...quoteForm,
        }),
      });

      if (res.ok) {
        await fetchEnquiries();
        setQuotingEnquiry(null);
      }
    } catch (err) {
      console.error("Quote submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format camelCase keys to Title Case labels and apply renames
  const formatSpecLabel = (key: string): string | null => {
    // Hide boolean flags
    if (key === "hasNameSet" || key === "hasPatches") return null;
    // Rename playerName to NameSet
    if (key === "playerName") return "NameSet";
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return !e.quote || e.status === "SENT";
    if (statusFilter === "QUOTED") return e.quote?.price != null && e.status !== "APPROVED";
    if (statusFilter === "APPROVED") return e.status === "APPROVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {t("enq.title", "Sourcing Enquiries & RFQs")}
          </h1>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {t(
              "enq.subtitle",
              "Review specifications, enter quotation amounts, and manage confirmed orders."
            )}
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("enq.searchPlaceholder", "Search by order or product title...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a365d] shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto overflow-x-auto shadow-xs">
          {[
            { id: "ALL", label: t("enq.tab.all", "All Enquiries") },
            { id: "PENDING", label: t("enq.tab.pending", "Awaiting Quote") },
            { id: "QUOTED", label: t("enq.tab.quoted", "Quotes Submitted") },
            { id: "APPROVED", label: t("enq.tab.approved", "Approved / Awarded") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#1a365d] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table with Upgraded Typography */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-sm text-gray-500 font-medium">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1a365d]" />
            Loading enquiries...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500 font-medium">
            {t("enq.noEnquiries", "No enquiries found under this filter.")}
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table View (hidden on screens < 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50/90 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-4 px-5">{t("enq.table.orderItem", "Order & Item")}</th>
                    <th className="py-4 px-5">{t("enq.table.specs", "Specifications & Customization")}</th>
                    <th className="py-4 px-5 text-center">{t("enq.table.qty", "Qty")}</th>
                    <th className="py-4 px-5">{t("enq.table.status", "Quotation Status")}</th>
                    <th className="py-4 px-5">{t("enq.table.unitCost", "Unit Cost")}</th>
                    <th className="py-4 px-5 text-right">{t("enq.table.action", "Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEnquiries.map((enquiry) => {
                    const isApproved = enquiry.status === "APPROVED";
                    const hasQuote = !!enquiry.quote && enquiry.quote.price != null;
                    const refImages = enquiry.referenceImages || [];

                    return (
                      <tr key={enquiry.assignmentId} className="hover:bg-gray-50/70 transition">
                        {/* Product details */}
                        <td className="py-5 px-5">
                          <div className="flex items-start gap-4">
                            {enquiry.productImageUrl ? (
                              <img
                                src={enquiry.productImageUrl}
                                alt={enquiry.productTitle}
                                onClick={() => setPreviewImage(enquiry.productImageUrl)}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900 text-base">
                                {enquiry.productTitle}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 font-medium">
                                Order <span className="font-bold text-[#1a365d]">{enquiry.orderNumber}</span> •{" "}
                                {enquiry.variantTitle || "Default Variant"}
                              </div>
                              {/* Additional Reference Photos Thumbnails */}
                              {refImages.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span className="text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                                    {refImages.length} {t("spec.refImages", "Photos")}:
                                  </span>
                                  {refImages.slice(0, 5).map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img.url}
                                      alt={`Ref ${idx + 1}`}
                                      onClick={() => setPreviewImage(img.url)}
                                      className="w-7 h-7 rounded-md object-cover border border-gray-200 cursor-pointer hover:scale-110 transition"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customization & Specs */}
                        <td className="py-5 px-5">
                          {enquiry.customization ? (
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {Object.entries(enquiry.customization).map(([k, v]) => {
                                if (!v || v === "" || v === "None") return null;
                                const label = formatSpecLabel(k);
                                if (!label) return null;
                                if (typeof v === "boolean") return null;
                                return (
                                  <span
                                    key={k}
                                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
                                  >
                                    <strong>{label}:</strong> {String(v)}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {t("spec.standard", "Standard Catalog Item")}
                            </span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="py-5 px-5 text-center font-bold text-gray-900 text-base">
                          {enquiry.quantity}
                        </td>

                        {/* Status */}
                        <td className="py-5 px-5">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t("enq.status.approved", "Approved / Awarded")}
                            </span>
                          ) : hasQuote ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                              <Sparkles className="w-3.5 h-3.5" />
                              {t("enq.status.quoted", "Quote Submitted")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              {t("enq.status.awaiting", "Awaiting Quote")}
                            </span>
                          )}
                        </td>

                        {/* Quote Price */}
                        <td className="py-5 px-5">
                          {hasQuote ? (
                            <div>
                              <span className="font-extrabold text-gray-900 text-base">
                                {enquiry.quote?.currency} {enquiry.quote?.price}
                              </span>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">
                                Lead: {enquiry.quote?.productionDays || "3-4"} days
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium">—</span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-5 px-5 text-right">
                          <button
                            onClick={() => openQuoteModal(enquiry)}
                            aria-label={isApproved ? t("enq.btn.viewOrder", "View Order") : hasQuote ? t("enq.btn.updateQuote", "Update Quote") : t("enq.btn.submitQuote", "Submit Quote")}
                            title={isApproved ? t("enq.btn.viewOrder", "View Order") : hasQuote ? t("enq.btn.updateQuote", "Update Quote") : t("enq.btn.submitQuote", "Submit Quote")}
                            className={`w-10 h-10 rounded-xl transition flex items-center justify-center ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                                : hasQuote
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                                : "bg-[#1a365d] text-white hover:bg-[#152c4d] shadow-sm"
                            }`}
                          >
                            <ExternalLink className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (visible on viewports < 640px) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredEnquiries.map((enquiry) => {
                const isApproved = enquiry.status === "APPROVED";
                const hasQuote = !!enquiry.quote && enquiry.quote.price != null;
                const refImages = enquiry.referenceImages || [];

                return (
                  <div key={enquiry.assignmentId} className="p-4 space-y-3.5 bg-white">
                    {/* Header: Order & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#1a365d] border border-blue-200">
                        {enquiry.orderNumber}
                      </span>
                      <div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("enq.status.approved", "Approved")}
                          </span>
                        ) : hasQuote ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                            <Sparkles className="w-3 h-3" />
                            {t("enq.status.quoted", "Quoted")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            <Clock className="w-3 h-3" />
                            {t("enq.status.awaiting", "Awaiting Quote")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product & Image Row */}
                    <div className="flex items-start gap-3">
                      {enquiry.productImageUrl ? (
                        <img
                          src={enquiry.productImageUrl}
                          alt={enquiry.productTitle}
                          onClick={() => setPreviewImage(enquiry.productImageUrl)}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0 cursor-pointer"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {enquiry.productTitle}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {enquiry.variantTitle || "Default"} • <strong className="text-gray-900">{enquiry.quantity} pcs</strong>
                        </p>
                      </div>
                    </div>

                    {/* Customization Badges */}
                    {enquiry.customization && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Object.entries(enquiry.customization).map(([k, v]) => {
                          if (!v || v === "" || v === "None") return null;
                          const label = formatSpecLabel(k);
                          if (!label) return null;
                          if (typeof v === "boolean") return null;
                          return (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                            >
                              <strong>{label}:</strong> {String(v)}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Reference Images Thumbnails */}
                    {refImages.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                          <Camera className="w-3.5 h-3.5 text-gray-400" />
                          {refImages.length} {t("spec.refImages", "Photos")}:
                        </span>
                        {refImages.slice(0, 5).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Ref ${idx + 1}`}
                            onClick={() => setPreviewImage(img.url)}
                            className="w-7 h-7 rounded-md object-cover border border-gray-200 cursor-pointer"
                          />
                        ))}
                      </div>
                    )}

                    {/* Price and Action Footer */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        {hasQuote ? (
                          <div>
                            <span className="text-xs text-gray-500 font-medium block">
                              {t("enq.mobile.cost", "Unit Cost")}
                            </span>
                            <span className="font-extrabold text-gray-900 text-sm">
                              {enquiry.quote?.currency} {enquiry.quote?.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">—</span>
                        )}
                      </div>

                      <button
                        onClick={() => openQuoteModal(enquiry)}
                        aria-label={isApproved ? t("enq.btn.viewOrder", "View Order") : hasQuote ? t("enq.btn.updateQuote", "Update Quote") : t("enq.btn.submitQuote", "Submit Quote")}
                        title={isApproved ? t("enq.btn.viewOrder", "View Order") : hasQuote ? t("enq.btn.updateQuote", "Update Quote") : t("enq.btn.submitQuote", "Submit Quote")}
                        className={`w-10 h-10 rounded-xl transition flex items-center justify-center ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            : hasQuote
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                            : "bg-[#1a365d] text-white hover:bg-[#152c4d] shadow-sm"
                        }`}
                      >
                        <ExternalLink className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for reference photos */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img
              src={previewImage}
              alt="Reference Detail"
              className="rounded-2xl object-contain max-h-[80vh] w-auto border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-sm shadow-lg hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {quotingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-7 space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t("modal.title", "Quotation Submission")}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Order {quotingEnquiry.orderNumber} • {quotingEnquiry.productTitle}
                </p>
              </div>
              <button
                onClick={() => setQuotingEnquiry(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              {/* Availability */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {t("modal.availability", "Availability *")}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "AVAILABLE", label: t("modal.opt.available", "Available") },
                    { id: "PARTIALLY_AVAILABLE", label: t("modal.opt.partial", "Partial") },
                    { id: "NOT_AVAILABLE", label: t("modal.opt.unavailable", "Unavailable") },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setQuoteForm({ ...quoteForm, availability: opt.id as any })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition ${
                        quoteForm.availability === opt.id
                          ? "bg-[#1a365d] text-white border-[#1a365d] shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t("modal.unitPrice", "Unit Price (per piece) *")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                      {quoteForm.currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="45.00"
                      value={quoteForm.price}
                      onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                      className="w-full pl-14 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:border-[#1a365d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t("modal.leadTime", "Production Days (Lead Time) *")}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    value={quoteForm.productionDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, productionDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-base font-semibold text-gray-900 focus:outline-none focus:border-[#1a365d]"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              {quoteForm.price && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                  <span className="text-gray-600 font-medium">
                    {t("modal.totalFor", "Total for")} {quotingEnquiry.quantity}{" "}
                    {t("modal.items", "items")}:
                  </span>
                  <span className="font-extrabold text-gray-900 text-base">
                    {quoteForm.currency} {(parseFloat(quoteForm.price || "0") * quotingEnquiry.quantity).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t("modal.notesLabel", "Manufacturer Notes / Remarks")}
                </label>
                <textarea
                  rows={3}
                  value={quoteForm.supplierNotes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, supplierNotes: e.target.value })}
                  placeholder={t(
                    "modal.notesPlaceholder",
                    "e.g. Sublimation with silicone crest, official font typography included..."
                  )}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a365d]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setQuotingEnquiry(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  {t("modal.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? t("modal.submitting", "Submitting...")
                    : t("modal.submit", "Send Quotation to Captain Vault")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
