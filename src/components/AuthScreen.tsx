import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Eye, EyeOff, CheckSquare, Square, Globe, Shield, User, Landmark, Building2, CheckCircle2 } from 'lucide-react';
import { AppLanguage, UserRole } from '../types.js';

interface AuthScreenProps {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  onAuthComplete: (role: UserRole, email: string) => void;
}

export default function AuthScreen({ lang, setLang, onAuthComplete }: AuthScreenProps) {
  const isRtl = lang === 'ar';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@ugcgulf.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Auth steps: 'form' -> 'role_picker'
  const [authStep, setAuthStep] = useState<'form' | 'role_picker'>('form');

  const handleOAuthSimulate = (provider: 'Apple' | 'Google') => {
    // Simulate immediate successful social auth, then route to role picker!
    setAuthStep('role_picker');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreeTerms) return;
    setAuthStep('role_picker');
  };

  const selectRoleAndComplete = (role: UserRole) => {
    onAuthComplete(role, email);
  };

  // Background images representing authentic Gulf scenes
  // Brands: High-end commerce/product, Creator: Lifestyle & filming in UAE/KSA
  const bgImage = isLogin
    ? "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200" // Creator lifestyle
    : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"; // Brand ecommerce

  return (
    <div id="auth_container" className="min-h-screen w-full flex relative overflow-hidden font-sans select-none" dir={isRtl ? "rtl" : "ltr"}>
      {/* 1. Full-bleed Background Hero */}
      <div 
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative items-center justify-center p-12 transition-all duration-700"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
        
        {/* Ambient Copy */}
        <div className="relative z-10 text-white max-w-md">
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold mb-2 block">
            {isRtl ? "سوق الخليج الأول للمحتوى" : "GULF'S INTEGRATED UGC STANDARD"}
          </span>
          <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
            {isRtl ? "وظف وكالات الخليج، واصنع تأثير علامتك التجارية." : "Hire Gulf Agencies, Influence Your Brand."}
          </h1>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {isRtl 
              ? "انضم إلى أكثر من 12,400+ صانع محتوى و3,200+ علامة تجارية مع حماية الدفع الكاملة عبر Spotless Pay في الإمارات والسعودية ومصر."
              : "Access 12,400+ vetted regional creators, manage campaign revisions in real-time, and guarantee payouts safely via Spotless Pay Escrow."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-emerald-400">
            <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">✓ 100% Escrow Secured</span>
            <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">✓ 12 Gulf Countries</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Form/Picker Area */}
      <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between p-6 sm:p-12 relative z-10">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base">
              G
            </div>
            <span className="text-sm font-black text-zinc-950 dark:text-white tracking-wider">
              UGC GULF
            </span>
          </div>

          {/* Language Selector */}
          <button
            id="btn_auth_lang_toggle"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          <AnimatePresence mode="wait">
            {authStep === 'form' ? (
              <motion.div
                key="auth_form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {isLogin 
                      ? (isRtl ? "تسجيل الدخول إلى حسابك" : "Sign In to UGC GULF")
                      : (isRtl ? "إنشاء حساب جديد" : "Create Your Account")
                    }
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isRtl 
                      ? "بوابة الدفع والتسجيل الآمنة لصناع المحتوى والشركات" 
                      : "Secure payment & campaign engine for regional creators and brands"}
                  </p>
                </div>

                {/* social auth providers - stacked strictly according to Section 8.2 */}
                <div className="space-y-2.5">
                  {/* Apple (always first on iOS/specified order) */}
                  <button
                    type="button"
                    onClick={() => handleOAuthSimulate('Apple')}
                    className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <Apple className="w-4 h-4 fill-white" />
                    <span>
                      {isRtl ? "متابعة باستخدام Apple" : "Continue with Apple"}
                    </span>
                  </button>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleOAuthSimulate('Google')}
                    className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold text-xs py-3 rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.5 15 1 12 1 7.2 1 3.2 3.8 1.4 7.9l3.9 3C6.2 7.7 8.9 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
                      <path fill="#FBBC05" d="M5.3 14.1c-.2-.6-.3-1.3-.3-2.1s.1-1.5.3-2.1L1.4 6.9C.5 8.7 0 10.3 0 12s.5 3.3 1.4 5.1l3.9-3z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.6-6.7-5.8L1.4 15.5C3.2 19.7 7.2 23 12 23z" />
                    </svg>
                    <span>
                      {isRtl ? "متابعة باستخدام Google" : "Continue with Google"}
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {isRtl ? "أو البريد الإلكتروني" : "or email"}
                  </span>
                  <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Credentials form */}
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {isRtl ? "البريد الإلكتروني" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-100 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {isRtl ? "كلمة المرور" : "Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-100 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div 
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className="flex items-start gap-2 cursor-pointer select-none"
                    >
                      <span className="text-emerald-600 mt-0.5">
                        {agreeTerms ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-400" />}
                      </span>
                      <span className="text-[11px] text-zinc-500 leading-normal">
                        {isRtl 
                          ? "أوافق على شروط الخدمة وسياسة الخصوصية الخاصة بـ Spotless Pay وUGC GULF." 
                          : "I agree to UGC GULF's regional Terms of Service and Spotless Pay escrow guidelines."}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-all shadow-md cursor-pointer mt-2"
                  >
                    {isLogin 
                      ? (isRtl ? "متابعة تسجيل الدخول" : "Continue")
                      : (isRtl ? "إنشاء حساب" : "Register Now")
                    }
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 underline font-medium transition-colors cursor-pointer"
                  >
                    {isLogin
                      ? (isRtl ? "لا تملك حساباً؟ سجل هنا" : "Don't have an account? Sign Up")
                      : (isRtl ? "لديك حساب بالفعل؟ سجل دخولك" : "Already have an account? Sign In")
                    }
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="role_picker"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
                    {isRtl ? "خطوة أخيرة مطلوبة" : "ONE-TIME SETUP MANDATORY"}
                  </span>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {isRtl ? "اختر هويتك للمتابعة" : "Select Your Persona"}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isRtl 
                      ? "هذا الاختيار يحدد تجربة لوحة التحكم ومزايا Spotless Pay الخاصة بك." 
                      : "We specialize the workspace depending on whether you are buying content or creating."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Creator Card */}
                  <div
                    onClick={() => selectRoleAndComplete('creator')}
                    className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                        {isRtl ? "صانع محتوى" : "Creator"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                      {isRtl ? "أنا صانع محتوى" : "I'm a Creator"}
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 pl-4 list-disc marker:text-emerald-500" dir={isRtl ? "rtl" : "ltr"}>
                      <li>{isRtl ? "اعرض أعمالك وابنِ محفظتك مجاناً" : "Showcase your work and build portfolios"}</li>
                      <li>{isRtl ? "تقدم لصفقات وموجزات من كبار الماركات" : "Find lucrative brand brief deals"}</li>
                      <li>{isRtl ? "سحب فوري ومضمون مع Spotless Pay" : "Guaranteed secure escrow payout release"}</li>
                    </ul>
                  </div>

                  {/* Brand / Agency Card */}
                  <div
                    onClick={() => selectRoleAndComplete('brand')}
                    className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                        {isRtl ? "علامة تجارية / وكالة" : "Brand / Agency"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                      {isRtl ? "أنا شركة / وكالة تسويق" : "I'm a Brand / Agency"}
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 pl-4 list-disc marker:text-emerald-500" dir={isRtl ? "rtl" : "ltr"}>
                      <li>{isRtl ? "ابحث عن 12,400+ صانع محتوى خليجي معتمد" : "Browse 12,400+ verified Gulf creators"}</li>
                      <li>{isRtl ? "انشر موجزات فورية بمساعدة الذكاء الاصطناعي" : "Post briefs with AI script suggestions"}</li>
                      <li>{isRtl ? "حماية مسوداتك بالكامل بموجب الضمان الآمن" : "100% video-draft review and safety"}</li>
                    </ul>
                  </div>

                  {/* Direct shortcut to Admin (helpful for demo) */}
                  <div
                    onClick={() => selectRoleAndComplete('admin')}
                    className="border border-dashed border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl p-3 text-center cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "⚙️ الدخول السريع كمسؤول للمنصة (للتجربة)" : "⚙️ Quick Access as Platform Admin (Demo)"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="w-full text-center border-t border-zinc-100 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            Spotless Pay Protected · Escrow System
          </span>
          <span>© 2026 UGC GULF. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
