"use client";

import { useSrmI18n, SrmLanguage } from "@/lib/srm-i18n";
import { Globe } from "lucide-react";

export function SrmLanguageSwitcher() {
  const { language, setLanguage } = useSrmI18n();

  return (
    <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition border border-white/10">
      <Globe className="w-4 h-4 text-white/80" />
      <div className="flex items-center text-xs font-semibold">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-1.5 py-0.5 rounded transition ${
            language === "en"
              ? "bg-white text-[#1a365d] shadow-xs font-bold"
              : "text-white/70 hover:text-white"
          }`}
          title="Switch to English"
        >
          EN
        </button>
        <span className="text-white/30 text-[10px] mx-0.5">/</span>
        <button
          type="button"
          onClick={() => setLanguage("zh")}
          className={`px-1.5 py-0.5 rounded transition ${
            language === "zh"
              ? "bg-white text-[#1a365d] shadow-xs font-bold"
              : "text-white/70 hover:text-white"
          }`}
          title="切换至简体中文"
        >
          中文
        </button>
      </div>
    </div>
  );
}
