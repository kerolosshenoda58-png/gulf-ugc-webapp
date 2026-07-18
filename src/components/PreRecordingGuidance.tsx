import { useState } from 'react';
import { Camera, CheckSquare, Square, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types.js';

interface PreRecordingGuidanceProps {
  lang: AppLanguage;
  estimatedTime?: string; // e.g. '15-30s'
  maxTime?: string;       // e.g. '60s'
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PreRecordingGuidance({
  lang,
  estimatedTime = "15-30s",
  maxTime = "60s",
  onConfirm,
  onCancel
}: PreRecordingGuidanceProps) {
  const isRtl = lang === 'ar';

  const [checks, setChecks] = useState({
    lens: false,
    dnd: false,
    frame: false,
    lighting: false
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);

  const checklistItems = [
    {
      key: 'lens' as const,
      en: "Wipe your camera lens (clears micro-smudges)",
      ar: "مسح عدسة الكاميرا (لإزالة الشوائب والبصمات)"
    },
    {
      key: 'dnd' as const,
      en: "Enable 'Do Not Disturb' (stops notification noises/pauses)",
      ar: "تفعيل وضع 'عدم الإزعاج' (لمنع أصوات الإشعارات وتوقف التصوير)"
    },
    {
      key: 'frame' as const,
      en: "Keep product brand labels clearly in-frame & in-focus",
      ar: "إبقاء ملصقات العلامة التجارية للمنتج واضحة وداخل الإطار بتركيز كامل"
    },
    {
      key: 'lighting' as const,
      en: "Stand up / sit facing a bright natural window or ring-light",
      ar: "الوقوف أو الجلوس في مواجهة نافذة مشرقة أو إضاءة دائرية"
    }
  ];

  return (
    <div id="pre_recording_guidance" className="bg-zinc-50 dark:bg-zinc-900 border border-emerald-500/30 rounded-xl p-6 shadow-md">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
          <Camera className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            {isRtl ? "دليل ما قبل التسجيل والتصوير" : "Pre-Recording Content Guidance"}
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
              {isRtl ? "تقليل المراجعات" : "Reduces Revisions"}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isRtl 
              ? "مطلوب لتلبية معايير جودة العلامة التجارية وتجنب دورات التعديل الخمسة." 
              : "Required to meet strict brand quality standards and prevent waste of revision rounds."}
          </p>
        </div>
      </div>

      {/* Deliverable Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">
            {isRtl ? "الوقت المقدر" : "Estimated Target"}
          </span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {estimatedTime}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">
            {isRtl ? "الحد الأقصى للمدة" : "Max Duration Limit"}
          </span>
          <span className="text-sm font-semibold text-rose-600">
            {maxTime}
          </span>
        </div>
      </div>

      {/* Interactive Checklist */}
      <div className="space-y-2.5 mb-6">
        {checklistItems.map((item) => (
          <div
            key={item.key}
            onClick={() => toggleCheck(item.key)}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              checks[item.key]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <button className="mt-0.5 text-emerald-600 dark:text-emerald-400 focus:outline-none">
              {checks[item.key] ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            <span className={`text-xs ${checks[item.key] ? 'text-zinc-800 dark:text-zinc-200 line-through font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}>
              {isRtl ? item.ar : item.en}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 rounded-lg cursor-pointer"
        >
          {isRtl ? "إلغاء" : "Cancel"}
        </button>

        <div className="flex items-center gap-2">
          {!allChecked && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {isRtl ? "أكمل الفحص أولاً" : "Check all items"}
            </span>
          )}
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all ${
              allChecked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isRtl ? "البدء والرفع" : "Start & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
