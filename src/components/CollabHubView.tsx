import React, { useState, useRef } from 'react';
import { 
  AppState, 
  CollabGig, 
  CreatorService, 
  ActiveCollab, 
  CollabMilestone,
  FrameComment
} from '../types.js';
import { 
  Plus, 
  Check, 
  FileText, 
  UserPlus, 
  Briefcase, 
  CreditCard, 
  Send, 
  MessageSquare, 
  Video, 
  Play, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  DollarSign,
  HelpCircle,
  TrendingUp,
  MapPin,
  Flame,
  Globe
} from 'lucide-react';

interface CollabHubViewProps {
  state: AppState;
  isRtl: boolean;
  currentUserId: string;
  currentUserType: 'creator' | 'brand';
  currentUserAvatar: string;
  currentUserName: string;
  refreshState: () => void;
  accentColor: string; // 'violet' | 'orange'
}

export default function CollabHubView({
  state,
  isRtl,
  currentUserId,
  currentUserType,
  currentUserAvatar,
  currentUserName,
  refreshState,
  accentColor
}: CollabHubViewProps) {
  // Sub-tabs
  const [subTab, setSubTab] = useState<'gigs' | 'services' | 'contracts'>('gigs');

  // Theme support
  const isViolet = accentColor === 'violet';
  const accentClass = isViolet 
    ? 'bg-violet-600 hover:bg-violet-700 text-white focus:ring-violet-500' 
    : 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500';
  const accentText = isViolet ? 'text-violet-600 dark:text-violet-400' : 'text-orange-500 dark:text-orange-400';
  const borderClass = isViolet ? 'border-violet-500' : 'border-orange-500';
  const bgLight = isViolet ? 'bg-violet-50 dark:bg-violet-950/20' : 'bg-orange-50 dark:bg-orange-950/20';

  // State data fallbacks
  const gigs = state.gigs || [];
  const services = state.services || [];
  const collaborations = state.collaborations || [];

  // Active Contracts
  const myContracts = collaborations.filter(c => 
    c.hirerId === currentUserId || c.providerId === currentUserId
  );

  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(
    myContracts.length > 0 ? myContracts[0].id : null
  );

  // Active Selected contract
  const activeCollab = collaborations.find(c => c.id === selectedCollabId) || myContracts[0];

  // Modals / Form toggles
  const [showPostGigForm, setShowPostGigForm] = useState(false);
  const [showPostServiceForm, setShowPostServiceForm] = useState(false);

  // Forms states
  const [gigTitle, setGigTitle] = useState('');
  const [gigRole, setGigRole] = useState<'editor' | 'scriptwriter' | 'translator' | 'model' | 'other'>('editor');
  const [gigDesc, setGigDesc] = useState('');
  const [gigBudget, setGigBudget] = useState(150);
  const [gigCountry, setGigCountry] = useState('UAE');
  const [gigDialect, setGigDialect] = useState('');
  const [gigReqs, setGigReqs] = useState('');

  const [srvTitle, setSrvTitle] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState(200);
  const [srvDays, setSrvDays] = useState(5);
  const [srvNiche, setSrvNiche] = useState('Beauty & Skincare');
  const [srvRaw, setSrvRaw] = useState(true);
  const [srvRevisions, setSrvRevisions] = useState(2);

  // Video and Timestamp Feedback States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [frameText, setFrameText] = useState('');
  const [videoPlayTime, setVideoPlayTime] = useState('00:00');
  const [videoPlayMs, setVideoPlayMs] = useState(0);

  // Track video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime;
      const minutes = Math.floor(curTime / 60);
      const seconds = Math.floor(curTime % 60);
      const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setVideoPlayTime(formatted);
      setVideoPlayMs(Math.floor(curTime * 1000));
    }
  };

  const seekToTime = (timestamp: string) => {
    if (videoRef.current) {
      const parts = timestamp.split(':');
      if (parts.length === 2) {
        const seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        videoRef.current.currentTime = seconds;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Submit handlers
  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle || !gigDesc) return;

    try {
      const res = await fetch('/api/gigs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posterId: currentUserId,
          posterName: currentUserName,
          posterAvatar: currentUserAvatar,
          posterType: currentUserType,
          title: gigTitle,
          role: gigRole,
          description: gigDesc,
          budget: gigBudget,
          country: gigCountry,
          dialect: gigDialect,
          requirements: gigReqs.split('\n').filter(r => r.trim() !== '')
        })
      });

      if (res.ok) {
        setGigTitle('');
        setGigDesc('');
        setGigReqs('');
        setShowPostGigForm(false);
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyToGig = async (gigId: string) => {
    try {
      const res = await fetch('/api/gigs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId,
          applicantId: currentUserId,
          applicantName: currentUserName,
          applicantAvatar: currentUserAvatar
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.collaboration) {
          setSelectedCollabId(data.collaboration.id);
        }
        setSubTab('contracts');
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle || !srvDesc) return;

    try {
      const res = await fetch('/api/services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: currentUserId,
          creatorName: currentUserName,
          creatorAvatar: currentUserAvatar,
          title: srvTitle,
          description: srvDesc,
          deliveryDays: srvDays,
          price: srvPrice,
          niche: srvNiche,
          includesRawFiles: srvRaw,
          revisionCount: srvRevisions
        })
      });

      if (res.ok) {
        setSrvTitle('');
        setSrvDesc('');
        setShowPostServiceForm(false);
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookService = async (serviceId: string) => {
    try {
      const res = await fetch('/api/collab/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          hirerId: currentUserId,
          hirerName: currentUserName,
          hirerAvatar: currentUserAvatar
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.collaboration) {
          setSelectedCollabId(data.collaboration.id);
        }
        setSubTab('contracts');
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignContract = async (collabId: string, role: 'hirer' | 'provider') => {
    try {
      const res = await fetch('/api/collab/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collabId, role })
      });
      if (res.ok) {
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFundMilestone = async (collabId: string, milestoneId: string) => {
    try {
      const res = await fetch('/api/collab/milestone/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collabId, milestoneId })
      });
      if (res.ok) {
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitMilestone = async (collabId: string, milestoneId: string) => {
    // Generate a beautiful generic mock video for deliverables
    const mockVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-woman-holding-perfume-bottle-in-a-aesthetic-way-40010-large.mp4"
    ];
    const pickedVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)];

    try {
      const res = await fetch('/api/collab/milestone/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collabId, milestoneId, deliverableUrl: pickedVideo })
      });
      if (res.ok) {
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveMilestone = async (collabId: string, milestoneId: string) => {
    try {
      const res = await fetch('/api/collab/milestone/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collabId, milestoneId })
      });
      if (res.ok) {
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFrameComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameText || !activeCollab) return;

    try {
      const res = await fetch('/api/collab/feedback/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collabId: activeCollab.id,
          timestamp: videoPlayTime,
          milliseconds: videoPlayMs,
          commenterName: currentUserName,
          commenterAvatar: currentUserAvatar,
          text: frameText
        })
      });
      if (res.ok) {
        setFrameText('');
        refreshState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="collab_hub_container" className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('gigs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
              subTab === 'gigs' 
                ? `${bgLight} ${accentText} border border-current` 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            💼 {isRtl ? "لوحة الطلبات الحرة" : "Gigs Board"}
          </button>
          <button
            onClick={() => setSubTab('services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
              subTab === 'services' 
                ? `${bgLight} ${accentText} border border-current` 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            ⚡ {isRtl ? "دليل حزم الخدمات" : "Services Catalog"}
          </button>
          <button
            onClick={() => setSubTab('contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors relative ${
              subTab === 'contracts' 
                ? `${bgLight} ${accentText} border border-current` 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            📋 {isRtl ? "عقود التعاون" : "Active Contracts"}
            {myContracts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {myContracts.length}
              </span>
            )}
          </button>
        </div>

        {/* Action button */}
        {subTab === 'gigs' && (
          <button
            onClick={() => setShowPostGigForm(!showPostGigForm)}
            className={`${accentClass} text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? "نشر طلب عمل جديد" : "Post a Gig"}</span>
          </button>
        )}

        {subTab === 'services' && currentUserType === 'creator' && (
          <button
            onClick={() => setShowPostServiceForm(!showPostServiceForm)}
            className={`${accentClass} text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? "أضف حزمة خدمة جديدة" : "List a Service"}</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: GIGS BOARD */}
      {subTab === 'gigs' && (
        <div className="space-y-6">
          
          {/* Post Gig Inline Form */}
          {showPostGigForm && (
            <form onSubmit={handleCreateGig} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-md space-y-4 animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider">{isRtl ? "نشر طلب عمل جديد لمجتمع الصناع والوكالات" : "Post a Collaborative Gig Offer"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Gig Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arabic Video Editor for TikToks"
                    value={gigTitle}
                    onChange={(e) => setGigTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Role Needed</label>
                  <select
                    value={gigRole}
                    onChange={(e) => setGigRole(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="editor">Video Editor</option>
                    <option value="scriptwriter">Scriptwriter</option>
                    <option value="translator">Translator</option>
                    <option value="model">Actor/Model/Co-Creator</option>
                    <option value="other">Other Collaboration</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Milestone Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={gigBudget}
                    onChange={(e) => setGigBudget(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Description & Scope</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the deliverables, video references, and dialect requirements..."
                  value={gigDesc}
                  onChange={(e) => setGigDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Target Country</label>
                  <input
                    type="text"
                    placeholder="e.g. KSA, UAE, Egypt"
                    value={gigCountry}
                    onChange={(e) => setGigCountry(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Aesthetic Dialect (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Riyadh Khaliji, Fusha, Egyptian"
                    value={gigDialect}
                    onChange={(e) => setGigDialect(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Requirements Checklist (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="Fluent in Khaliji dialect&#10;Deliver raw footage in 4K&#10;Dynamic subtitles"
                  value={gigReqs}
                  onChange={(e) => setGigReqs(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPostGigForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${accentClass} px-4 py-2 text-xs font-black rounded-xl`}
                >
                  Publish Gig Brief
                </button>
              </div>
            </form>
          )}

          {/* Gigs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-8 rounded-2xl text-center">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active freelance gig matches found. Try creating one!</p>
              </div>
            ) : (
              gigs.map((gig) => {
                const alreadyApplied = collaborations.some(c => c.gigId === gig.id && (c.providerId === currentUserId || c.hirerId === currentUserId));
                const isOwnGig = gig.posterId === currentUserId;

                return (
                  <div key={gig.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-zinc-750 transition-all">
                    <div>
                      {/* Gig Poster info */}
                      <div className="flex items-center gap-2 mb-3">
                        {gig.posterAvatar.length === 1 ? (
                          <div className="w-7 h-7 bg-orange-500/10 text-orange-500 font-bold rounded-full flex items-center justify-center text-xs">
                            {gig.posterAvatar}
                          </div>
                        ) : (
                          <img src={gig.posterAvatar} className="w-7 h-7 rounded-full object-cover" />
                        )}
                        <div>
                          <span className="text-[10px] font-black text-slate-800 dark:text-zinc-200 block">{gig.posterName}</span>
                          <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400 block">
                            {gig.posterType === 'brand' ? 'Agency/Brand' : 'Creator Collaborator'}
                          </span>
                        </div>
                      </div>

                      {/* Header and tag */}
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-2">
                        {gig.role.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2 line-clamp-2">{gig.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-3">{gig.description}</p>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-400 font-medium mb-3 border-t border-slate-100 dark:border-zinc-800 pt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {gig.country}
                        </span>
                        {gig.dialect && (
                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded">
                            💬 {gig.dialect}
                          </span>
                        )}
                      </div>

                      {/* Requirements */}
                      {gig.requirements && gig.requirements.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[8px] text-slate-400 uppercase font-mono block mb-1">Requirements:</span>
                          <ul className="space-y-0.5">
                            {gig.requirements.slice(0, 2).map((req, i) => (
                              <li key={i} className="text-[10px] text-slate-600 dark:text-zinc-300 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" /> {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer price & apply */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase block font-mono">Guaranteed Escrow</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">${gig.budget}</span>
                      </div>

                      {isOwnGig ? (
                        <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2.5 py-1 rounded-lg">
                          Your Gig Posting ({gig.applicantCount} applicants)
                        </span>
                      ) : alreadyApplied ? (
                        <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Handshake Created
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyToGig(gig.id)}
                          className={`${accentClass} text-[10px] font-black px-3.5 py-1.5 rounded-lg shadow-sm`}
                        >
                          Pitch & Contract
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SERVICES CATALOG */}
      {subTab === 'services' && (
        <div className="space-y-6">
          
          {/* List Service Form */}
          {showPostServiceForm && currentUserType === 'creator' && (
            <form onSubmit={handleCreateService} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-md space-y-4 animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider">{isRtl ? "عرض حزمة خدمة جديدة في الدليل" : "Create a Packaged Service Offering"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 High-Aesthetic Skincare Videos"
                    value={srvTitle}
                    onChange={(e) => setSrvTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Package Price ($)</label>
                  <input
                    type="number"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Delivery Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={srvDays}
                    onChange={(e) => setSrvDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Detailed Description of Package Scope</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what is included (raw outtakes, editing, captions, hooks, revisions)..."
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Niche/Category</label>
                  <input
                    type="text"
                    value={srvNiche}
                    onChange={(e) => setSrvNiche(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Included Revisions</label>
                  <input
                    type="number"
                    value={srvRevisions}
                    onChange={(e) => setSrvRevisions(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
                <div className="flex items-center h-full pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={srvRaw}
                      onChange={(e) => setSrvRaw(e.target.checked)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span>Includes Raw Video Outtakes</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPostServiceForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${accentClass} px-4 py-2 text-xs font-black rounded-xl`}
                >
                  Publish Service Package
                </button>
              </div>
            </form>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => {
              const isOwnService = srv.creatorId === currentUserId;

              return (
                <div key={srv.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-slate-350 dark:hover:border-zinc-750 flex flex-col justify-between transition-all">
                  <div>
                    {/* Creator avatar and header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img src={srv.creatorAvatar} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">{srv.creatorName}</span>
                        <span className="text-[9px] bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.2 rounded font-bold">{srv.niche}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2 leading-tight">{srv.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{srv.description}</p>

                    {/* Features checklist */}
                    <div className="space-y-1 mb-4 border-t border-slate-100 dark:border-zinc-850 pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-300">
                        <span>🕒 Delivery Time:</span>
                        <span className="font-bold">{srv.deliveryDays} Days</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-300">
                        <span>🔄 Revisions Included:</span>
                        <span className="font-bold">{srv.revisionCount} Rounds</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-300">
                        <span>📁 Raw Deliverables:</span>
                        <span className="font-bold">{srv.includesRawFiles ? "Included (FREE)" : "Edited Only"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850 pt-3 mt-3">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase font-mono block">Commission Free Direct</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">${srv.price}</span>
                    </div>

                    {isOwnService ? (
                      <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2.5 py-1 rounded-lg">
                        Your Package Offering
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBookService(srv.id)}
                        className={`${accentClass} text-[10px] font-black px-4 py-2 rounded-lg shadow-sm`}
                      >
                        Book Package Instantly
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: CONTRACTS WORKSPACE */}
      {subTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Contracts List */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">My Collaborative Workspaces</h3>
            {myContracts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No active matching contracts. Apply to a gig or book a service to start!</p>
            ) : (
              myContracts.map((contract) => {
                const isActive = contract.id === selectedCollabId;
                const roleTag = contract.hirerId === currentUserId ? 'HIRER (Client)' : 'PROVIDER (Talent)';
                
                return (
                  <button
                    key={contract.id}
                    onClick={() => setSelectedCollabId(contract.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isActive 
                        ? `${borderClass} ${bgLight} shadow-sm` 
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="text-[8px] font-black font-mono uppercase bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                        {roleTag}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        contract.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        contract.status === 'active' ? 'bg-indigo-500/10 text-indigo-500' :
                        contract.status === 'in_review' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {contract.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 mt-1">{contract.title}</h4>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {contract.hirerId === currentUserId ? `Partner: ${contract.providerName}` : `Client: ${contract.hirerName}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold mt-2 pt-2 border-t border-slate-100 dark:border-zinc-850/50">
                      <span>Direct Contract Budget:</span>
                      <span>${contract.totalPrice}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Work Area / Milestone contract review */}
          <div className="lg:col-span-2">
            {!activeCollab ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 italic">Select a collaboration contract workspace on the left to manage agreements, escrow fundings, and deliverables.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
                
                {/* Contract Workspace Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-850 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{activeCollab.title}</h3>
                    <p className="text-xs text-slate-400">Handshake workspace ID: {activeCollab.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono">Commission-Free Contract</span>
                    <span className="bg-emerald-500/10 text-emerald-500 text-xs font-black px-2.5 py-1 rounded-lg">
                      100% Rate Retained
                    </span>
                  </div>
                </div>

                {/* Contract Parties & Sign status */}
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-3.5">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">Milestone Contract Handshake Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 border-r border-slate-200 dark:border-zinc-850 pr-4">
                      <img src={activeCollab.hirerAvatar} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-zinc-200 block">{activeCollab.hirerName}</span>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono">Hirer / Client</span>
                        <span className={`text-[9px] font-bold flex items-center gap-1 mt-0.5 ${
                          activeCollab.contractSignedHirer ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {activeCollab.contractSignedHirer ? "✓ Digitally Signed" : "⏳ Awaiting Signature"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={activeCollab.providerAvatar} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-zinc-200 block">{activeCollab.providerName}</span>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono">Provider / Talent</span>
                        <span className={`text-[9px] font-bold flex items-center gap-1 mt-0.5 ${
                          activeCollab.contractSignedProvider ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {activeCollab.contractSignedProvider ? "✓ Digitally Signed" : "⏳ Awaiting Signature"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Actions */}
                  {activeCollab.status === 'draft' && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-850 flex justify-between items-center bg-violet-500/5 p-3 rounded-lg">
                      <span className="text-[10px] text-slate-500">
                        {isRtl 
                          ? "العقد في حالة مسودة بانتظار توقيع الطرفين على البنود والمعالم." 
                          : "Contract is in Draft. Both parties must sign before funded work can begin."}
                      </span>
                      
                      {activeCollab.hirerId === currentUserId && !activeCollab.contractSignedHirer && (
                        <button
                          onClick={() => handleSignContract(activeCollab.id, 'hirer')}
                          className="bg-black hover:bg-zinc-800 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg shadow cursor-pointer"
                        >
                          Sign Contract & Approve Milestones
                        </button>
                      )}

                      {activeCollab.providerId === currentUserId && !activeCollab.contractSignedProvider && (
                        <button
                          onClick={() => handleSignContract(activeCollab.id, 'provider')}
                          className="bg-black hover:bg-zinc-800 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg shadow cursor-pointer"
                        >
                          Sign Contract & Guarantee Terms
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Milestone List & Escrow Control (B2B direct payment - Section 1) */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">Escrow Milestone Schedule</h4>
                  <div className="space-y-3">
                    {activeCollab.milestones.map((ms, index) => {
                      const isHirer = activeCollab.hirerId === currentUserId;
                      const isProvider = activeCollab.providerId === currentUserId;

                      return (
                        <div key={ms.id} className="border border-slate-100 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 shadow-inner">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 bg-slate-100 dark:bg-zinc-800 text-[10px] font-black rounded-full flex items-center justify-center text-slate-500">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-xs font-black text-slate-800 dark:text-zinc-200 block">{ms.title}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  ms.status === 'released' ? 'bg-emerald-500/10 text-emerald-500' :
                                  ms.status === 'submitted' ? 'bg-amber-500/10 text-amber-500' :
                                  ms.status === 'funded' ? 'bg-indigo-500/10 text-indigo-500' :
                                  'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                }`}>
                                  {ms.status}
                                </span>
                                <span className="text-[10px] font-black text-slate-900 dark:text-white">${ms.amount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Milestone Action Buttons */}
                          <div className="flex items-center gap-2 justify-end">
                            
                            {/* Funding (Client side) */}
                            {isHirer && ms.status === 'pending' && activeCollab.status !== 'draft' && (
                              <button
                                onClick={() => handleFundMilestone(activeCollab.id, ms.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Fund Escrow (${ms.amount})</span>
                              </button>
                            )}

                            {/* Deliverable submission (Talent side) */}
                            {isProvider && ms.status === 'funded' && (
                              <button
                                onClick={() => handleSubmitMilestone(activeCollab.id, ms.id)}
                                className={`${accentClass} font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow cursor-pointer`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Submit Deliverable Video</span>
                              </button>
                            )}

                            {/* Approval/Release (Client side) */}
                            {isHirer && ms.status === 'submitted' && (
                              <button
                                onClick={() => handleApproveMilestone(activeCollab.id, ms.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Release Escrow</span>
                              </button>
                            )}

                            {/* View completed download */}
                            {ms.status === 'released' && ms.deliverableUrl && (
                              <a
                                href={ms.deliverableUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline text-[10px] font-bold flex items-center gap-1"
                              >
                                Download Asset <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frame-by-Frame timestamp feedback panel (Spotless Pay Workspace - Section 1) */}
                {activeCollab.draftVideoUrl && (
                  <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-zinc-850 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Video className={`w-4.5 h-4.5 ${accentText}`} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                          Frame-by-Frame Timestamp Feedback
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono bg-violet-600/10 text-violet-600 dark:text-violet-400 font-black px-2 py-0.5 rounded">
                        Active Draft V1 Review
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Interactive Video Player */}
                      <div className="space-y-2">
                        <video
                          ref={videoRef}
                          src={activeCollab.draftVideoUrl}
                          controls
                          onTimeUpdate={handleTimeUpdate}
                          className="w-full h-44 object-cover rounded-xl border border-slate-300 dark:border-zinc-800 bg-black shadow"
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                          <span>Timeline Stamp:</span>
                          <span className={`font-black ${accentText}`}>{videoPlayTime}</span>
                        </div>
                      </div>

                      {/* Comments & Annotation list */}
                      <div className="flex flex-col justify-between h-44">
                        <div className="overflow-y-auto space-y-2 max-h-32 pr-1">
                          {(!activeCollab.draftVideoComments || activeCollab.draftVideoComments.length === 0) ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-6">
                              No frame feedback annotations. Scrub/play the video, pick a time, and add comments below!
                            </p>
                          ) : (
                            activeCollab.draftVideoComments.map((com) => (
                              <div key={com.id} className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 p-2 rounded-lg text-[10.5px]">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-800 dark:text-zinc-200">{com.commenterName}</span>
                                  
                                  {/* Seek to timestamp button */}
                                  <button
                                    onClick={() => seekToTime(com.timestamp)}
                                    className={`${accentText} bg-slate-100 dark:bg-zinc-950 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono flex items-center gap-0.5 cursor-pointer`}
                                  >
                                    <Clock className="w-2.5 h-2.5" /> {com.timestamp}
                                  </button>
                                </div>
                                <p className="text-slate-600 dark:text-zinc-300 leading-snug">{com.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Submit annotation comment */}
                        <form onSubmit={handleAddFrameComment} className="flex gap-1 pt-2 border-t border-slate-100 dark:border-zinc-850">
                          <input
                            type="text"
                            required
                            placeholder={`Type frame feedback for stamp ${videoPlayTime}...`}
                            value={frameText}
                            onChange={(e) => setFrameText(e.target.value)}
                            className="flex-1 text-[10.5px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className={`${accentClass} p-1.5 rounded-lg`}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>

                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
