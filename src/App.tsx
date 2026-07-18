import { useState, useEffect } from 'react';
import { 
  AppState, 
  AppLanguage, 
  UserRole, 
  ActiveProject,
  CampaignBrief,
  CreatorProfile
} from './types.js';
import AuthScreen from './components/AuthScreen.js';
import OnboardingCarousel from './components/OnboardingCarousel.js';
import Header from './components/Header.js';
import CreatorView from './components/CreatorView.js';
import BrandView from './components/BrandView.js';
import AdminView from './components/AdminView.js';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  // Global App States
  const [lang, setLang] = useState<AppLanguage>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('brand');
  const [currentUser, setCurrentUser] = useState<{ email: string; role: UserRole } | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [state, setState] = useState<AppState | null>(null);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isRtl = lang === 'ar';

  // Fetch complete dbState from custom Express backend
  const fetchState = async () => {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        setState(data);
      } else {
        showToast('Failed to fetch platform state', 'error');
      }
    } catch (err) {
      console.error("Error communicating with Express backend:", err);
      showToast('Offline mode or server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Reset demo back to baseline seeds
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (response.ok) {
        showToast(isRtl ? 'تمت إعادة ضبط قاعدة البيانات بنجاح' : 'Platform seed reset successful!', 'success');
        await fetchState();
      } else {
        showToast('Reset failed', 'error');
      }
    } catch (err) {
      showToast('Error resetting database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Authenticate user & pick role
  const handleAuthSubmit = async (email: string, role: UserRole) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ email: data.email, role: data.role });
        setCurrentRole(data.role);
        
        // Auto check if this email already passed onboarding
        const completedBefore = localStorage.getItem(`onboard_${email}`);
        setOnboardingCompleted(!!completedBefore);

        showToast(isRtl ? 'تم تسجيل الدخول بنجاح' : `Logged in as ${data.role}!`, 'success');
        await fetchState();
      } else {
        showToast('Authentication error', 'error');
      }
    } catch (e) {
      showToast('Network error on auth', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    setCurrentUser(null);
    setOnboardingCompleted(false);
    showToast(isRtl ? 'تم تسجيل الخروج' : 'Signed out successfully', 'info');
  };

  // Completed swiping onboarding walkthrough (Section 5)
  const handleOnboardingComplete = () => {
    if (currentUser) {
      localStorage.setItem(`onboard_${currentUser.email}`, 'true');
    }
    setOnboardingCompleted(true);
    showToast(isRtl ? 'مستعدون للانطلاق!' : 'Onboarding verified. Welcome to UGC GULF!', 'success');
  };

  // --- CREATOR ACTIONS ---
  const handleCreatorApply = async (campaignId: string, pitchNote: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/projects/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: currentUser.role === 'creator' ? 'creator_sofia' : 'creator_ahmed', // pick Sofia as core mockup creator
          campaignId,
          pitchNote
        })
      });
      if (response.ok) {
        showToast(isRtl ? 'تم تقديم عرضك بنجاح وحجز الضمان للعلامة التجارية' : 'Pitch submitted! Campaign active workspace created.', 'success');
        await fetchState();
      } else {
        const errData = await response.json();
        showToast(errData.error || 'Apply failed', 'error');
      }
    } catch (e) {
      showToast('Network error applying', 'error');
    }
  };

  const handleCreatorSubmitDraft = async (projectId: string, videoUrl: string, notes: string) => {
    try {
      const response = await fetch('/api/projects/submit-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, videoUrl, notes })
      });
      if (response.ok) {
        showToast(isRtl ? 'تم رفع مسودة الفيديو بنجاح للمراجعة' : 'Video draft V1 uploaded! Awaiting brand review.', 'success');
        await fetchState();
      } else {
        showToast('Draft upload failed', 'error');
      }
    } catch (e) {
      showToast('Network error on submit', 'error');
    }
  };

  const handleCreatorInitiateDispute = async (projectId: string, reason: string) => {
    try {
      const response = await fetch('/api/projects/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, reason })
      });
      if (response.ok) {
        showToast(isRtl ? 'تم رفع النزاع للمسؤولين. تم تجميد الضمان.' : 'Dispute filed. Escrow locked for admin review.', 'info');
        await fetchState();
      } else {
        showToast('Failed to open dispute', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  // --- BRAND ACTIONS ---
  const handleBrandPostCampaign = async (campaignData: any) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (response.ok) {
        showToast(isRtl ? 'تم إطلاق الحملة بنجاح وحجز الضمان بـ Spotless Pay' : 'UGC Campaign published! Spotless Pay Escrow funded.', 'success');
        await fetchState();
      } else {
        showToast('Failed to post campaign', 'error');
      }
    } catch (e) {
      showToast('Network error posting campaign', 'error');
    }
  };

  const handleBrandAcceptApplication = async (projectId: string) => {
    try {
      const response = await fetch('/api/projects/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (response.ok) {
        showToast(isRtl ? 'تم قبول العرض! تم قفل الضمان وتوليد كود تتبع الشحن' : 'Creator hired! Escrow locked. Aramex shipment scheduled.', 'success');
        await fetchState();
      } else {
        showToast('Failed to hire creator', 'error');
      }
    } catch (e) {
      showToast('Network error hiring creator', 'error');
    }
  };

  const handleBrandRequestRevision = async (projectId: string, commentText: string) => {
    try {
      const response = await fetch('/api/projects/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, commentText })
      });
      if (response.ok) {
        showToast(isRtl ? 'تم طلب التعديل بنجاح' : 'Revision feedback sent to creator!', 'success');
        await fetchState();
      } else {
        showToast('Failed requesting revision', 'error');
      }
    } catch (e) {
      showToast('Network error sending revision', 'error');
    }
  };

  const handleBrandApproveRelease = async (projectId: string) => {
    try {
      const response = await fetch('/api/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (response.ok) {
        showToast(isRtl ? 'تمت الموافقة! تم الإفراج عن رصيد الضمان فوراً لصانع المحتوى' : 'Approved! Deliverable licensed. Payout released from escrow.', 'success');
        await fetchState();
      } else {
        showToast('Approval release failed', 'error');
      }
    } catch (e) {
      showToast('Network error on release', 'error');
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAdminApproveCreator = async (creatorId: string) => {
    try {
      const response = await fetch('/api/admin/vetting/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      });
      if (response.ok) {
        showToast('Creator account approved & verified!', 'success');
        await fetchState();
      } else {
        showToast('Approve failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleAdminRejectCreator = async (creatorId: string) => {
    try {
      const response = await fetch('/api/admin/vetting/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      });
      if (response.ok) {
        showToast('Creator registration deleted', 'info');
        await fetchState();
      } else {
        showToast('Reject failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleAdminResolveDispute = async (projectId: string, resolution: 'creator' | 'brand' | 'split') => {
    try {
      const response = await fetch('/api/projects/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, resolution })
      });
      if (response.ok) {
        showToast(`Dispute resolved. Funds disbursed to ${resolution}.`, 'success');
        await fetchState();
      } else {
        showToast('Failed to resolve dispute', 'error');
      }
    } catch (e) {
      showToast('Network error resolving dispute', 'error');
    }
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <span className="text-sm font-bold tracking-widest uppercase">
          Initializing UGC GULF Market Engine...
        </span>
      </div>
    );
  }

  // Auth Routing
  if (!currentUser) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <AuthScreen 
          lang={lang} 
          setLang={setLang} 
          onAuthComplete={handleAuthSubmit} 
        />
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-zinc-800 text-white rounded-lg p-3.5 shadow-xl text-xs max-w-sm font-bold flex items-center gap-2">
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    );
  }

  // Swipeable onboarding carousel walkthrough (Section 5)
  if (!onboardingCompleted) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <OnboardingCarousel 
            lang={lang} 
            onComplete={handleOnboardingComplete} 
          />
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-slate-900 dark:text-zinc-150 transition-colors duration-300 pb-16">
      
      {/* Universal header for simulation */}
      <Header
        lang={lang}
        setLang={setLang}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        userEmail={currentUser.email}
        onSignOut={handleSignOut}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Role Simulator Header Disclaimer (Section 3) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 leading-normal">
            <span className="inline-flex w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>
              {isRtl 
                ? `محاكاة النشاط جارية. أنت تسجل الدخول بـ ${currentUser.email}. استخدم أزرار شريط المحاكاة للتنقل بين الأدوار وتجربة دورة العمل بالكامل.`
                : `Interactive Simulator active. Signed in as ${currentUser.email}. Use the simulation switches to alternate dashboards and test the contract flows.`
              }
            </span>
          </p>
          <span className="text-[9px] font-mono text-white bg-slate-900 dark:text-slate-950 dark:bg-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {currentRole.toUpperCase()} DASHBOARD
          </span>
        </div>
      </div>

      {/* Main View router */}
      <main className="mt-2">
        {currentRole === 'creator' && (
          <CreatorView
            state={state}
            lang={lang}
            creatorId="creator_sofia" // Default demo creator Sofia
            onApply={handleCreatorApply}
            onSubmitDraft={handleCreatorSubmitDraft}
            onDispute={handleCreatorInitiateDispute}
            refreshState={fetchState}
          />
        )}

        {currentRole === 'brand' && (
          <BrandView
            state={state}
            lang={lang}
            brandId="brand_novaskin" // Default demo brand NovaSkin Co
            onPostCampaign={handleBrandPostCampaign}
            onAcceptApplication={handleBrandAcceptApplication}
            onRequestRevision={handleBrandRequestRevision}
            onApproveDeliverable={handleBrandApproveRelease}
            onDispute={handleCreatorInitiateDispute}
            refreshState={fetchState}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            state={state}
            lang={lang}
            onApproveCreator={handleAdminApproveCreator}
            onRejectCreator={handleAdminRejectCreator}
            onResolveDispute={handleAdminResolveDispute}
            refreshState={fetchState}
          />
        )}
      </main>

      {/* Toast Alert Messaging Overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-950 border border-zinc-850 text-white rounded-xl p-4 shadow-2xl text-xs max-w-sm font-bold flex items-center gap-2 animate-fade-in">
          <span className="text-emerald-500">🛡️</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

    </div>
  );
}
