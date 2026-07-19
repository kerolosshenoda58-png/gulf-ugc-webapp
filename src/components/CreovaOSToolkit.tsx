import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  RefreshCw, 
  Calendar, 
  Trash2, 
  Check, 
  ExternalLink, 
  Layers, 
  LogOut, 
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
  ListTodo,
  Sparkles,
  Zap,
  Globe,
  Upload,
  User,
  Instagram,
  Video,
  Award,
  Wallet,
  MessageSquare,
  Volume2,
  Lock,
  ArrowRight,
  ChevronRight,
  Coins,
  Send,
  Download,
  Share2,
  Flame,
  Star,
  Users,
  LineChart,
  Grid,
  Bot,
  Laptop,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { AppState, UserRole } from '../types.js';

interface CreovaOSToolkitProps {
  state: AppState;
  currentRole: UserRole;
  userEmail: string;
  isRtl: boolean;
  accentColor?: string;
  refreshState?: () => void;
}

// Simulated preset social accounts
const MOCK_TIKTOK_VIDS = [
  { id: 'v1', views: '1.2M', likes: '142K', title: 'Viral Glow Toner GRWM Routine ✨', thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=250' },
  { id: 'v2', views: '430K', likes: '54K', title: 'Why your moisturizer is failing you 🧐', thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=250' },
  { id: 'v3', views: '890K', likes: '110K', title: 'Rating UAE drugstore skincare (Real Talk)', thumbnail: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=250' }
];

export default function CreovaOSToolkit({
  state,
  currentRole,
  userEmail,
  isRtl,
  accentColor = 'emerald',
  refreshState
}: CreovaOSToolkitProps) {
  // Navigation tabs for the UGC OS Toolkit
  const [activeToolkitTab, setActiveToolkitTab] = useState<'ai_studio' | 'onboarding' | 'social_sync' | 'chat_studio' | 'pay_wallet' | 'gamification' | 'integrations'>('ai_studio');

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<'script' | 'brief' | 'pricing' | 'prediction'>('script');
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Onboarding Wizard State
  const [onboardStep, setOnboardStep] = useState(1);
  const [bioText, setBioText] = useState('');
  const [nicheInput, setNicheInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isTwoFactorOn, setIsTwoFactorOn] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [isIdLoading, setIsIdLoading] = useState(false);

  // Social Sync state
  const [socialHandle, setSocialHandle] = useState('@sofiareyes');
  const [socialPlatform, setSocialPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [isSyncingSocial, setIsSyncingSocial] = useState(false);
  const [syncedData, setSyncedData] = useState<{ followers: string; avgViews: string; authScore: number; vids: typeof MOCK_TIKTOK_VIDS } | null>(null);

  // PDF Media Kit Builder State
  const [mediaKitTheme, setMediaKitTheme] = useState<'neon_violet' | 'sun_orange' | 'minimal_slate'>('neon_violet');
  const [baseRate, setBaseRate] = useState('350');
  const [previousBrands, setPreviousBrands] = useState('NovaSkin, K-Beauty, Oasis Spa');
  const [primaryLang, setPrimaryLang] = useState('Arabic & English');

  // Chat Studio simulator
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'creator' | 'brand'; text: string; translatedText?: string; isVoice?: boolean; duration?: string; time: string; read: boolean }>>([
    { id: 'm1', sender: 'brand', text: 'Hey Sofia! We saw your skincare reels. We want to Sync for a high-converting 30s TikTok for our sunscreen launch.', time: '11:32 AM', read: true },
    { id: 'm2', sender: 'creator', text: 'Marhaban! I would love to. I can shoot this in high-key aesthetic lighting with Arabic subtitles.', time: '11:35 AM', read: true },
    { id: 'm3', sender: 'brand', text: 'Perfect. We have loaded the $450 payment into Spotless Pay Escrow. Let us check the script and hook first.', time: '11:40 AM', read: true }
  ]);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Wallet and Escrow States
  const [escrowLedger, setEscrowLedger] = useState([
    { id: 'esc_101', project: 'NovaSkin Sunscreen Launch', amount: 450, status: 'locked', date: '2026-07-16' },
    { id: 'esc_102', project: 'Oasis Hydration Serum Campaign', amount: 650, status: 'released', date: '2026-07-10' }
  ]);
  const [invoiceBrandName, setInvoiceBrandName] = useState('NovaSkin Co');
  const [invoiceAmount, setInvoiceAmount] = useState('450');
  const [invoiceItemName, setInvoiceItemName] = useState('UGC Video Deliverable V1');
  const [generatedInvoice, setGeneratedInvoice] = useState<{ id: string; date: string; total: number; from: string; to: string; item: string } | null>(null);

  // Integrations state toggles
  const [integrations, setIntegrations] = useState({
    shopify: false,
    meta_ads: true,
    tiktok_pixel: false,
    whatsapp_bot: true
  });

  // UI notifications
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Call real server-side AI model to write briefs, scripts, or price estimation!
  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiOutput('');
    try {
      const response = await fetch('/api/ai/generate-creova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: aiType,
          lang: isRtl ? 'ar' : 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiOutput(data.output);
        showToast(isRtl ? 'تم التوليد بنجاح الذكاء الاصطناعي!' : 'AI Generation successful!', 'success');
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Fallback generator in case of network issue
      setTimeout(() => {
        let fallback = '';
        if (aiType === 'script') {
          fallback = `🎬 **[Creova AI Script Generator Output]**\n\n**Hook (0-3s):** "If you are still rubbin' skincare products that clog your pores, stop right now!" *[Visual: Close-up of Sofia applying premium glass-skin cream]*\n\n**Body (3-15s):** "Most people in Riyadh and Dubai think high-heat means oily skin. But watch this. I've been using NovaSkin for 14 days and the hydration is flawless without the greasy look."\n\n**CTA (15-30s):** "Click below to secure yours with my code SOFIA15. Grab yours before it sells out in Dubai Mall!"`;
        } else if (aiType === 'brief') {
          fallback = `📋 **[Creova AI Campaign Brief Writer]**\n\n**Campaign Title:** Glow & Hydrate MENA Summer Launch\n**Target Creator Profile:** Female skincare experts (18-32) in KSA & UAE\n**Required Deliverables:** 1x TikTok/Instagram Reel focusing on texture close-ups and morning application routines.\n**Core Aesthetics:** High-key warm daylight, clean bathroom backdrop, minimal elegant font overlays.\n**Compensation:** $450 guaranteed escrow hold per video + free physical product kit.`;
        } else if (aiType === 'pricing') {
          fallback = `💰 **[Creova AI Smart Pricing Intelligence]**\n\nBased on regional market trends for UAE & KSA UGC content in the Skincare niche with **4.98 Rating** and **245K Followers**:\n\n- **Recommended Single Deliverable Rate:** $420 - $550 USD\n- **With Raw Footage licensing (30 Days):** Add 25% ($525 - $685 USD)\n- **Regional Engagement Premium:** +15% due to high Riyadh/Dubai audience density.`;
        } else {
          fallback = `🎯 **[Creova Success & ROI Predictor]**\n\n**Overall Success Score: 94% Match**\n- Audience Authenticity: 98.2%\n- Estimated Views: 25,000 - 45,000 per video\n- Predicted Cost-Per-View (CPV): $0.015 USD\n- Expected Click-Through Rate (CTR): 3.8% (Above the industry standard of 2.1%)`;
        }
        setAiOutput(fallback);
        showToast(isRtl ? 'توليد ذكي (الوضع الاحتياطي)' : 'AI Generation active (Template mode)', 'info');
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Profile completion
  const handleAiProfileOptimize = async () => {
    if (!bioText.trim()) {
      showToast(isRtl ? 'الرجاء كتابة نبذة أولاً' : 'Please type a short bio first', 'info');
      return;
    }
    setIsIdLoading(true);
    try {
      const response = await fetch('/api/ai/generate-creova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Optimize this short UGC creator profile bio to sound incredibly professional, persuasive, and attractive to top brands. Add relevant niches and call-to-actions. Keep it under 3 sentences. Original: "${bioText}"`,
          type: 'script',
          lang: isRtl ? 'ar' : 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBioText(data.output.replace(/🎬/g, '').trim());
        showToast(isRtl ? 'تم تحسين النبذة بالذكاء الاصطناعي!' : 'Bio optimized by Creova AI!', 'success');
      }
    } catch (e) {
      setBioText(isRtl 
        ? "صانعة محتوى UGC رائدة في الخليج متخصصة في مستحضرات التجميل والروتين اليومي للبشرة. أقدم مقاطع فيديو جمالية عالية التحويل تضمن التفاعل!"
        : "Leading GCC beauty & skincare UGC specialist. Delivering high-aesthetic, high-converting vertical video assets tailored for premium Saudi & UAE consumer audiences."
      );
    } finally {
      setIsIdLoading(false);
    }
  };

  // Identity Verification Scan Simulation
  const handleIdentityScan = () => {
    setIsIdLoading(true);
    setTimeout(() => {
      setIdentityVerified(true);
      setIsIdLoading(false);
      showToast(isRtl ? 'تم التحقق من هويتك بنجاح برقم جواز السفر!' : 'National ID verified! Badge awarded.', 'success');
    }, 2000);
  };

  // OTP Verification
  const handleSendOtp = () => {
    setOtpSent(true);
    showToast(isRtl ? 'تم إرسال كود التحقق (1234) لجوالك' : 'Verification code (1234) sent to your mobile', 'success');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234') {
      setIsOtpVerified(true);
      showToast(isRtl ? 'تم تفعيل رقم الجوال وتوثيقه!' : 'Mobile OTP verified successfully!', 'success');
    } else {
      showToast(isRtl ? 'رمز خاطئ. حاول استخدام 1234' : 'Incorrect code. Try using 1234', 'info');
    }
  };

  // Social Importer sync simulation
  const handleSocialSync = () => {
    setIsSyncingSocial(true);
    setSyncedData(null);
    setTimeout(() => {
      setSyncedData({
        followers: '245,000',
        avgViews: '42K - 85K',
        authScore: 98.4,
        vids: MOCK_TIKTOK_VIDS
      });
      setIsSyncingSocial(false);
      showToast(isRtl ? 'تم سحب بيانات ومقاطع TikTok بنجاح!' : 'Social TikTok feed synced successfully!', 'success');
    }, 1800);
  };

  // Invoice Generator
  const handleGenerateInvoice = () => {
    const customId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedInvoice({
      id: customId,
      date: new Date().toLocaleDateString(),
      total: Number(invoiceAmount),
      from: 'Sofia Reyes UGC LTD',
      to: invoiceBrandName,
      item: invoiceItemName
    });
    showToast(isRtl ? 'تم إنشاء الفاتورة الرسمية بنجاح!' : 'Official escrow invoice generated!', 'success');
  };

  // Message translator simulator
  const translateMessage = (id: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === id) {
        if (m.translatedText) {
          // toggle back
          return { ...m, translatedText: undefined };
        } else {
          // set Arabic or English counterpart
          let translation = '';
          if (m.text.includes('skincare reels')) {
            translation = 'مرحباً صوفيا! لقد شاهدنا فيديوهات العناية بالبشرة الخاصة بك. نريد التعاون لعمل فيديو تيك توك مدته 30 ثانية لإطلاق واقي الشمس الخاص بنا.';
          } else if (m.text.includes('Marhaban!')) {
            translation = 'Marhaban! I would love to. I can shoot this in high-key aesthetic lighting with Arabic subtitles.';
          } else if (m.text.includes('Escrow')) {
            translation = 'رائع. لقد قمنا بإيداع مبلغ 450 دولار في حساب الضمان الآمن Spotless Pay. دعنا نراجع السيناريو أولاً.';
          } else {
            translation = isRtl ? 'This is an instant AI translation of your collaboration script.' : 'هذه ترجمة فورية بالذكاء الاصطناعي لرسالتك الخاصة بالتعاون.';
          }
          return { ...m, translatedText: translation };
        }
      }
      return m;
    }));
  };

  // Send message simulation
  const handleSendChat = () => {
    if (!replyText.trim()) return;
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: currentRole === 'brand' ? 'brand' as const : 'creator' as const,
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setChatMessages(prev => [...prev, newMsg]);
    setReplyText('');
    
    // Simulate auto AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: `m_auto_${Date.now()}`,
        sender: currentRole === 'brand' ? 'creator' as const : 'brand' as const,
        text: isRtl 
          ? "رائع! دعنا نتابع خطوات الضمان والمراجعة في مساحة التعاون المخصصة."
          : "Fantastic! Let's lock this milestone and proceed inside our secure collaboration space.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      }]);
    }, 2500);
  };

  return (
    <div id="creova_ugc_os_root" className="bg-gradient-to-br from-slate-900 via-zinc-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 space-y-8 select-none">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Next-Gen Operating System</span>
            </div>
            <div className="bg-emerald-500 text-zinc-950 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Creova OS v2.1
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-zinc-100">
            <span>{isRtl ? 'نظام تشغيل صانعي محتوى الخليج' : 'MENA UGC Collaboration OS'}</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            {isRtl
              ? 'بنية تحتية متكاملة لربط ومزامنة علامات التجارة مع صناع المحتوى: حماية دفع الضمان، أتمتة العقود، ترجمة فورية، تحليلات اجتماعية.'
              : 'Complete campaign infrastructure: secure Spotless Pay escrow, automatic multi-platform profile importers, AI-assisted scripts, and instant dual-language chat rooms.'
            }
          </p>
        </div>

        {/* Quick Trust Score badge */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col items-center justify-center text-orange-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
              {isRtl ? 'نقاط الموثوقية العامة' : 'Creova Trust Score'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-orange-400">98.6</span>
              <span className="text-xs text-emerald-400">✓ AAA Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolkit Navigation Rails */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto border-b border-zinc-900">
        <button
          onClick={() => setActiveToolkitTab('ai_studio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'ai_studio' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{isRtl ? 'استوديو الذكاء الاصطناعي' : 'AI Studio & Scripts'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('onboarding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'onboarding' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isRtl ? 'معالج التوثيق والتحقق' : 'Onboarding & ID Wizard'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('social_sync')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'social_sync' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Instagram className="w-4 h-4" />
          <span>{isRtl ? 'المزامنة الاجتماعية والـ Media Kit' : 'Social Sync & Media Kit'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('chat_studio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'chat_studio' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isRtl ? 'مساحة التعاون والدردشة المترجمة' : 'Studio Collaboration Space'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('pay_wallet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'pay_wallet' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{isRtl ? 'محفظة الضمان والفواتير' : 'Spotless Wallet & Invoices'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('gamification')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'gamification' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isRtl ? 'لوحة الشرف والمكافآت' : 'Leaderboard & Streaks'}</span>
        </button>

        <button
          onClick={() => setActiveToolkitTab('integrations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeToolkitTab === 'integrations' 
              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10' 
              : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>{isRtl ? 'ربط التطبيقات والـ API' : 'Integrations'}</span>
        </button>
      </div>

      {/* Main Display Area */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 min-h-[400px]">
        
        {/* TAB 1: AI STUDIO */}
        {activeToolkitTab === 'ai_studio' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-orange-400">
              <Bot className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                {isRtl ? 'مساعد الذكاء الاصطناعي التوليدي لـ Creova' : 'Creova Generative AI Studio'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4 text-left">
                <p className="text-xs text-zinc-400">
                  {isRtl 
                    ? 'أدخل اسم منتجك أو فكرة حملتك وسيقوم نموذج Gemini بصياغة سيناريوهات تحويلية أو موجز حملات كامل مخصص للسوق الخليجي.'
                    : 'Input your product concept or campaign keywords to auto-generate high-impact script hooks, comprehensive campaign briefs, or smart pricing metrics using server-side Gemini.'
                  }
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                      {isRtl ? 'نوع المخرج الذكي' : 'AI Output Mode'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAiType('script')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border cursor-pointer transition-all ${
                          aiType === 'script' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        🎬 {isRtl ? 'سيناريو فيديو' : 'Video Script'}
                      </button>
                      <button
                        onClick={() => setAiType('brief')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border cursor-pointer transition-all ${
                          aiType === 'brief' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        📋 {isRtl ? 'موجز حملة' : 'Campaign Brief'}
                      </button>
                      <button
                        onClick={() => setAiType('pricing')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border cursor-pointer transition-all ${
                          aiType === 'pricing' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        💰 {isRtl ? 'توصيات الأسعار' : 'Smart Pricing'}
                      </button>
                      <button
                        onClick={() => setAiType('prediction')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border cursor-pointer transition-all ${
                          aiType === 'prediction' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        🎯 {isRtl ? 'توقع النجاح والـ ROI' : 'ROI Success Predict'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                      {isRtl ? 'موضوع الإعلان أو اسم المنتج' : 'Campaign Subject / Product Detail'}
                    </label>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={isRtl 
                        ? 'مثال: واقي شمس عضوي مقاوم للحرارة لإطلاقه في الرياض للنساء'
                        : 'E.g., Organic hydrating sunscreen for Riyadh active women, SPF 50, heat-resistant.'
                      }
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    onClick={handleAiGeneration}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="w-full h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isRtl ? 'جاري التحليل وصياغة الرد...' : 'Gemini is thinking...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isRtl ? 'توليد ذكي فوراً' : 'Generate with Gemini'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Preview Window */}
              <div className="md:col-span-7 bg-zinc-950 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between text-left min-h-[300px]">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">
                      📝 {isRtl ? 'المخرج الإبداعي للذكاء الاصطناعي' : 'Creova AI Studio Console Output'}
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      Ready
                    </span>
                  </div>
                  {aiOutput ? (
                    <pre className="text-xs font-sans text-zinc-200 whitespace-pre-wrap leading-relaxed select-text overflow-y-auto max-h-[320px] pr-2">
                      {aiOutput}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-16 space-y-2">
                      <Sparkles className="w-8 h-8 text-zinc-800 animate-pulse" />
                      <p className="text-xs text-zinc-500">
                        {isRtl ? 'النتائج ستظهر هنا عند الضغط على زر التوليد' : 'Your smart outputs will render here.'}
                      </p>
                    </div>
                  )}
                </div>

                {aiOutput && (
                  <div className="pt-4 border-t border-zinc-900/60 flex items-center gap-2 mt-4 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiOutput);
                        showToast(isRtl ? 'تم نسخ المخرج إلى الحافظة' : 'Copied to clipboard!', 'success');
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-[10px] text-zinc-300 font-semibold cursor-pointer"
                    >
                      Copy Output
                    </button>
                    <span className="text-[10px] text-zinc-500 italic">
                      {isRtl ? 'توليد فوري وآمن بنسبة 100٪.' : '100% compliant server-side execution.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ONBOARDING & ID WIZARD */}
        {activeToolkitTab === 'onboarding' && (
          <div className="space-y-6 max-w-xl mx-auto text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-orange-400">
                <UserCheck className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">
                  {isRtl ? 'معالج التسجيل وصلاحية الحساب' : 'Creator & Brand Identity Verification'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold">
                Step {onboardStep} of 3
              </span>
            </div>

            {/* Stepper bar */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full ${onboardStep >= 1 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
              <div className={`h-1.5 rounded-full ${onboardStep >= 2 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
              <div className={`h-1.5 rounded-full ${onboardStep >= 3 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
            </div>

            {/* Step 1: Profile bio completion */}
            {onboardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">
                    {isRtl ? 'الخطوة الأولى: السيرة الذاتية الذكية وحساب الذكاء الاصطناعي' : 'Step 1: Bio Completion & AI Optimization'}
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isRtl 
                      ? 'اكتب نبذة بسيطة عن مهاراتك وسنقوم بصياغتها بشكل احترافي لجذب أرقى الماركات الإقليمية.'
                      : 'Draft a simple description of your content style and niches. We will refine it into professional, brand-safe copy instantly.'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder={isRtl 
                      ? 'مثال: أنا صوفيا أصور فيديوهات روتين العناية بالبشرة ومستحضرات التجميل في دبي بإنارة ناعمة'
                      : 'E.g., I film skincare routines and beauty aesthetic videos in Dubai with high-key lighting...'
                    }
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAiProfileOptimize}
                      disabled={isIdLoading || !bioText.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isIdLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                      <span>{isRtl ? 'تحسين السيرة بالذكاء الاصطناعي' : 'AI Bio Optimizer'}</span>
                    </button>
                    <button
                      onClick={() => setOnboardStep(2)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isRtl ? 'التالي' : 'Next Step'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: National ID verification */}
            {onboardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">
                    {isRtl ? 'الخطوة الثانية: التحقق من الهوية الوطنية (أبشر / الهوية الرقمية)' : 'Step 2: Instant Government ID Verification'}
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isRtl 
                      ? 'لضمان حماية الماركات وصناع المحتوى، نتحقق من الهويات لتقديم شارة "موثوق" الذهبية.'
                      : 'Upload or scan your GCC Resident Card / National passport to unlock premium fast payouts and our trusted Verified Badge.'
                    }
                  </p>
                </div>

                <div className="border border-dashed border-zinc-800 p-6 rounded-2xl bg-zinc-950 text-center flex flex-col items-center justify-center space-y-3">
                  {identityVerified ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h6 className="text-xs font-bold text-emerald-400">
                        {isRtl ? 'تم التحقق من الهوية الوطنية بنجاح!' : 'Identity Verified Successfully!'}
                      </h6>
                      <p className="text-[10px] text-zinc-500">
                        Passport/National ID scanned & secure. Verified badge linked.
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-600 animate-bounce" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold block text-zinc-300">
                          {isRtl ? 'اسحب وأسقط وثيقة الهوية هنا' : 'Drag & drop ID card or Passport'}
                        </span>
                        <span className="text-[9px] text-zinc-500">
                          Supports PNG, JPG, PDF up to 10MB
                        </span>
                      </div>
                      <button
                        onClick={handleIdentityScan}
                        disabled={isIdLoading}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                      >
                        {isIdLoading ? 'Scanning...' : (isRtl ? 'محاكاة التحقق الفوري عبر الكاميرا' : 'Simulate Government ID Scan')}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOnboardStep(1)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    {isRtl ? 'السابق' : 'Back'}
                  </button>
                  <button
                    onClick={() => setOnboardStep(3)}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    {isRtl ? 'التالي' : 'Next Step'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Phone OTP and 2FA */}
            {onboardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">
                    {isRtl ? 'الخطوة الثالثة: توثيق رقم الجوال وحماية الحساب 2FA' : 'Step 3: Two-Factor Authentication & Mobile OTP'}
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isRtl 
                      ? 'احمِ رصيد ضمان Spotless Pay الخاص بك عبر تفعيل التحقق ثنائي العامل لجوالك.'
                      : 'Verify your phone number with a secure SMS OTP to guarantee protected withdrawals and keep your escrow wallet bulletproof.'
                    }
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-zinc-300 block">
                        {isRtl ? 'توثيق رقم الجوال بـ SMS' : 'Secure SMS OTP'}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        +971 50 123 4567
                      </span>
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOtp}
                        className="px-3 py-1.5 bg-orange-500 text-zinc-950 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        {isRtl ? 'إرسال كود التحقق' : 'Send SMS OTP'}
                      </button>
                    ) : isOtpVerified ? (
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Connected</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-16 h-8 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          className="px-2.5 h-8 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black rounded-lg text-[10px] cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-300 block">
                        {isRtl ? 'التحقق الثنائي عبر مصادق جوجل' : 'Google Authenticator 2FA'}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        Required for withdrawals above $1,000 USD
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsTwoFactorOn(!isTwoFactorOn);
                        showToast(isTwoFactorOn ? '2FA disabled' : 'Creova 2FA secured successfully!', 'success');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        isTwoFactorOn ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isTwoFactorOn ? 'On (Enabled)' : 'Off (Toggle)'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setOnboardStep(2)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    {isRtl ? 'السابق' : 'Back'}
                  </button>
                  <button
                    onClick={() => {
                      showToast(isRtl ? 'تهانينا! اكتمل توثيق ملفك وبدء العمل.' : 'Onboarding setup fully verified!', 'success');
                      setOnboardStep(1);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold rounded-lg text-[11px] cursor-pointer"
                  >
                    {isRtl ? 'إنهاء وحفظ البيانات' : 'Finish Setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOCIAL SYNC & MEDIA KIT */}
        {activeToolkitTab === 'social_sync' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Auto-Sync Social Media accounts */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2.5 text-orange-400">
                  <Instagram className="w-5 h-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    {isRtl ? 'سحب تلقائي وتحليلات الحسابات' : 'Social Importer & Analytics'}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  {isRtl 
                    ? 'اربط حساب TikTok أو Instagram الخاص بك بضغطة زر واحدة. سنقوم بسحب وإدراج أحدث الفيديوهات مع إحصائيات التفاعل ونسبة الموثوقية التلقائية.'
                    : 'Connect your TikTok, Instagram, or YouTube Shorts handle. Creova automatically syncs your latest high-performing media assets, engagement statistics, and verified views.'
                  }
                </p>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Select Channel</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSocialPlatform('tiktok')}
                        className={`h-8 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${socialPlatform === 'tiktok' ? 'bg-zinc-800 text-white border border-orange-500' : 'bg-zinc-900 text-zinc-400'}`}
                      >
                        TikTok
                      </button>
                      <button
                        onClick={() => setSocialPlatform('instagram')}
                        className={`h-8 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${socialPlatform === 'instagram' ? 'bg-zinc-800 text-white border border-orange-500' : 'bg-zinc-900 text-zinc-400'}`}
                      >
                        Instagram
                      </button>
                      <button
                        onClick={() => setSocialPlatform('youtube')}
                        className={`h-8 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${socialPlatform === 'youtube' ? 'bg-zinc-800 text-white border border-orange-500' : 'bg-zinc-900 text-zinc-400'}`}
                      >
                        YT Shorts
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={socialHandle}
                      onChange={(e) => setSocialHandle(e.target.value)}
                      className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white flex-1 focus:outline-none"
                    />
                    <button
                      onClick={handleSocialSync}
                      disabled={isSyncingSocial}
                      className="h-9 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-zinc-950 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      {isSyncingSocial ? <RefreshCw className="w-3 animate-spin" /> : <RefreshCw className="w-3" />}
                      <span>{isRtl ? 'مزامنة' : 'Auto Sync'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Synced Feed Results */}
                {syncedData && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Followers</span>
                        <span className="text-xs font-extrabold text-orange-400">{syncedData.followers}</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Avg Views</span>
                        <span className="text-xs font-extrabold text-orange-400">{syncedData.avgViews}</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Audience Auth</span>
                        <span className="text-xs font-extrabold text-emerald-400">{syncedData.authScore}%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Synced Video Feed</span>
                      <div className="grid grid-cols-3 gap-2">
                        {syncedData.vids.map(v => (
                          <div key={v.id} className="relative rounded-lg overflow-hidden group border border-zinc-800 bg-zinc-950 aspect-[3/4]">
                            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-white font-extrabold bg-zinc-950/80 px-1 rounded">
                              {v.views}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: PDF Media Kit Generator */}
              <div className="lg:col-span-6 space-y-4 text-left border-t lg:border-t-0 lg:border-l border-zinc-800 lg:pl-8 pt-6 lg:pt-0">
                <div className="flex items-center gap-2.5 text-orange-400">
                  <FileText className="w-5 h-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    {isRtl ? 'مصمم ومولد ملف الميديا كيت PDF' : 'UGC Media Kit Creator'}
                  </h4>
                </div>
                
                <p className="text-xs text-zinc-400">
                  {isRtl 
                    ? 'اختر القالب وقم بتحديد أسعار خدماتك وصادراتك التجارية. بضغطة زر، سنولد لك صفحة ميديا كيت تفاعلية وجاهزة للتصدير كملف PDF للعلامات.'
                    : 'Style your custom media kit. Enter your base video rates and brand history to output a gorgeous live preview sheet ready to download or share.'
                  }
                </p>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-zinc-500 block font-bold mb-1">Theme Layout</label>
                      <select
                        value={mediaKitTheme}
                        onChange={(e: any) => setMediaKitTheme(e.target.value)}
                        className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-white focus:outline-none"
                      >
                        <option value="neon_violet">Neon Violet</option>
                        <option value="sun_orange">Sun Orange</option>
                        <option value="minimal_slate">Minimal Slate</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 block font-bold mb-1">Base UGC Video Rate</label>
                      <input
                        type="text"
                        value={baseRate}
                        onChange={(e) => setBaseRate(e.target.value)}
                        className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-500 block font-bold mb-1">Previous Brand Logos / Names</label>
                    <input
                      type="text"
                      value={previousBrands}
                      onChange={(e) => setPreviousBrands(e.target.value)}
                      className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => showToast(isRtl ? 'تم تصدير ملف PDF بنجاح!' : 'Media Kit exported to PDF!', 'success')}
                    className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isRtl ? 'تحميل ملف PDF التفاعلي' : 'Export & Download PDF Media Kit'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: STUDIO COLLABORATION & CHAT TRANSLATOR */}
        {activeToolkitTab === 'chat_studio' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-orange-400 text-left">
                <MessageSquare className="w-5 h-5" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider block">
                    {isRtl ? 'استوديو العمل المشترك والمحادثات الذكية' : 'Private Studio Collaboration Suite'}
                  </h4>
                  <span className="text-[9px] text-zinc-500">
                    Encrypted secure brand-creator connection
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-start">
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  Arabic & English Translation Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Chat Feed */}
              <div className="md:col-span-8 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col h-[350px] overflow-hidden">
                <div className="bg-zinc-900/60 p-3.5 border-b border-zinc-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-left">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Sofia" className="w-7 h-7 rounded-full border border-zinc-750" />
                    <div>
                      <span className="text-xs font-bold block text-white leading-tight">Sofia Reyes</span>
                      <span className="text-[9px] text-emerald-400 block">Active inside private collab</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-500">Milestone Escrow: $450 Held</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map(msg => {
                    const isMyMsg = msg.sender === (currentRole === 'brand' ? 'brand' : 'creator');
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMyMsg ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}>
                        <div className={`p-3 rounded-2xl text-xs space-y-1.5 ${
                          isMyMsg ? 'bg-orange-500 text-zinc-950 rounded-tr-none' : 'bg-zinc-900 text-zinc-200 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed select-text">{msg.text}</p>
                          {msg.translatedText && (
                            <p className="border-t border-zinc-800/40 pt-1.5 mt-1.5 text-[11px] font-semibold text-emerald-400 italic">
                              Translation: {msg.translatedText}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1.5">
                          <span className="text-[8px] text-zinc-600 font-mono">{msg.time}</span>
                          {!isMyMsg && (
                            <button
                              onClick={() => translateMessage(msg.id)}
                              className="text-[9px] font-semibold text-emerald-400 hover:underline cursor-pointer"
                            >
                              {msg.translatedText ? 'Show Original' : '🌐 Translate'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex items-center gap-2.5 text-zinc-500 text-xs italic text-left">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200" />
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-300" />
                      </div>
                      <span>Sofia is typing in Arabic...</span>
                    </div>
                  )}
                </div>

                {/* Chat input footer */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-850 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder={isRtl ? 'اكتب رسالتك لـ صوفيا...' : 'Send message inside the private workspace...'}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl h-9 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleSendChat}
                    className="h-9 w-9 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center text-zinc-950 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sidebar: Collaborative Shared deliverables & voice notes */}
              <div className="md:col-span-4 space-y-4 text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                  Studio Shared Workspace Assets
                </span>
                
                <div className="space-y-2">
                  {/* Voice Note attachment simulator */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center gap-3">
                    <button
                      onClick={() => showToast('Playing voice note from Sofia...', 'info')}
                      className="w-8 h-8 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 hover:bg-orange-500/20"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10.5px] font-bold text-zinc-300 block">Sofia_Pronunciation_AR.ogg</span>
                      <span className="text-[9px] text-zinc-500 block">Voice note • 14 seconds</span>
                    </div>
                  </div>

                  {/* Escrow locked files */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 block font-bold uppercase">Contract & Milestones</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">Deliverable V1 Video</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Escrow Locked</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      The video file remains protected until the brand releases the escrow payout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAY WALLET & INVOICES */}
        {activeToolkitTab === 'pay_wallet' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5 text-orange-400">
                <Wallet className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">
                  {isRtl ? 'محفظة الضمان الآمن Spotless Pay' : 'Spotless Pay Escrow Wallet'}
                </h4>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                Bank Sync Live
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Balances card */}
              <div className="lg:col-span-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Wallet Available Balance</span>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-white block">$1,250.00</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                    <span>✓ Ready for instant payout (UAE Dirham / Saudi Riyal)</span>
                  </span>
                </div>

                <div className="border-t border-zinc-900 pt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Currently In Escrow:</span>
                    <span className="font-bold text-orange-400">$450.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Earned This Month:</span>
                    <span className="font-bold text-white">$2,100.00</span>
                  </div>
                </div>
              </div>

              {/* Invoice Builder */}
              <div className="lg:col-span-8 space-y-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Escrow Invoice Generator</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-zinc-500 block font-bold mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={invoiceBrandName}
                      onChange={(e) => setInvoiceBrandName(e.target.value)}
                      className="w-full h-8 px-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 block font-bold mb-1">Item Description</label>
                    <input
                      type="text"
                      value={invoiceItemName}
                      onChange={(e) => setInvoiceItemName(e.target.value)}
                      className="w-full h-8 px-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 block font-bold mb-1">Amount ($ USD)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        className="w-full h-8 px-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                      <button
                        onClick={handleGenerateInvoice}
                        className="h-8 px-3 bg-orange-500 text-zinc-950 text-[10px] font-black rounded-lg cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generated Invoice Sheet */}
                {generatedInvoice && (
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3 font-mono text-[10px] text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="font-extrabold text-white">TAX INVOICE ({generatedInvoice.id})</span>
                      <span>Date: {generatedInvoice.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-zinc-600 block">From:</span>
                        <span className="text-zinc-300 font-bold">{generatedInvoice.from}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block">To:</span>
                        <span className="text-zinc-300 font-bold">{generatedInvoice.to}</span>
                      </div>
                    </div>
                    <div className="border-t border-zinc-900 pt-2 flex justify-between text-xs font-sans text-zinc-300">
                      <span>{generatedInvoice.item}</span>
                      <span className="font-extrabold text-orange-400">${generatedInvoice.total}.00 USD</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: GAMIFICATION & STREAKS */}
        {activeToolkitTab === 'gamification' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2.5 text-orange-400">
              <Award className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                {isRtl ? 'لوحة الشرف والمكافآت اليومية' : 'Creator Leaderboard & Milestone Challenges'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Leaderboard */}
              <div className="md:col-span-7 bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">This Week\'s Top GCC Creators</span>
                
                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-900/60 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-400 w-4">🥇</span>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Sofia" className="w-6 h-6 rounded-full" />
                      <span className="font-semibold text-white">Sofia Reyes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400">98.6 score</span>
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.25 rounded uppercase">UGC Queen</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-900/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-500 w-4">🥈</span>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Fahad" className="w-6 h-6 rounded-full" />
                      <span className="font-semibold text-zinc-300">Fahad Al-Otaibi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400">96.4 score</span>
                      <span className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.25 rounded uppercase">Saudi Style</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-900/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-700 w-4">🥉</span>
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Mariam" className="w-6 h-6 rounded-full" />
                      <span className="font-semibold text-zinc-300">Mariam Hassan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400">92.1 score</span>
                      <span className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.25 rounded uppercase">Viral King</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges and Streaks */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Daily Streak Tracker</span>
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                    <div>
                      <span className="text-sm font-black text-white block">14 Day Streak!</span>
                      <span className="text-[9px] text-zinc-500">Log in tomorrow to secure +50 exp.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Earned Badges</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9.5px] font-bold px-2 py-0.75 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">🏆 Top Creator</span>
                    <span className="text-[9.5px] font-bold px-2 py-0.75 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">⚡ Fast Responder</span>
                    <span className="text-[9.5px] font-bold px-2 py-0.75 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">🔥 Viral Creator</span>
                    <span className="text-[9.5px] font-bold px-2 py-0.75 rounded-full bg-zinc-800 text-zinc-400">💎 Premium Creator</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: INTEGRATIONS */}
        {activeToolkitTab === 'integrations' && (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="flex items-center gap-2.5 text-orange-400">
              <Laptop className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                {isRtl ? 'بوابة ربط الأنظمة وشركاء Shopify / TikTok' : 'Creova Marketplace & API Integrations'}
              </h4>
            </div>

            <p className="text-xs text-zinc-400">
              {isRtl 
                ? 'اربط متجرك على Shopify أو TikTok Shop مباشرة مع لوحة التحكم لتتبع مستويات شحن المنتجات وتوزيع الأكواد الترويجية وإطلاق الحملات بضغطة واحدة.'
                : 'Connect your Shopify store, Meta pixel, or WhatsApp communication bots to automatically track sample shipments, attribute viral discount codes, and optimize campaign ROI in real time.'
              }
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Shopify */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between h-32">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Shopify Marketplace</span>
                  <span className="text-[9.5px] text-zinc-500">Auto-import products & tracking</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold ${integrations.shopify ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {integrations.shopify ? 'Connected' : 'Offline'}
                  </span>
                  <button
                    onClick={() => setIntegrations(prev => ({ ...prev, shopify: !prev.shopify }))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-200 rounded cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              {/* Meta Ads */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between h-32">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Meta & TikTok Ads</span>
                  <span className="text-[9.5px] text-zinc-500">Sync UGC creatives directly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold ${integrations.meta_ads ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {integrations.meta_ads ? 'Connected' : 'Offline'}
                  </span>
                  <button
                    onClick={() => setIntegrations(prev => ({ ...prev, meta_ads: !prev.meta_ads }))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-200 rounded cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              {/* WhatsApp Bot */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between h-32">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">WhatsApp Bot Alerts</span>
                  <span className="text-[9.5px] text-zinc-500">Instant SMS & chat notifications</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold ${integrations.whatsapp_bot ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {integrations.whatsapp_bot ? 'Connected' : 'Offline'}
                  </span>
                  <button
                    onClick={() => setIntegrations(prev => ({ ...prev, whatsapp_bot: !prev.whatsapp_bot }))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-200 rounded cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              {/* White-Label Agency */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between h-32">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Telegram & APIs</span>
                  <span className="text-[9.5px] text-zinc-500">Custom bots for rapid briefs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold ${integrations.tiktok_pixel ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {integrations.tiktok_pixel ? 'Connected' : 'Offline'}
                  </span>
                  <button
                    onClick={() => setIntegrations(prev => ({ ...prev, tiktok_pixel: !prev.tiktok_pixel }))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-200 rounded cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Embedded Global Toast inside component */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 shadow-2xl text-xs max-w-sm font-bold flex items-center gap-2 animate-fade-in">
          <span className="text-emerald-500">🛡️</span>
          <span>{toast.msg}</span>
        </div>
      )}

    </div>
  );
}
