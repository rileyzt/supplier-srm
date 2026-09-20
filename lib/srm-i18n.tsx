"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SrmLanguage = "en" | "zh";

interface I18nContextType {
  language: SrmLanguage;
  setLanguage: (lang: SrmLanguage) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<SrmLanguage, Record<string, string>> = {
  en: {
    // Nav & Layout
    "nav.srmPortal": "SRM Portal",
    "nav.brand": process.env.NEXT_PUBLIC_PORTAL_NAME || "Partner Operations",
    "nav.dashboard": "Dashboard",
    "nav.enquiries": "Enquiries & Quotes",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.verifiedFactory": "Verified Factory",
    "lang.switch": "Language",

    // Dashboard
    "dash.title": "Manufacturer Operations Portal",
    "dash.subtitle":
      "Review incoming sourcing requests, submit costings, and upload production updates.",
    "dash.viewAll": "View All Enquiries",
    "dash.stat.pending": "Pending Quotations",
    "dash.stat.approved": "Approved Orders",
    "dash.stat.inProduction": "In Production",
    "dash.stat.total": "Total Requests",
    "dash.awaiting.title": "Awaiting Quotation",
    "dash.awaiting.action": "Action Required",
    "dash.awaiting.none": "No pending quote requests. All enquiries have been responded to.",
    "dash.order": "Order",
    "dash.qty": "Qty",
    "dash.variant": "Variant",
    "dash.submitQuote": "Submit Quote",

    // Enquiries List
    "enq.title": "Sourcing Enquiries & RFQs",
    "enq.subtitle": "Review specifications, enter quotation amounts, and manage confirmed orders.",
    "enq.searchPlaceholder": "Search by order or product title...",
    "enq.tab.all": "All Enquiries",
    "enq.tab.pending": "Awaiting Quote",
    "enq.tab.quoted": "Quotes Submitted",
    "enq.tab.approved": "Approved / Awarded",
    "enq.table.orderItem": "Order & Item",
    "enq.table.specs": "Specifications & Customization",
    "enq.table.qty": "Qty",
    "enq.table.status": "Quotation Status",
    "enq.table.unitCost": "Unit Cost",
    "enq.table.action": "Action",
    "enq.noEnquiries": "No enquiries found under this filter.",
    "enq.status.approved": "Approved / Awarded",
    "enq.status.quoted": "Quote Submitted",
    "enq.status.awaiting": "Awaiting Quote",
    "enq.btn.viewOrder": "View Order",
    "enq.btn.updateQuote": "Update Quote",
    "enq.btn.submitQuote": "Submit Quote",
    "enq.mobile.lead": "Lead Time",
    "enq.mobile.cost": "Unit Cost",

    // Specs & Customization Details
    "spec.version": "Version",
    "spec.fanVersion": "Fan Version",
    "spec.playerVersion": "Player Version",
    "spec.retro": "Retro",
    "spec.size": "Size",
    "spec.nameSet": "Name Set",
    "spec.noNameSet": "No Name Set",
    "spec.player": "Player",
    "spec.number": "Number",
    "spec.patches": "Patches",
    "spec.noPatches": "No Patches",
    "spec.comments": "Production Notes",
    "spec.refImages": "Reference Photos",
    "spec.standard": "Standard Catalog Item",

    // Quotation Modal
    "modal.title": "Quotation Submission",
    "modal.availability": "Availability *",
    "modal.opt.available": "Available",
    "modal.opt.partial": "Partial",
    "modal.opt.unavailable": "Unavailable",
    "modal.unitPrice": "Unit Price (per piece) *",
    "modal.leadTime": "Production Days (Lead Time) *",
    "modal.totalFor": "Total for",
    "modal.items": "items",
    "modal.notesLabel": "Manufacturer Notes / Craftsmanship Remarks",
    "modal.notesPlaceholder": "e.g. Sublimation with heat-pressed silicone crest, official font typography...",
    "modal.cancel": "Cancel",
    "modal.submit": "Send Quotation",
    "modal.submitting": "Submitting...",

    // Detail Page
    "detail.back": "Back to All Enquiries",
    "detail.specsTitle": "Item Specifications & Production Requirements",
    "detail.refPhotos": "Reference Photos & Details (Up to 5 images)",
    "detail.noPhotos": "No additional reference photos uploaded.",
    "detail.quoteSummary": "Quotation Summary",
    "detail.quoteStatus": "Quote Status",
    "detail.unitPrice": "Unit Price",
    "detail.leadTime": "Lead Time",
    "detail.delivery": "Est. Delivery",
    "detail.craftNotes": "Craftsmanship Notes",
    "detail.variant": "Variant",
    "detail.assigned": "Assigned",
    "detail.pcs": "pcs",

    // Profile
    "profile.title": "Manufacturer Profile & Credentials",
    "profile.verified": "Verified Core Supplier",
    "profile.contact": "Primary Contact",
    "profile.city": "Manufacturing Hub",
    "profile.country": "Country / Region",
    "profile.currency": "Settlement Currency",
    "profile.paymentTerms": "Payment Terms",
    "profile.capabilities": "Verified Manufacturing Capabilities",
    "profile.compliance": "Factory Audit Score",
    "profile.companyName": "Company Name",
    "profile.category": "Category",
    "profile.loggedInAs": "Logged in as",
  },
  zh: {
    // Nav & Layout
    "nav.srmPortal": "SRM 供应商门户",
    "nav.brand": "Captain Vault",
    "nav.dashboard": "控制台首页",
    "nav.enquiries": "询价需求与报价",
    "nav.profile": "工厂档案",
    "nav.logout": "退出登录",
    "nav.verifiedFactory": "认证合作工厂",
    "lang.switch": "语言 / Language",

    // Dashboard
    "dash.title": "制造运营协同门户",
    "dash.subtitle":
      "查看来自 Captain Vault 的采购询价订单，提交出厂单价与交期，协同管理定制球衣生产。",
    "dash.viewAll": "查看全部需求",
    "dash.stat.pending": "待处理报价",
    "dash.stat.approved": "已中标订单",
    "dash.stat.inProduction": "正在生产中",
    "dash.stat.total": "累计需求总数",
    "dash.awaiting.title": "待报价需求",
    "dash.awaiting.action": "需要处理",
    "dash.awaiting.none": "暂无待报价需求，所有询价均已响应完成。",
    "dash.order": "订单号",
    "dash.qty": "数量",
    "dash.variant": "尺码/款式",
    "dash.submitQuote": "提交报价",

    // Enquiries List
    "enq.title": "采购询价与定制需求 (RFQ)",
    "enq.subtitle": "查看客制球衣详细工艺参数，输入单件出厂报价及生产交期，跟进确认订单。",
    "enq.searchPlaceholder": "按订单号或球衣名称搜索...",
    "enq.tab.all": "全部需求",
    "enq.tab.pending": "待报价",
    "enq.tab.quoted": "已提交报价",
    "enq.tab.approved": "已中标/生产中",
    "enq.table.orderItem": "订单与商品",
    "enq.table.specs": "工艺规格与定制参数",
    "enq.table.qty": "数量",
    "enq.table.status": "报价状态",
    "enq.table.unitCost": "出厂单价",
    "enq.table.action": "操作",
    "enq.noEnquiries": "当前筛选条件下暂无需求。",
    "enq.status.approved": "已中标 / 安排生产",
    "enq.status.quoted": "已报价 (待确认)",
    "enq.status.awaiting": "等待报价",
    "enq.btn.viewOrder": "查看订单",
    "enq.btn.updateQuote": "修改报价",
    "enq.btn.submitQuote": "提交报价",
    "enq.mobile.lead": "生产周期",
    "enq.mobile.cost": "出厂单价",

    // Specs & Customization Details
    "spec.version": "版型",
    "spec.fanVersion": "球迷版 (Fan)",
    "spec.playerVersion": "球员版 (Player)",
    "spec.retro": "复古经典版 (Retro)",
    "spec.size": "尺码",
    "spec.nameSet": "印号印字",
    "spec.noNameSet": "无印号印字 (光板)",
    "spec.player": "印字球员名",
    "spec.number": "印号",
    "spec.patches": "袖标臂章",
    "spec.noPatches": "无臂章",
    "spec.comments": "生产工艺备注",
    "spec.refImages": "客户参考样图",
    "spec.standard": "标准现货商品",

    // Quotation Modal
    "modal.title": "提交生产出厂报价单",
    "modal.availability": "库存及产能情况 *",
    "modal.opt.available": "现货/完全可生产",
    "modal.opt.partial": "部分可做/需确认",
    "modal.opt.unavailable": "无法排产/缺货",
    "modal.unitPrice": "单件供货单价 (含定制工艺) *",
    "modal.leadTime": "生产排期周期 (工作天数) *",
    "modal.totalFor": "订单合计总金额",
    "modal.items": "件",
    "modal.notesLabel": "工厂工艺与制造备注",
    "modal.notesPlaceholder": "例如：热升华印花+硅胶立体队徽，采用官方联赛定制字体，附赠吊牌包装...",
    "modal.cancel": "取消",
    "modal.submit": "确认提交报价至 Captain Vault",
    "modal.submitting": "正在提交...",

    // Detail Page
    "detail.back": "返回询价列表",
    "detail.specsTitle": "商品工艺规格与生产要求",
    "detail.refPhotos": "样衣参考图片与细节特写 (最多5张)",
    "detail.noPhotos": "暂无额外样衣图片",
    "detail.quoteSummary": "报价明细汇总",
    "detail.quoteStatus": "报价状态",
    "detail.unitPrice": "单件单价",
    "detail.leadTime": "交货周期",
    "detail.delivery": "预计到货",
    "detail.craftNotes": "工艺说明",
    "detail.variant": "尺码/款式",
    "detail.assigned": "派单日期",
    "detail.pcs": "件",

    // Profile
    "profile.title": "制造工厂资质与档案",
    "profile.verified": "已认证优质核心工厂",
    "profile.contact": "主要联络人",
    "profile.city": "生产基地",
    "profile.country": "国家 / 地区",
    "profile.currency": "结算货币",
    "profile.paymentTerms": "结算账期",
    "profile.capabilities": "核心工艺能力",
    "profile.compliance": "工厂综合评级",
    "profile.companyName": "企业名称",
    "profile.category": "主营类目",
    "profile.loggedInAs": "当前登录账户",
  },
};

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function SrmI18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SrmLanguage>("en");

  useEffect(() => {
    const stored = localStorage.getItem("captain_srm_lang") as SrmLanguage;
    if (stored === "zh" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: SrmLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("captain_srm_lang", lang);
    } catch {}
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || translations.en[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useSrmI18n() {
  return useContext(I18nContext);
}
