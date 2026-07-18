import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Video, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppLanguage } from '../types.js';

interface OnboardingCarouselProps {
  onComplete: () => void;
  lang: AppLanguage;
}

export default function OnboardingCarousel({ onComplete, lang }: OnboardingCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Video className="w-16 h-16 text-emerald-500" />,
      title_en: "The Gulf's #1 Creator Hub",
      title_ar: "منصة صناع المحتوى الأولى في الخليج",
      desc_en: "Find top verified UGC creators in UAE, KSA, Egypt, and beyond to drive authentic engagement.",
      desc_ar: "اعثر على أفضل صناع محتوى UGC المعتمدين في الإمارات، السعودية، ومصر لتعزيز التفاعل الحقيقي.",
      color: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      icon: <ShieldCheck className="w-16 h-16 text-teal-500" />,
      title_en: "Spotless Pay · Escrow Protection",
      title_ar: "حماية الضمان من Spotless Pay",
      desc_en: "Our sub-branded secure escrow ensures brands only pay when content drafts are fully approved.",
      desc_ar: "يضمن نظام الضمان الآمن الخاص بنا ألا تدفع العلامات التجارية إلا بعد الموافقة الكاملة على مسودات المحتوى.",
      color: "from-teal-500/10 to-teal-600/5",
    },
    {
      icon: <Sparkles className="w-16 h-16 text-purple-500" />,
      title_en: "Real-Time AI Script Assistant",
      title_ar: "مساعد كتابة النصوص بالذكاء الاصطناعي",
      desc_en: "Generate fully-formatted, high-converting video scripts and shot-lists tailored for Gulf demographics.",
      desc_ar: "أنشئ نصوص فيديو ومخططات لقطات عالية التحويل ومنسقة بالكامل ومخصصة للجمهور الخليجي.",
      color: "from-purple-500/10 to-purple-600/5",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isRtl = lang === 'ar';
  const step = steps[currentStep];

  return (
    <div id="onboarding_container" className="flex flex-col items-center justify-center max-w-lg w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-8 relative">
      {/* Skip Button */}
      <button 
        id="btn_onboarding_skip"
        onClick={onComplete}
        className="absolute top-4 right-4 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
      >
        {isRtl ? "تخطي" : "Skip"}
      </button>

      {/* Slide Visual Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
          transition={{ duration: 0.3 }}
          className={`w-full flex flex-col items-center text-center py-6 px-4 rounded-xl bg-gradient-to-br ${step.color} mb-8`}
        >
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-md mb-6">
            {step.icon}
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
            {isRtl ? step.title_ar : step.title_en}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
            {isRtl ? step.desc_ar : step.desc_en}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots & Buttons */}
      <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-900">
        {/* Back Button */}
        <button
          id="btn_onboarding_back"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            currentStep === 0 
              ? 'text-zinc-300 dark:text-zinc-800 cursor-not-allowed' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer'
          }`}
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          {isRtl ? "السابق" : "Back"}
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-6 bg-emerald-600' 
                  : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Next/Get Started Button */}
        <button
          id="btn_onboarding_next"
          onClick={handleNext}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          {currentStep === steps.length - 1 
            ? (isRtl ? "ابدأ الآن" : "Get Started") 
            : (isRtl ? "التالي" : "Next")
          }
          {currentStep !== steps.length - 1 && (isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />)}
        </button>
      </div>
    </div>
  );
}
