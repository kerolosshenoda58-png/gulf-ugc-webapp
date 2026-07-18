import React, { useState } from 'react';
import { 
  AppState, 
  AppLanguage, 
  BrandProfile, 
  CampaignBrief, 
  ActiveProject,
  CreatorProfile 
} from '../types.js';
import CollabHubView from './CollabHubView.js';
import GoogleTasksSync from './GoogleTasksSync.js';
import { 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Calendar, 
  Plus, 
  Eye, 
  Search, 
  Filter, 
  Clock, 
  Video, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  Heart,
  Star
} from 'lucide-react';

interface BrandViewProps {
  state: AppState;
  lang: AppLanguage;
  brandId: string;
  onPostCampaign: (campaignData: any) => Promise<void>;
  onAcceptApplication: (projectId: string) => Promise<void>;
  onRequestRevision: (projectId: string, commentText: string) => Promise<void>;
  onApproveDeliverable: (projectId: string) => Promise<void>;
  onDispute: (projectId: string, reason: string) => Promise<void>;
  refreshState: () => void;
}

export default function BrandView({
  state,
  lang,
  brandId,
  onPostCampaign,
  onAcceptApplication,
  onRequestRevision,
  onApproveDeliverable,
  onDispute,
  refreshState
}: BrandViewProps) {
  const isRtl = lang === 'ar';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'find_creators' | 'campaigns' | 'analytics' | 'billing' | 'collab_hub'>('dashboard');

  // Find Creators state
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');
  const [selectedCreatorCountry, setSelectedCreatorCountry] = useState('All');
  const [selectedCreatorNiche, setSelectedCreatorNiche] = useState('All');
  const [selectedCreatorProfile, setSelectedCreatorProfile] = useState<CreatorProfile | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null); // Creator Id

  // Saved Creators sliding panel simulation (Section 5.6)
  const [showSavedCreators, setShowSavedCreators] = useState(false);
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>(['creator_sofia']);

  // Campaign creation wizard state (Section 11)
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Wizard fields
  const [wTitle, setWTitle] = useState('KSA Autumn Skincare Blitz');
  const [wProduct, setWProduct] = useState('Ultra Skin-Shield SF-50');
  const [wCategory, setWCategory] = useState('Skincare');
  const [wDescription, setWDescription] = useState('We need creators in Riyadh to demonstrate our non-greasy sunscreen in daily commute vlogs.');
  const [wVideoType, setWVideoType] = useState('GRWM');
  const [wTone, setWTone] = useState('Premium');
  const [wScript, setWScript] = useState('');
  const [wVideoTypesSelected, setWVideoTypesSelected] = useState<string[]>(['GRWM', 'Testimonial']);
  const [wGender, setWGender] = useState('All');
  const [wAgeRange, setWAgeRange] = useState('18-35');
  const [wCountries, setWCountries] = useState<string[]>(['KSA', 'UAE']);
  const [wBudgetPer, setWBudgetPer] = useState<number>(300);
  const [wCreatorCount, setWCreatorCount] = useState<number>(3);
  const [wDeadline, setWDeadline] = useState('2026-09-01');
  const [wPhysicalProduct, setWPhysicalProduct] = useState(true);
  const [wShippingMethod, setWShippingMethod] = useState('Aramex Express');
  const [wShippingWindow, setWShippingWindow] = useState('3 business days');

  // Inline revision request notes
  const [activeReviewProjectId, setActiveReviewProjectId] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [isReviewActionLoading, setIsReviewActionLoading] = useState(false);

  // Find Brand Data
  const brand = state.brands.find(b => b.id === brandId) || state.brands[0];

  // Projects associated with this brand
  const brandProjects = state.projects.filter(p => p.brandId === brand.id);

  // Statistics
  const activeCampaignsCount = state.campaigns.filter(c => c.brandId === brand.id && c.status === 'active').length;
  const approvalsNeededCount = brandProjects.filter(p => p.status === 'in_review').length;
  const uniqueCreatorsHired = new Set(brandProjects.filter(p => p.status === 'accepted' || p.status === 'approved').map(p => p.creatorId)).size;

  // Find Creators filtering
  const filteredCreators = state.creators.filter(c => {
    // only show vetted approved or draft creators to brands
    if (c.vettingStatus !== 'approved') return false;

    // text search
    if (creatorSearchQuery) {
      const q = creatorSearchQuery.toLowerCase();
      const match = c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q);
      if (!match) return false;
    }

    // country
    if (selectedCreatorCountry !== 'All' && c.country !== selectedCreatorCountry) return false;

    // niche
    if (selectedCreatorNiche !== 'All' && !c.niches.some(n => n.includes(selectedCreatorNiche))) return false;

    return true;
  });

  const toggleSaveCreator = (id: string) => {
    setSavedCreatorIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Trigger Gemini AI Script writing (Section 11 - Step 2)
  const handleGenerateAIScript = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/campaigns/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wTitle,
          productName: wProduct,
          category: wCategory,
          description: wDescription,
          videoType: wVideoType,
          tone: wTone
        })
      });
      const data = await response.json();
      setWScript(data.script || 'Failed to write script. Please try again.');
    } catch (e) {
      console.error(e);
      setWScript('Network error writing script. Fallback script inserted.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePostCampaignWizardSubmit = async () => {
    setIsReviewActionLoading(true);
    
    await onPostCampaign({
      brandId: brand.id,
      title: wTitle,
      productName: wProduct,
      category: wCategory,
      description: wDescription,
      videoTypes: wVideoTypesSelected,
      targetDemographics: {
        gender: wGender,
        ageRange: wAgeRange,
        countries: wCountries
      },
      budgetPerCreator: Number(wBudgetPer),
      creatorCountWanted: Number(wCreatorCount),
      deadline: wDeadline,
      physicalProduct: wPhysicalProduct,
      shippingMethod: wShippingMethod,
      shippingWindow: wShippingWindow,
      scriptText: wScript
    });

    setIsReviewActionLoading(false);
    setShowCreateWizard(false);
    setWizardStep(1);
    setActiveTab('dashboard');
  };

  // Brand Actions on Submissions
  const handleBrandAcceptHire = async (projectId: string) => {
    await onAcceptApplication(projectId);
    refreshState();
  };

  const handleBrandRevisionRequest = async (projectId: string) => {
    if (!revisionComment) return;
    setIsReviewActionLoading(true);
    await onRequestRevision(projectId, revisionComment);
    setIsReviewActionLoading(false);
    setActiveReviewProjectId(null);
    setRevisionComment('');
    refreshState();
  };

  const handleBrandApproveRelease = async (projectId: string) => {
    setIsReviewActionLoading(true);
    await onApproveDeliverable(projectId);
    setIsReviewActionLoading(false);
    setActiveReviewProjectId(null);
    refreshState();
  };

  return (
    <div id="brand_portal" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Brand Profile Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-orange-500/20">
              {brand.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{brand.name}</h2>
                <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  {isRtl ? "شريك معتمد" : "Brand Account"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{brand.industry} · {brand.city}, {brand.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sliding Saved Creators toggle */}
            <button
              onClick={() => setShowSavedCreators(!showSavedCreators)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{isRtl ? "قائمة المفضلين" : "Saved Creators"} ({savedCreatorIds.length})</span>
            </button>

            {/* Post Campaign Trigger */}
            <button
              id="btn_brand_new_campaign"
              onClick={() => {
                setShowCreateWizard(true);
                setWizardStep(1);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? "حملة جديدة" : "+ New Campaign"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-zinc-850 mb-4 gap-4 overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label_en: 'Dashboard', label_ar: 'الرئيسية' },
          { id: 'find_creators', label_en: 'Find Creators', label_ar: 'البحث عن صناع محتوى' },
          { id: 'campaigns', label_en: 'My Campaigns', label_ar: 'حملاتي' },
          { id: 'collab_hub', label_en: 'Collab Hub (Contra)', label_ar: 'مركز التعاون المشترك' },
          { id: 'analytics', label_en: 'Analytics', label_ar: 'التحليلات والمؤشرات' },
          { id: 'billing', label_en: 'Billing & Topups', label_ar: 'الحسابات والشحن' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setShowCreateWizard(false);
            }}
            className={`py-2.5 text-xs font-black relative whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'text-orange-500 border-b-2 border-orange-500 dark:text-orange-400 dark:border-orange-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {isRtl ? tab.label_ar : tab.label_en}
              {tab.id === 'dashboard' && approvalsNeededCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {approvalsNeededCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* TABS PANELS CONTROLLER */}
      {activeTab === 'dashboard' && (
        <div id="brand_tab_dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* left 2/3 area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Parity visual budget card (Section 10.2 & 3) */}
            <div className="bg-gradient-to-br from-slate-900 to-zinc-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                  Spotless Pay Campaign Budget Left
                </span>
                <span className="text-xs text-slate-400">🛡️ Escrow Locked & Safe</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-slate-400 text-xs block mb-1">
                    {isRtl ? "الرصيد المتاح لتمويل الحملات" : "Available Campaign Balance"}
                  </span>
                  <span className="text-4xl font-black">${brand.budgetLeft}</span>
                </div>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer transition-colors"
                >
                  {isRtl ? "شحن رصيد" : "Fund Topup"}
                </button>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-normal mt-4 border-t border-slate-800 pt-3">
                {isRtl 
                  ? "يتم حجز ميزانية الحملة بالكامل في الضمان الدفعي الآمن بمجرد التوظيف، ولا يمكن صرفها إلا بموافقتك الإبداعية." 
                  : "All hired slots lock budget into Spotless Pay escrow. You hold absolute draft review authorization before funds deploy."}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "إجمالي الإنفاق" : "Total Spent"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">${brand.totalSpent}</span>
                <span className="text-[9px] text-orange-500 font-bold block mt-0.5">+$4,200 {isRtl ? "هذا الشهر" : "this month"}</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "حملات نشطة" : "Active Campaigns"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{activeCampaignsCount}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">across regional cities</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "صناع تم توظيفهم" : "Creators Hired"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{uniqueCreatorsHired}</span>
                <span className="text-[9px] text-orange-500 dark:text-orange-400 font-bold block mt-0.5">Verified Gulf network</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "متوسط العائد ROAS" : "Avg ROAS"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">4.12x</span>
                <span className="text-[9px] text-orange-500 dark:text-orange-400 font-bold block mt-0.5">▲ vs last quarter</span>
              </div>
            </div>

            {/* Active Submissions & Applications (Section 10.2) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {isRtl ? "إدارة مسودات وطلبات العمل" : "Active Submissions & Approvals"}
                </h3>
                {approvalsNeededCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {approvalsNeededCount} {isRtl ? "يحتاج مراجعة" : "needs action"}
                  </span>
                )}
              </div>

              {brandProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">{isRtl ? "لا توجد مسودات حالية للمراجعة." : "No current applications or draft videos. Post briefs to attract top Gulf creators!"}</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {brandProjects.map((proj) => {
                    const currentDraft = proj.submissions[proj.submissions.length - 1];

                    return (
                      <div key={proj.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={proj.creatorAvatar} 
                              alt={proj.creatorName} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-800"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{proj.creatorName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{proj.creatorHandle}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {proj.campaignTitle} · Locked fee: <span className="font-semibold text-slate-700 dark:text-zinc-300">${proj.amountHeld}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            {/* Status and Action trigger based on current status */}
                            {proj.status === 'applied' && (
                              <button
                                onClick={() => handleBrandAcceptHire(proj.id)}
                                className="bg-black hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                              >
                                Accept Pitch & Lock Escrow
                              </button>
                            )}

                            {proj.status === 'accepted' && (
                              <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-zinc-800 border px-2.5 py-1 rounded">
                                {isRtl ? "بانتظار مسودة صانع المحتوى" : "Awaiting Creator Video Draft"}
                              </span>
                            )}

                            {proj.status === 'in_review' && (
                              <button
                                onClick={() => {
                                  setActiveReviewProjectId(proj.id);
                                  setRevisionComment('');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shadow cursor-pointer animate-pulse"
                              >
                                {isRtl ? "مراجعة وحسم الدفع" : "Review & Decide Escrow"}
                              </button>
                            )}

                            {proj.status === 'revision_needed' && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded font-bold">
                                {isRtl ? "قيد التعديل من الصانع" : "Creator Revising (Draft V" + proj.submissions.length + ")"}
                              </span>
                            )}

                            {proj.status === 'approved' && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded font-bold flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5" />
                                {isRtl ? "تمت الموافقة والدفع" : "Escrow Released (Completed)"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expandable Review Panel inline */}
                        {activeReviewProjectId === proj.id && (
                          <div className="mt-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-slide-down">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
                                <Video className="w-8 h-8 text-zinc-500 animate-pulse" />
                                <span className="absolute bottom-1 right-1 bg-black/85 text-[9px] text-white px-2 py-0.5 font-bold rounded">
                                  Play V{proj.submissions.length} Draft
                                </span>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Creator submission notes:</span>
                                  <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                                    "{currentDraft?.notes || 'No annotations provided.'}"
                                  </p>
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                                    {isRtl ? "ملاحظة التعديل المطلوبة (إذا لم توافق)" : "Revision feedback notes (Required if rejecting/revising)"}
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={revisionComment}
                                    onChange={(e) => setRevisionComment(e.target.value)}
                                    placeholder="e.g. Please make the bottle zoom bright and adjust background music volume..."
                                    className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-1.5 justify-end">
                                  <button
                                    onClick={() => setActiveReviewProjectId(null)}
                                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 px-3 py-1 cursor-pointer"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    onClick={() => handleBrandRevisionRequest(proj.id)}
                                    disabled={!revisionComment || isReviewActionLoading}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                                      revisionComment
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                    }`}
                                  >
                                    Request Revision
                                  </button>

                                  <button
                                    onClick={() => handleBrandApproveRelease(proj.id)}
                                    disabled={isReviewActionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-1.5 rounded-lg shadow cursor-pointer flex items-center gap-1"
                                  >
                                    {isReviewActionLoading ? (
                                      <Clock className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Approve & Release Escrow
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Google Tasks Sync Integration Widget */}
            <GoogleTasksSync 
              state={state} 
              currentRole="brand" 
              userEmail={brand.name} 
              isRtl={isRtl} 
              accentColor="orange" 
            />

          </div>

          {/* right sidebar info: list of saved/fave creators */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                📍 Gulf Region Live Activity
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed">
                {isRtl 
                  ? "يتم تتبع العقود والشحنات الإقليمية آلياً عبر شبكة الخليج للتأكد من تسليم المسودات قبل الموعد." 
                  : "Gulf region contracts are monitored in real-time. Content matches, Aramex shipments, and Spotless Pay holds perform securely."}
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'collab_hub' && (
        <CollabHubView
          state={state}
          isRtl={isRtl}
          currentUserId={brand.id}
          currentUserType="brand"
          currentUserAvatar={brand.logo}
          currentUserName={brand.name}
          refreshState={refreshState}
          accentColor="orange"
        />
      )}

      {activeTab === 'find_creators' && (
        <div id="brand_tab_find_creators" className="space-y-6 animate-fade-in">
          {/* Filters card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={isRtl ? "البحث بالاسم أو المجال..." : "Search name, bio keywords..."}
                value={creatorSearchQuery}
                onChange={(e) => setCreatorSearchQuery(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-zinc-500">{isRtl ? "البلد:" : "Country:"}</span>
                <select
                  value={selectedCreatorCountry}
                  onChange={(e) => setSelectedCreatorCountry(e.target.value)}
                  className="text-xs p-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded"
                >
                  <option value="All">All</option>
                  <option value="UAE">UAE</option>
                  <option value="KSA">KSA</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Kuwait">Kuwait</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-zinc-500">{isRtl ? "المجال:" : "Niche:"}</span>
                <select
                  value={selectedCreatorNiche}
                  onChange={(e) => setSelectedCreatorNiche(e.target.value)}
                  className="text-xs p-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded"
                >
                  <option value="All">All</option>
                  <option value="Beauty">Beauty & Skincare</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Tech">Tech & Gadgets</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Food">Food & F&B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Creators grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((item) => (
              <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-11 h-11 rounded-full object-cover border" />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-zinc-900 dark:text-white">{item.name}</h4>
                          {item.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{item.handle} · {item.city}, {item.country}</span>
                      </div>
                    </div>

                    {/* rating */}
                    <div className="flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-950 border px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{item.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                    {item.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.niches.map((n, i) => (
                      <span key={i} className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 font-semibold px-2 py-0.5 rounded">
                        {n}
                      </span>
                    ))}
                  </div>

                  {/* quick stats block */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850 text-center text-[10px] text-zinc-500 mb-4">
                    <div>
                      <span className="text-zinc-400 block uppercase font-mono text-[8px]">On-Time</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.onTimeRate}%</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block uppercase font-mono text-[8px]">Revisions</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.revisionRate}x</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block uppercase font-mono text-[8px]">Repeat Clients</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.repeatClients}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleSaveCreator(item.id)}
                    className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg text-zinc-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${savedCreatorIds.includes(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <div className="flex gap-1.5 flex-1 justify-end">
                    <button
                      onClick={() => setSelectedCreatorProfile(item)}
                      className="text-[10px] font-bold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-200 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setShowInviteModal(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Creator Profile Modal Drawer (Section 5.4 & 10.3) */}
          {selectedCreatorProfile && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
                
                <button 
                  onClick={() => setSelectedCreatorProfile(null)}
                  className="absolute top-4 right-4 text-xs font-bold text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  ✕ Close
                </button>

                <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-zinc-150 dark:border-zinc-800">
                  <img src={selectedCreatorProfile.avatar} alt={selectedCreatorProfile.name} className="w-16 h-16 rounded-full object-cover border" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-zinc-900 dark:text-white">{selectedCreatorProfile.name}</h3>
                      {selectedCreatorProfile.verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <span className="text-xs text-zinc-400 block">{selectedCreatorProfile.handle} · {selectedCreatorProfile.city}, {selectedCreatorProfile.country}</span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">{selectedCreatorProfile.bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Trust Statistics</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b">
                        <span>On-Time Rate:</span>
                        <span className="font-bold">{selectedCreatorProfile.onTimeRate}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Avg Revisions Needed:</span>
                        <span className="font-bold">{selectedCreatorProfile.revisionRate} rounds</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Repeat Client Ratio:</span>
                        <span className="font-bold">{selectedCreatorProfile.repeatClients}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Est Follower Scope:</span>
                        <span className="font-bold text-emerald-600">{(selectedCreatorProfile.followerCount / 1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Portfolio Deliverables</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCreatorProfile.portfolio.map((port) => (
                        <div key={port.id} className="bg-zinc-100 dark:bg-zinc-950 aspect-video rounded-lg flex items-center justify-center text-zinc-400 relative">
                          <Video className="w-5 h-5 opacity-40" />
                          <span className="absolute bottom-1 text-[8px] font-bold text-center px-1 block truncate w-full bg-black/60 text-white">
                            {port.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedCreatorProfile(null)}
                    className="px-4 py-2 text-xs font-bold text-zinc-500"
                  >
                    Close Profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCreatorProfile(null);
                      setShowInviteModal(selectedCreatorProfile.id);
                    }}
                    className="bg-emerald-600 text-white font-black text-xs px-5 py-2 rounded-lg cursor-pointer"
                  >
                    Invite to active campaign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invitation modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2">Campaign Invite</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Select which brief you'd like to invite {state.creators.find(c => c.id === showInviteModal)?.name} to collaborate on.
                </p>

                <div className="space-y-2">
                  {state.campaigns.filter(c => c.brandId === brand.id).map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() => {
                        alert(`Invitation sent for Campaign: "${camp.title}"!`);
                        setShowInviteModal(null);
                      }}
                      className="w-full text-left text-xs p-3 bg-zinc-50 dark:bg-zinc-950 hover:bg-emerald-50 dark:hover:bg-emerald-950 border rounded-lg font-bold block"
                    >
                      {camp.title} · Budget: ${camp.budgetPerCreator}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-2 border-t flex justify-end">
                  <button onClick={() => setShowInviteModal(null)} className="text-xs text-zinc-400 font-bold">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div id="brand_tab_campaigns" className="space-y-6 animate-fade-in">
          {state.campaigns.filter(c => c.brandId === brand.id).length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No campaigns created yet. Click "+ New Campaign" in the header to launch one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {state.campaigns.filter(c => c.brandId === brand.id).map((camp) => (
                <div key={camp.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">{camp.title}</h3>
                      <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xl">
                      {camp.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] text-zinc-400">
                      <span className="bg-zinc-50 dark:bg-zinc-950 border px-2 py-0.5 rounded">Product: {camp.productName}</span>
                      <span className="bg-zinc-50 dark:bg-zinc-950 border px-2 py-0.5 rounded">Fee: ${camp.budgetPerCreator}/creator</span>
                      <span className="bg-zinc-50 dark:bg-zinc-950 border px-2 py-0.5 rounded">Needed: {camp.creatorCountWanted} creators</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col gap-1 text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">Locked Escrow Budget</span>
                    <span className="font-black text-emerald-600">${camp.budgetPerCreator * camp.creatorCountWanted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div id="brand_tab_analytics" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
              📈 Campaign Marketing Performance Metrics
            </h3>
            <p className="text-xs text-zinc-400">ROAS and performance reports calculated from completed approved videos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border">
              <span className="text-[10px] text-zinc-400 block uppercase font-mono mb-1">Cost Per Acquisition (CPA)</span>
              <span className="text-xl font-black text-zinc-800 dark:text-white">$14.25</span>
              <span className="text-[9px] text-emerald-500 block mt-1">▼ 15% lower than photo ads</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border">
              <span className="text-[10px] text-zinc-400 block uppercase font-mono mb-1">Click-Through Rate (CTR)</span>
              <span className="text-xl font-black text-zinc-800 dark:text-white">5.84%</span>
              <span className="text-[9px] text-emerald-500 block mt-1">▲ 3.2% vs industry average</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border">
              <span className="text-[10px] text-zinc-400 block uppercase font-mono mb-1">Total Deliverables Approved</span>
              <span className="text-xl font-black text-zinc-800 dark:text-white">12 videos</span>
              <span className="text-[9px] text-zinc-400 block mt-1">Ready for TikTok Spark ads</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div id="brand_tab_billing" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Spotless Pay Account History
            </h3>

            <div className="space-y-2.5">
              {state.transactions
                .filter(tx => tx.brandId === brand.id)
                .map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{tx.campaignTitle}</h4>
                      <span className="text-[9px] text-zinc-400 block">
                        {tx.type} · {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">${tx.amount}</span>
                      <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold font-mono">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Billing Methods & Invoices
            </h3>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400">Active Card</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-1">💳 Mastercard ending in 4432</span>
              <span className="text-[9px] text-zinc-400">Authorized for Spotless Pay escrow holds.</span>
            </div>

            <button 
              onClick={() => alert("Simulated budget topup successful! +$5,000 added.")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-lg shadow cursor-pointer text-center"
            >
              Simulate $5,000 Topup
            </button>
          </div>
        </div>
      )}

      {/* Campaign Creation Wizard Sliding Modal Dialog (Section 11) */}
      {showCreateWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Header / Steps progress indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-mono font-black">
                  Step {wizardStep} of 5
                </span>
                <h3 className="text-base font-black text-zinc-950 dark:text-white uppercase tracking-wider mt-0.5">
                  Launch Gulf UGC Campaign
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateWizard(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            {/* STEP 1: BASICS */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={wTitle}
                    onChange={(e) => setWTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 focus:outline-none"
                    placeholder="e.g. KSA Autumn Skincare Blitz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Product Name</label>
                    <input
                      type="text"
                      value={wProduct}
                      onChange={(e) => setWProduct(e.target.value)}
                      className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Category / Industry</label>
                    <select
                      value={wCategory}
                      onChange={(e) => setWCategory(e.target.value)}
                      className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 focus:outline-none"
                    >
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                      <option value="Electronics">Consumer Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Food & F&B">Food & F&B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Brief Description (What needs to be done)</label>
                  <textarea
                    rows={3}
                    value={wDescription}
                    onChange={(e) => setWDescription(e.target.value)}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 focus:outline-none"
                    placeholder="Describe product advantages..."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: BRIEF & AI SCRIPT WRITER */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        AI Script & Camera Cue Assistant (Gemini 3.5 Flash)
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                        Formulates camera directions, timestamp hook elements, and Arabic phrases optimized for KSA & UAE buyers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAIScript}
                      disabled={isGeneratingAI}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isGeneratingAI ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Generate script
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-zinc-400 block mb-0.5">Deliverable Type</span>
                      <select value={wVideoType} onChange={(e) => setWVideoType(e.target.value)} className="w-full p-1.5 border rounded bg-white">
                        <option value="GRWM">GRWM (Get Ready With Me)</option>
                        <option value="Unboxing">Aesthetic Unboxing</option>
                        <option value="Testimonial">Genuinely Honest Review</option>
                        <option value="Tutorial">Step-by-Step Tutorial</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-mono text-zinc-400 block mb-0.5">Style / Tone</span>
                      <select value={wTone} onChange={(e) => setWTone(e.target.value)} className="w-full p-1.5 border rounded bg-white">
                        <option value="Premium">Premium & High-End</option>
                        <option value="Playful">Playful & Upbeat</option>
                        <option value="Educational">Educational & Calm</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Camera Brief & Video Script Content</label>
                  <textarea
                    rows={8}
                    value={wScript}
                    onChange={(e) => setWScript(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 focus:outline-none font-mono"
                    placeholder="Click Generate script to suggest or write a custom prompt..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: TARGETING & BUDGET */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Demographics (Gender)</label>
                    <select value={wGender} onChange={(e) => setWGender(e.target.value)} className="w-full text-xs p-2.5 border rounded bg-zinc-50">
                      <option value="All">All</option>
                      <option value="Female">Female Only</option>
                      <option value="Male">Male Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Age Scope</label>
                    <input type="text" value={wAgeRange} onChange={(e) => setWAgeRange(e.target.value)} className="w-full text-xs p-2.5 border rounded bg-zinc-50" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Budget Per Creator ($)</label>
                    <input type="number" value={wBudgetPer} onChange={(e) => setWBudgetPer(Number(e.target.value))} className="w-full text-xs p-2.5 border rounded bg-zinc-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Creators Wanted</label>
                    <input type="number" value={wCreatorCount} onChange={(e) => setWCreatorCount(Number(e.target.value))} className="w-full text-xs p-2.5 border rounded bg-zinc-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Due Deadline</label>
                    <input type="date" value={wDeadline} onChange={(e) => setWDeadline(e.target.value)} className="w-full text-xs p-2.5 border rounded bg-zinc-50" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SHIPPING & ACCESSORIES */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Requires Physical Product Delivery</span>
                      <span className="text-[10px] text-zinc-400 block">We automatically query selected creator shipping addresses.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={wPhysicalProduct}
                      onChange={(e) => setWPhysicalProduct(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                  </div>

                  {wPhysicalProduct && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">Preferred Carrier Method</span>
                        <input type="text" value={wShippingMethod} onChange={(e) => setWShippingMethod(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Aramex / DHL" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">Est Shipping Window</span>
                        <input type="text" value={wShippingWindow} onChange={(e) => setWShippingWindow(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="2-3 business days" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & FUND WITH SPOTLESS PAY */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-emerald-600/10 border border-emerald-600/30 text-zinc-800 dark:text-zinc-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    🛡️ Spotless Pay Secure Escrow Authorization
                  </h4>
                  <p className="text-[11px] text-zinc-600 leading-normal">
                    Funding ensures absolute integrity. The total campaign budget of <span className="font-bold">${wBudgetPer * wCreatorCount}</span> is reserved temporarily in our secure Spotless Pay escrow. Creators will pitch knowing payouts are pre-locked and fully guaranteed!
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-400">Campaign:</span>
                    <span className="font-bold">{wTitle}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-400">Target Slots:</span>
                    <span className="font-bold">{wCreatorCount} creators</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-400">Locked Budget:</span>
                    <span className="font-black text-emerald-600">${wBudgetPer * wCreatorCount} USD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setWizardStep(prev => prev - 1)}
                disabled={wizardStep === 1}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-700 disabled:opacity-40"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-mono">
                  Autosaved at {new Date().toLocaleTimeString()}
                </span>
                
                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="bg-zinc-900 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePostCampaignWizardSubmit}
                    disabled={isReviewActionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                  >
                    {isReviewActionLoading ? (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Authorize & Fund Escrow</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sliding panel simulator of "Saved Creators" (Section 5.6) */}
      {showSavedCreators && (
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-zinc-900 shadow-2xl z-50 border-l border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between animate-slide-left">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                {isRtl ? "المفضلة المحفوظة" : "Saved Profiles Directory"}
              </h3>
              <button onClick={() => setShowSavedCreators(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-black cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 mb-4">
              {isRtl 
                ? "قائمة المتابعة السريعة الخاصة بك للتواصل مع أفضل صناع المحتوى المؤهلين." 
                : "Quick shortlist directory of creators you book frequently for cosmetic campaigns."}
            </p>

            <div className="space-y-4">
              {savedCreatorIds.map(id => {
                const item = state.creators.find(c => c.id === id);
                if (!item) return null;
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850">
                    <div className="flex items-center gap-2">
                      <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block">{item.name}</span>
                        <span className="text-[10px] text-zinc-400 block">{item.handle} · {item.country}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSaveCreator(item.id)}
                      className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={() => {
                setShowSavedCreators(false);
                setActiveTab('find_creators');
              }}
              className="w-full bg-zinc-900 text-white font-bold text-xs py-2 rounded-lg text-center cursor-pointer block"
            >
              Browse more creators
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
