import { useState } from 'react';
import { 
  AppState, 
  AppLanguage, 
  CreatorProfile, 
  ActiveProject 
} from '../types.js';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Scale, 
  DollarSign, 
  AlertTriangle, 
  ChevronRight, 
  Users, 
  FileText,
  UserCheck
} from 'lucide-react';

interface AdminViewProps {
  state: AppState;
  lang: AppLanguage;
  onApproveCreator: (creatorId: string) => Promise<void>;
  onRejectCreator: (creatorId: string) => Promise<void>;
  onResolveDispute: (projectId: string, resolution: 'creator' | 'brand' | 'split') => Promise<void>;
  refreshState: () => void;
}

export default function AdminView({
  state,
  lang,
  onApproveCreator,
  onRejectCreator,
  onResolveDispute,
  refreshState
}: AdminViewProps) {
  const isRtl = lang === 'ar';
  
  const [activeAdminTab, setActiveAdminTab] = useState<'vetting' | 'disputes' | 'health'>('vetting');
  const [resolutionComment, setResolutionComment] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Vetting Pending creators
  const pendingCreators = state.creators.filter(c => c.vettingStatus === 'pending_review');

  // Active Disputes
  const disputedProjects = state.projects.filter(p => p.escrowStatus === 'disputed');

  // General System Stats
  const totalEscrowSystemHeld = state.projects
    .filter(p => p.escrowStatus === 'held' || p.escrowStatus === 'disputed')
    .reduce((sum, p) => sum + p.amountHeld, 0);

  const handleCreatorVettingApprove = async (id: string) => {
    setIsActionLoading(true);
    await onApproveCreator(id);
    setIsActionLoading(false);
    refreshState();
  };

  const handleCreatorVettingReject = async (id: string) => {
    setIsActionLoading(true);
    await onRejectCreator(id);
    setIsActionLoading(false);
    refreshState();
  };

  const handleDisputeDecision = async (projectId: string, resolution: 'creator' | 'brand' | 'split') => {
    setIsActionLoading(true);
    await onResolveDispute(projectId, resolution);
    setIsActionLoading(false);
    setResolutionComment('');
    refreshState();
  };

  return (
    <div id="admin_control_desk" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-base">
              🛡️
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                UGC GULF · System Administrator Desk
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Manage Gulf creator vetting applications, arbitrate Spotless Pay disputes, and monitor transaction ledgers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 p-3 rounded-xl text-right">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono block">System Wide Escrow Held</span>
              <span className="text-lg font-black text-orange-400">${totalEscrowSystemHeld} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveAdminTab('vetting')}
          className={`py-2 px-4 text-xs font-black tracking-wide uppercase transition-colors cursor-pointer border-b-2 ${
            activeAdminTab === 'vetting'
              ? 'border-black text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            Creator Vetting Queue ({pendingCreators.length})
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('disputes')}
          className={`py-2 px-4 text-xs font-black tracking-wide uppercase transition-colors cursor-pointer border-b-2 ${
            activeAdminTab === 'disputes'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-orange-500" />
            Escrow Dispute Court ({disputedProjects.length})
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('health')}
          className={`py-2 px-4 text-xs font-black tracking-wide uppercase transition-colors cursor-pointer border-b-2 ${
            activeAdminTab === 'health'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Campaign Registry
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeAdminTab === 'vetting' && (
        <div id="admin_tab_vetting" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              UGC Creator Vetting Queue (Section 12.1)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Review and vet creator cosmetic videos & follower metrics before admitting them into the active talent directory.
            </p>

            {pendingCreators.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-dashed text-xs text-slate-400">
                🎉 All creator profiles have been vetted and processed. Vetting queue is clean!
              </div>
            ) : (
              <div className="space-y-6">
                {pendingCreators.map((item) => (
                  <div key={item.id} className="p-5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-850 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                          <span className="text-[10px] text-slate-400">{item.handle}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.bio}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-slate-400">
                          <span className="bg-white dark:bg-zinc-900 border border-slate-200 px-2 py-0.5 rounded">📍 {item.city}, {item.country}</span>
                          <span className="bg-white dark:bg-zinc-900 border border-slate-200 px-2 py-0.5 rounded">👥 followers: {(item.followerCount / 1000).toFixed(0)}k</span>
                          <span className="bg-white dark:bg-zinc-900 border border-slate-200 px-2 py-0.5 rounded">📈 level {item.lvl} ({item.exp} XP)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleCreatorVettingReject(item.id)}
                        disabled={isActionLoading}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Reject Profile
                      </button>
                      <button
                        onClick={() => handleCreatorVettingApprove(item.id)}
                        disabled={isActionLoading}
                        className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Creator Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'disputes' && (
        <div id="admin_tab_disputes" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              ⚖️ Spotless Pay Escrow Disputes Court (Section 12.2)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Arbitrate dispute filings between brands and creators. Review contract milestones, submitted video draft edits, and make final payouts.
            </p>

            {disputedProjects.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-dashed text-xs text-slate-400">
                🟢 No active escrow disputes. All transactions cleared peacefully!
              </div>
            ) : (
              <div className="space-y-6">
                {disputedProjects.map((proj) => (
                  <div key={proj.id} className="p-5 bg-slate-50 dark:bg-zinc-950 border border-rose-500/20 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-850 pb-3">
                      <div>
                        <span className="bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase px-2.5 py-1 rounded">
                          Disputed Escrow Holder: ${proj.amountHeld} USD
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{proj.campaignTitle} ({proj.brandName})</h4>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-slate-500 block">Creator:</span>
                        <span className="font-bold">{proj.creatorName} ({proj.creatorHandle})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Contract Dispute Filing Reason:</span>
                        <p className="text-slate-800 dark:text-zinc-200 font-medium italic">
                          "{proj.disputeReason || 'No dispute details provided.'}"
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Creator Deliverable Draft History:</span>
                        {proj.submissions.map((sub, i) => (
                          <div key={i} className="text-[11px] leading-tight flex items-center justify-between">
                            <span className="font-bold text-indigo-600">Draft V{sub.version}:</span>
                            <span className="text-slate-500 font-mono truncate max-w-[200px]">{sub.notes}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dispute Settlement Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-zinc-850 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-400 font-mono">
                        System Audit ID: {proj.id}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDisputeDecision(proj.id, 'brand')}
                          disabled={isActionLoading}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-sm"
                        >
                          Award 100% to Brand (Refund)
                        </button>
                        <button
                          onClick={() => handleDisputeDecision(proj.id, 'split')}
                          disabled={isActionLoading}
                          className="bg-slate-900 hover:bg-black text-white border border-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Split 50/50 Settlement
                        </button>
                        <button
                          onClick={() => handleDisputeDecision(proj.id, 'creator')}
                          disabled={isActionLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-sm"
                        >
                          Award 100% to Creator (Pay)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'health' && (
        <div id="admin_tab_health" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Campaigns & Project Registry Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50 dark:bg-zinc-950">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Campaign Title</th>
                    <th className="p-3 border-b border-slate-200">Brand</th>
                    <th className="p-3 border-b border-slate-200">Total Slot Budget</th>
                    <th className="p-3 border-b border-slate-200">Creator Hired</th>
                    <th className="p-3 border-b border-slate-200">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {state.projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-zinc-950">
                      <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">{proj.campaignTitle}</td>
                      <td className="p-3">{proj.brandName}</td>
                      <td className="p-3 font-mono">${proj.amountHeld}</td>
                      <td className="p-3">{proj.creatorName}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          proj.escrowStatus === 'held' ? 'bg-orange-500/10 text-orange-600' :
                          proj.escrowStatus === 'released' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {proj.escrowStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
