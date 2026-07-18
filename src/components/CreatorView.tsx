import React, { useState } from 'react';
import { 
  AppState, 
  AppLanguage, 
  CreatorProfile, 
  CampaignBrief, 
  ActiveProject 
} from '../types.js';
import CollabHubView from './CollabHubView.js';
import { 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Clock, 
  Sliders, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  User, 
  MapPin, 
  Star, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Activity, 
  Download,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import PreRecordingGuidance from './PreRecordingGuidance.js';

interface CreatorViewProps {
  state: AppState;
  lang: AppLanguage;
  creatorId: string;
  onApply: (campaignId: string, pitchNote: string) => Promise<void>;
  onSubmitDraft: (projectId: string, videoUrl: string, notes: string) => Promise<void>;
  onDispute: (projectId: string, reason: string) => Promise<void>;
  refreshState: () => void;
}

export default function CreatorView({
  state,
  lang,
  creatorId,
  onApply,
  onSubmitDraft,
  onDispute,
  refreshState
}: CreatorViewProps) {
  const isRtl = lang === 'ar';
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'find_gigs' | 'my_projects' | 'portfolio' | 'earnings' | 'collab_hub'>('dashboard');

  // Find Gigs filters
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [pitchCampaignId, setPitchCampaignId] = useState<string | null>(null);
  const [pitchNote, setPitchNote] = useState<string>('');

  // Pre-recording checklist and submission modal state
  const [activeUploadProjectId, setActiveUploadProjectId] = useState<string | null>(null);
  const [showPreRecording, setShowPreRecording] = useState<boolean>(false);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  // Dispute state
  const [disputeProjectId, setDisputeProjectId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');

  // Find current creator profile
  const creator = state.creators.find(c => c.id === creatorId) || state.creators[0];

  // Calculated metrics
  const activeProjects = state.projects.filter(p => p.creatorId === creator.id);
  const escrowHeldAmount = activeProjects
    .filter(p => p.escrowStatus === 'held')
    .reduce((sum, p) => sum + p.amountHeld, 0);

  const totalEarned = state.transactions
    .filter(tx => tx.creatorId === creator.id && tx.type === 'escrow_release' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0) + 350; // include initial released tx

  // Filter gigs
  const availableGigs = state.campaigns.filter(camp => {
    // Check if creator has already applied/hired for this campaign
    const applied = state.projects.some(proj => proj.campaignId === camp.id && proj.creatorId === creator.id);
    if (applied) return false;

    if (selectedNiche === 'All') return true;
    return camp.category.toLowerCase().includes(selectedNiche.toLowerCase());
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchCampaignId) return;
    await onApply(pitchCampaignId, pitchNote);
    setPitchCampaignId(null);
    setPitchNote('');
    setActiveTab('my_projects');
  };

  const handleTriggerUploadFlow = (projectId: string) => {
    setActiveUploadProjectId(projectId);
    setShowPreRecording(true); // Always show pre-recording guidance checklist first! (Section 5.1 & 9.3)
  };

  const handlePreRecordingConfirmed = () => {
    setShowPreRecording(false);
    // Proceed to actual mock file submit
    setSubmissionNotes(isRtl ? "مسودة الفيديو عالية الدقة مصممة خصيصاً للعلامة التجارية" : "HD video draft tailored specifically for the brand's specifications.");
  };

  const handleDraftSubmitAction = async () => {
    if (!activeUploadProjectId) return;
    setIsSubmittingForm(true);
    // Simulate uploading a realistic video sample
    const videoSamples = [
      "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-woman-holding-perfume-bottle-in-a-aesthetic-way-40010-large.mp4"
    ];
    const selectedVideo = videoSamples[Math.floor(Math.random() * videoSamples.length)];
    
    await onSubmitDraft(activeUploadProjectId, selectedVideo, submissionNotes);
    
    setIsSubmittingForm(false);
    setActiveUploadProjectId(null);
    setSubmissionNotes('');
    setActiveTab('my_projects');
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeProjectId) return;
    await onDispute(disputeProjectId, disputeReason);
    setDisputeProjectId(null);
    setDisputeReason('');
    refreshState();
  };

  // Vetting warning banner
  const showVettingWarning = creator.vettingStatus === 'pending_review';

  return (
    <div id="creator_dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Vetting Pending Sticky Banner */}
      {showVettingWarning && (
        <div id="vetting_warning_banner" className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                {isRtl ? "طلب اعتماد حسابك قيد المراجعة" : "Creator Vetting Queue Status: Pending Review"}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isRtl 
                  ? "يمكنك تصفح الفرص المتاحة كعرض فقط. لا يمكنك التقديم حتى يوافق المديرون في لوحة التحكم الخاصة بهم." 
                  : "You can browse gigs in read-only mode. Vetting approval by an Admin is required to apply."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-sm"
          >
            {isRtl ? "عرض المعاينة" : "Check Status"}
          </button>
        </div>
      )}

      {/* Profile Header & Level (Section 9.2 & 5.5) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={creator.avatar} 
              alt={creator.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-black dark:border-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{creator.name}</h2>
                {creator.verified && (
                  <span className="flex items-center gap-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    {isRtl ? "موثق" : "Verified"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{creator.handle} · {creator.city}, {creator.country}</p>
              
              {/* Niches Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {creator.niches.map((n, i) => (
                  <span key={i} className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gamification Level Widget (Section 5.5) */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 w-full md:w-64">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>🏆 Level {creator.lvl} Creator</span>
              <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400">{creator.exp % 1000} / 1000 XP</span>
            </div>
            {/* XP progress bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="bg-violet-600 h-full transition-all duration-500"
                style={{ width: `${(creator.exp % 1000) / 10}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">
              {isRtl ? "أكمل الحملات لكسب XP وفتح مكافآت المطابقة الأولوية!" : "Complete campaigns to earn XP and unlock priority gig matching!"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-4 gap-4 overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label_en: 'Dashboard', label_ar: 'لوحة التحكم' },
          { id: 'find_gigs', label_en: 'Find Gigs', label_ar: 'ابحث عن صفقات' },
          { id: 'my_projects', label_en: 'My Projects', label_ar: 'مشاريعي', count: activeProjects.length },
          { id: 'collab_hub', label_en: 'Collab Hub (Contra)', label_ar: 'مركز التعاون المشترك' },
          { id: 'portfolio', label_en: 'My Portfolio', label_ar: 'معرض أعمالي' },
          { id: 'earnings', label_en: 'Earnings & Billing', label_ar: 'الأرباح والفواتير' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setActiveUploadProjectId(null);
              setShowPreRecording(false);
            }}
            className={`py-2.5 text-xs font-black relative whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {isRtl ? tab.label_ar : tab.label_en}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW PANEL CONTROLLER */}
      {activeTab === 'dashboard' && (
        <div id="creator_tab_dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main left area (Stats & Escrow Modules) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Spotless Pay Escrow Module (Branded Escrow - Section 1 & 9.2) */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
                <ShieldCheck className="w-64 h-64 text-violet-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-white/10 text-white font-black text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  Spotless Pay · Escrow Active
                </span>
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
                  🛡️ 100% Escrow Secured
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-medium block">
                  {isRtl ? "إجمالي الرصيد المحتجز بالضمان" : "Total Balance Held in Escrow"}
                </span>
                <span className="text-2xl font-black">${escrowHeldAmount}</span>
              </div>

              {/* Itemized active escrows */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/5 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-1">
                  {isRtl ? "مستحقات الضمان الجارية لكل علامة تجارية" : "Itemized Active Escrows by Client"}
                </h4>
                {activeProjects.filter(p => p.escrowStatus === 'held').length === 0 ? (
                  <p className="text-xs text-slate-400/75 italic text-center py-1">
                    {isRtl ? "لا توجد أموال محتجزة بالضمان حالياً" : "No active funds in escrow. Apply and win gigs to lock payouts!"}
                  </p>
                ) : (
                  activeProjects.filter(p => p.escrowStatus === 'held').map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <span className="w-4 h-4 bg-white/10 rounded flex items-center justify-center text-[10px]">
                          {proj.brandLogo}
                        </span>
                        {proj.brandName} — {proj.campaignTitle}
                      </span>
                      <span className="font-bold text-white">${proj.amountHeld}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400">
                <span>{isRtl ? "المستحقات تُحرر فوراً عند الموافقة على مسودة الفيديو" : "Funds release automatically to your earnings upon brand approval of final draft."}</span>
                <button onClick={() => setActiveTab('earnings')} className="underline font-bold hover:text-white cursor-pointer">
                  {isRtl ? "عرض المعاملات" : "Transactions"}
                </button>
              </div>
            </div>

            {/* Stat grid (Section 9.2) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Stat 1 */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "إجمالي الأرباح" : "Total Earned"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">${totalEarned}</span>
                <span className="text-[9px] text-violet-600 dark:text-violet-400 font-bold block mt-0.5">+$350 {isRtl ? "هذا الشهر" : "this month"}</span>
              </div>
              {/* Stat 2 */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "المشاريع النشطة" : "Active Projects"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                  {activeProjects.filter(p => p.status !== 'rejected' && p.status !== 'approved').length}
                </span>
                {activeProjects.some(p => p.status === 'revision_needed') ? (
                  <span className="text-[9px] text-violet-600 dark:text-violet-400 font-bold block mt-0.5">⚠️ {isRtl ? "يتطلب تعديل" : "Needs revision"}</span>
                ) : (
                  <span className="text-[9px] text-slate-400 block mt-0.5">0 needs attention</span>
                )}
              </div>
              {/* Stat 3 */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "معدل التفاعل" : "Avg Engagement"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">4.8%</span>
                <span className="text-[9px] text-violet-600 dark:text-violet-400 font-bold block mt-0.5">+0.3% {isRtl ? "هذا الأسبوع" : "this week"}</span>
              </div>
              {/* Stat 4 */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">{isRtl ? "مشاهدات الملف الشخصي" : "Profile Views"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">1,480</span>
                <span className="text-[9px] text-violet-600 dark:text-violet-400 font-bold block mt-0.5">+12% {isRtl ? "مقارنة بالشهر الماضي" : "vs last month"}</span>
              </div>
            </div>

            {/* Active Projects List widget (Section 9.2) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {isRtl ? "المشاريع والطلبات النشطة" : "Active Project Workspaces"}
                </h3>
                <button onClick={() => setActiveTab('my_projects')} className="text-xs font-bold text-violet-600 hover:underline">
                  {isRtl ? "رؤية الكل" : "View All"}
                </button>
              </div>

              {activeProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">{isRtl ? "لا توجد مشاريع نشطة حالياً. تفقد الفرص المتاحة للتقديم!" : "No active projects. Go to 'Find Gigs' to apply and kick off your campaign!"}</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {activeProjects.map((proj) => (
                    <div key={proj.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-lg block">
                          {proj.brandLogo}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{proj.campaignTitle}</h4>
                            <span className="text-[10px] text-zinc-400 font-mono">by {proj.brandName}</span>
                          </div>
                          
                          {/* Status and Milestones */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {/* status pill */}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              proj.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                              proj.status === 'revision_needed' ? 'bg-amber-100 text-amber-700' :
                              proj.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              proj.status === 'applied' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              {proj.status.replace('_', ' ')}
                            </span>

                            {/* progress bar visual marker */}
                            <span className="text-[10px] text-zinc-400 font-medium">
                              Submissions: {proj.submissions.length}/5 Rounds
                            </span>

                            {proj.dueDate && (
                              <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-zinc-300" />
                                {proj.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 justify-end">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">${proj.amountHeld}</span>
                        
                        {proj.status === 'applied' && (
                          <span className="text-[10px] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 px-2 py-1 rounded">
                            {isRtl ? "بانتظار قبول الماركة" : "Awaiting Brand Hire"}
                          </span>
                        )}

                        {proj.status === 'accepted' && (
                          <button
                            onClick={() => handleTriggerUploadFlow(proj.id)}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            {isRtl ? "رفع مسودة" : "Upload Draft"}
                          </button>
                        )}

                        {proj.status === 'revision_needed' && (
                          <button
                            onClick={() => {
                              setActiveTab('my_projects');
                              handleTriggerUploadFlow(proj.id);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            {isRtl ? "رفع المراجعة" : "Upload Revision"}
                          </button>
                        )}

                        {proj.status === 'in_review' && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-0.5">
                            <Clock className="w-3 h-3 animate-spin" />
                            {isRtl ? "قيد المراجعة" : "Under Review"}
                          </span>
                        )}

                        {proj.status === 'approved' && (
                          <span className="text-[10px] text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" />
                            {isRtl ? "تم تحرير الأرباح" : "Released"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right sidebar area (Quick Stats Trust Signals & Portfolio previews) */}
          <div className="space-y-4">
            
            {/* Quick Stats Trust signal card block (Section 3 & 9.2) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                {isRtl ? "مؤشرات الثقة والأداء" : "Trust Signals & Performance"}
              </h3>
              <p className="text-[10px] text-zinc-400 mb-3">
                {isRtl 
                  ? "تُعرض هذه الإحصائيات تلقائياً على صفحتك العامة للشركات لتسهيل توظيفك." 
                  : "These stats are compiled directly from your contract history and displayed on your public card to brands."}
              </p>

              <div className="space-y-3">
                {/* stat 1 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">
                    <span>⏱️ {isRtl ? "التسليم في الوقت المحدد" : "On-Time Delivery Rate"}</span>
                    <span>{creator.onTimeRate}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full" style={{ width: `${creator.onTimeRate}%` }} />
                  </div>
                </div>

                {/* stat 2 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">
                    <span>🔄 {isRtl ? "معدل طلب التعديل" : "Avg Revision Rate"}</span>
                    <span>{creator.revisionRate}x {isRtl ? "جولات" : "rounds"}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full" style={{ width: '25%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-0.5 block">
                    {isRtl ? "أقل من متوسط المنصة البالغ 2.1 جولة" : "Better than the platform average of 2.1 rounds"}
                  </span>
                </div>

                {/* stat 3 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">
                    <span>🔁 {isRtl ? "العملاء المتكررون" : "Repeat Client Rate"}</span>
                    <span>{creator.repeatClients}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full" style={{ width: `${creator.repeatClients}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Gulf region verified scope info */}
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white block mb-1">📍 Region Scope: Gulf-First</span>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10.5px] leading-relaxed">
                {isRtl 
                  ? "حسابك مرخص للتعاقد في دولة الإمارات العربية المتحدة، المملكة العربية السعودية، وجمهورية مصر العربية بالإضافة إلى 12 دولة عربية وخليجية." 
                  : "Your profile is registered to operate across UAE, KSA, Egypt, and 12 Gulf countries, allowing unified cross-border payments through Spotless Pay."}
              </p>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'find_gigs' && (
        <div id="creator_tab_find_gigs">
          {/* Filters Row */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{isRtl ? "تصفية الفئات:" : "Filter Niche:"}</span>
              <div className="flex gap-1.5">
                {['All', 'Skincare', 'Nutrition', 'Fitness', 'Tech'].map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                      selectedNiche === niche
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {availableGigs.length} {isRtl ? "فرص توظيف متاحة" : "gigs available to apply"}
            </span>
          </div>

          {/* Gigs List */}
          {availableGigs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">{isRtl ? "لا توجد حملات متاحة تتطابق مع الفلتر حالياً." : "No available campaigns found. Try resetting the seed or changing the filter niche!"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableGigs.map((camp) => (
                <div key={camp.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{camp.brandLogo}</span>
                        <div>
                          <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-none">{camp.title}</h3>
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">{camp.brandName} · {camp.category}</span>
                        </div>
                      </div>
                      <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md">
                        ${camp.budgetPerCreator}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                      {camp.description}
                    </p>

                    {/* video types tag */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {camp.videoTypes.map((type, idx) => (
                        <span key={idx} className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold px-2 py-0.5 rounded uppercase">
                          📹 {type}
                        </span>
                      ))}
                    </div>

                    {/* demographics info */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg text-[10px] text-zinc-500 space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>🌍 Target Region:</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{camp.targetDemographics.countries.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👤 Demographics:</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{camp.targetDemographics.gender} ({camp.targetDemographics.ageRange})</span>
                      </div>
                      {camp.physicalProduct && (
                        <div className="flex justify-between">
                          <span>📦 Physical Product:</span>
                          <span className="text-violet-600 dark:text-violet-400 font-bold">{isRtl ? "مطلوب شحن" : "Required (Free Shipping)"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Trigger button */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      Deadline: {camp.deadline}
                    </span>
                    <button
                      onClick={() => {
                        if (creator.vettingStatus !== 'approved') {
                          alert(isRtl ? "حسابك قيد المراجعة الفنية من الإدارة. لا يمكنك تقديم عروض حتى يتم قبولك!" : "Your profile is in the vetting review queue. Admin approval is required to pitch!");
                          return;
                        }
                        setPitchCampaignId(camp.id);
                        setPitchNote(isRtl 
                          ? `مرحباً ${camp.brandName}! أنا متحمسة جداً لتجربة ${camp.productName} وصنع محتوى UGC رائع ومبهر يحول المشاهدين لمشترين!`
                          : `Hi ${camp.brandName}! I'm incredibly excited to shoot this campaign for ${camp.productName} and deliver visual assets that convert.`);
                      }}
                      disabled={creator.vettingStatus !== 'approved'}
                      className={`text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                        creator.vettingStatus === 'approved'
                          ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-sm'
                          : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {isRtl ? "تقديم عرض الآن" : "Pitch to Campaign"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pitch application Form Modal/Section overlay */}
          {pitchCampaignId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider mb-2">
                  {isRtl ? "تقديم مسودة ومقترح العرض" : "UGC Creator Pitch Offer"}
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  {isRtl 
                    ? "أضف ملاحظة توضح فكرتك الإبداعية للعلامة التجارية لزيادة قبولك." 
                    : "Describe your creative filming approach or showcase relevant past cosmetics videos to get hired."}
                </p>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {isRtl ? "ملاحظة المقترح الإبداعي" : "Creative Concept Pitch Note"}
                    </label>
                    <textarea
                      rows={4}
                      value={pitchNote}
                      onChange={(e) => setPitchNote(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:border-violet-500 text-zinc-800 dark:text-zinc-100"
                      placeholder="Write your creative idea..."
                    />
                  </div>

                  {state.campaigns.find(c => c.id === pitchCampaignId)?.physicalProduct && (
                    <div className="bg-violet-500/5 p-3 rounded-lg border border-violet-500/10 text-[11px] text-zinc-500">
                      <span className="font-bold text-zinc-700 block mb-1">📍 Delivery Address Confirmed:</span>
                      {creator.city}, {creator.country} (Free shipment managed automatically by brand).
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setPitchCampaignId(null)}
                      className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 cursor-pointer"
                    >
                      {isRtl ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow cursor-pointer"
                    >
                      {isRtl ? "إرسال العرض للماركة" : "Submit Pitch Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my_projects' && (
        <div id="creator_tab_my_projects" className="space-y-6">
          {activeProjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Video className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">{isRtl ? "لا توجد مشاريع نشطة حالياً." : "No active projects. Go to 'Find Gigs' to apply to brand briefs!"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeProjects.map((proj) => (
                <div key={proj.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  
                  {/* Top card header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-2xl block">
                        {proj.brandLogo}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white">{proj.campaignTitle}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {isRtl ? "بواسطة" : "by"} {proj.brandName} · Due: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{proj.dueDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-zinc-800 dark:border-zinc-700 px-3 py-1 rounded-md">
                        Spotless Pay Held: ${proj.amountHeld}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        proj.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                        proj.status === 'revision_needed' ? 'bg-amber-100 text-amber-700' :
                        proj.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        proj.status === 'applied' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Pitch Note or Shipment status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left block info */}
                    <div className="space-y-4 md:col-span-1">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">{isRtl ? "عرض التقديم الخاص بك" : "Your Pitch Offer Note"}</span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                          "{proj.pitchNote || 'No pitch text provided.'}"
                        </p>
                      </div>

                      {proj.trackingNumber && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-0.5">{isRtl ? "تتبع شحنة المنتج" : "Product Shipment Tracker"}</span>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{proj.trackingNumber}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold block w-fit mt-1.5 uppercase">
                            📦 {proj.trackingStatus}
                          </span>
                        </div>
                      )}

                      {/* File dispute action */}
                      {proj.status !== 'approved' && proj.status !== 'applied' && (
                        <button
                          onClick={() => setDisputeProjectId(proj.id)}
                          className="text-[11px] font-bold text-zinc-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {isRtl ? "رفع نزاع على الضمان إلى الإدارة" : "Dispute Spotless Pay Escrow"}
                        </button>
                      )}
                    </div>

                    {/* Middle: submissions draft list */}
                    <div className="md:col-span-2 space-y-4">
                      
                      {/* Active Submissions section */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3">
                          🎬 {isRtl ? "مسودات الفيديو والملفات المرفوعة" : "Uploaded Video Drafts History"}
                        </h4>

                        {proj.submissions.length === 0 ? (
                          <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                            {isRtl ? "لم يتم رفع أي مسودة بعد. انقر على رفع المسودة للبدء!" : "No draft versions submitted yet. Prepare your camera and click upload below!"}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {proj.submissions.map((sub) => (
                              <div key={sub.version} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl flex items-start gap-3">
                                <div className="w-16 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center relative flex-shrink-0">
                                  <Video className="w-5 h-5 text-zinc-500" />
                                  <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[8px] font-mono font-black text-white px-1 rounded">
                                    V{sub.version}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                    <span className="font-bold">Draft Version {sub.version}</span>
                                    <span>{new Date(sub.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                                    "{sub.notes}"
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Revision comments thread */}
                      {proj.revisionComments.length > 0 && (
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {isRtl ? "ملاحظات التعديل المطلوبة من العميل" : "Active Revision Comments from Client"}
                          </h4>
                          <div className="space-y-2">
                            {proj.revisionComments.map((com, idx) => (
                              <div key={idx} className="text-xs bg-white dark:bg-zinc-900 border border-amber-500/10 p-2.5 rounded-lg">
                                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                  <span className="font-bold text-amber-700">Client Request (V{com.version})</span>
                                  <span>{new Date(com.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">"{com.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Core interaction Action Bar */}
                      {proj.status === 'accepted' && (
                        <button
                          onClick={() => handleTriggerUploadFlow(proj.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          {isRtl ? "البدء ورفع مسودة الفيديو الأولى (V1)" : "Unlock Pre-recording Guidance & Upload V1"}
                        </button>
                      )}

                      {proj.status === 'revision_needed' && (
                        <button
                          onClick={() => handleTriggerUploadFlow(proj.id)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          {isRtl ? "البدء ورفع مسودة التعديل المحدثة" : "Unlock Pre-recording Guidance & Upload New Revision"}
                        </button>
                      )}

                      {proj.status === 'in_review' && (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-center">
                          <p className="text-xs text-blue-700 dark:text-blue-400 font-bold mb-1">
                            {isRtl ? "فيديو المسودة قيد المراجعة حالياً" : "Video Draft is Currently Under Review"}
                          </p>
                          <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">
                            {isRtl 
                              ? "تفحص الشركة محتوى الفيديو الخاص بك. عند القبول، سيتم الإفراج عن الدفع فوراً عبر Spotless Pay." 
                              : "The brand client is reviewing your submission. Payout is guaranteed via Spotless Pay escrow upon approval."}
                          </p>
                        </div>
                      )}

                      {proj.status === 'approved' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-black mb-1">
                            🎉 {isRtl ? "تمت الموافقة والإفراج عن مستحقاتك!" : "Deliverable Approved & Escrow Released!"}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {isRtl 
                              ? "تم إرسال الأرباح بنجاح إلى حسابك المصرفي. شكراً لمجهودك الإبداعي المميز!" 
                              : "Funds have been credited instantly. This completes the campaign, granting XP rewards!"}
                          </p>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Interactive Pre-Recording popup integration strictly matches specifications Section 5.1 & 9.3 */}
          {activeUploadProjectId && showPreRecording && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 max-w-lg w-full shadow-2xl overflow-hidden">
                <PreRecordingGuidance
                  lang={lang}
                  estimatedTime="15-30 seconds"
                  maxTime="60 seconds"
                  onCancel={() => {
                    setActiveUploadProjectId(null);
                    setShowPreRecording(false);
                  }}
                  onConfirm={handlePreRecordingConfirmed}
                />
              </div>
            </div>
          )}

          {/* Actual Mock upload comment overlay */}
          {activeUploadProjectId && !showPreRecording && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider mb-2">
                  {isRtl ? "رفع وتأكيد مسودة الفيديو" : "Submit Video Draft File"}
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  {isRtl 
                    ? "أضف رسالة قصيرة للعلامة التجارية تصف لقطاتك." 
                    : "Add any filming annotations or specific comments for the brand review editor."}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {isRtl ? "تعليق المرفق" : "Filming Comments / Notes"}
                    </label>
                    <textarea
                      rows={3}
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      className="w-full text-xs p-3 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveUploadProjectId(null)}
                      className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 cursor-pointer"
                    >
                      {isRtl ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      onClick={handleDraftSubmitAction}
                      disabled={isSubmittingForm}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingForm ? (
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {isRtl ? "إرسال للمراجعة الفورية" : "Submit Draft Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dispute Overlay */}
          {disputeProjectId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider mb-2 text-rose-600">
                  {isRtl ? "فتح نزاع ضمان الدفع" : "Initiate Spotless Pay Escrow Dispute"}
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  {isRtl 
                    ? "إذا حدث خلاف على جودة التصوير، سيقوم المسؤولون بمراجعة مسودتك لحسم الإفراج أو الاسترداد." 
                    : "If a creative disagreement occurs, filing locks the escrow. Platform Admins will review history to split/award funds."}
                </p>

                <form onSubmit={handleDisputeSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {isRtl ? "سبب النزاع والمستندات" : "Reason for Dispute"}
                    </label>
                    <textarea
                      rows={3}
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:border-rose-500 text-zinc-800 dark:text-zinc-100"
                      placeholder="Explain what happened..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDisputeProjectId(null)}
                      className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-750 cursor-pointer"
                    >
                      {isRtl ? "تراجع" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow cursor-pointer"
                    >
                      {isRtl ? "تأكيد رفع النزاع" : "File Official Dispute"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div id="creator_tab_portfolio" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
              {isRtl ? "معرض الفيديو والأعمال الإبداعية" : "UGC Creator Content Portfolio"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              {isRtl 
                ? "تضاف الفيديوهات المعتمدة تلقائياً هنا كمرجع جذب تسويقي ممتاز للعلامات التجارية الباحثة." 
                : "Approved brand campaigns populate your showcase page automatically. Share this link externally to win contracts!"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {creator.portfolio.map((item) => (
                <div key={item.id} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="bg-black aspect-video flex items-center justify-center text-zinc-600 relative">
                    <Video className="w-8 h-8 opacity-40" />
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded shadow">
                      {item.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 truncate">{item.title}</h4>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">UGC GULF Certified Content</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collab_hub' && (
        <CollabHubView
          state={state}
          isRtl={isRtl}
          currentUserId={creator.id}
          currentUserType="creator"
          currentUserAvatar={creator.avatar}
          currentUserName={creator.name}
          refreshState={refreshState}
          accentColor="violet"
        />
      )}

      {activeTab === 'earnings' && (
        <div id="creator_tab_earnings" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* left columns: transaction list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              {isRtl ? "سجل معاملات الدفع (Spotless Pay)" : "Spotless Pay Transaction Ledger"}
            </h3>

            <div className="space-y-3">
              {state.transactions
                .filter(tx => tx.creatorId === creator.id)
                .map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-xs font-black ${
                        tx.type === 'escrow_release' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {tx.type === 'escrow_release' ? '+$' : '$'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{tx.campaignTitle}</h4>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {tx.type.replace('_', ' ')} · {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${
                        tx.type === 'escrow_release' ? 'text-emerald-600' : 'text-zinc-700'
                      }`}>
                        {tx.type === 'escrow_release' ? '+' : ''}${tx.amount}
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-semibold px-1.5 py-0.2 rounded font-mono">
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* right column: payout billing settings info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
                {isRtl ? "تفاصيل حساب الفواتير والتحويل" : "Freelancer Payout Schedule"}
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-855">
                  <span className="text-[10px] text-zinc-400 block font-mono">STRIPE CONNECT STATUS</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    🟢 Express Connected
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {isRtl ? "أرباحك يتم تحويلها تلقائياً إلى بنك دبي الإسلامي (الإمارات)" : "Earnings are cleared automatically to your registered local bank."}
                  </p>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-850">
                  <span>Current Threshold:</span>
                  <span className="font-mono font-bold">$0 (Instant Release)</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-850">
                  <span>Next Payout:</span>
                  <span className="font-semibold text-zinc-700">Immediate</span>
                </div>

                <button 
                  onClick={() => alert(isRtl ? "جاري تحميل تفاصيل الفاتورة... (محاكاة)" : "Invoice download started (Simulated)...")}
                  className="w-full bg-zinc-900 hover:bg-black text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isRtl ? "تحميل كشف الحساب السنوي" : "Download Annual Statement"}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
