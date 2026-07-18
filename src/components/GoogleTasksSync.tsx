import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  googleSignOut, 
  initAuth 
} from '../lib/googleAuth.js';
import { 
  listTaskLists, 
  createTaskList, 
  listTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  GoogleTaskList, 
  GoogleTask 
} from '../lib/googleTasksService.js';
import { AppState, UserRole } from '../types.js';
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
  ListTodo
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleTasksSyncProps {
  state: AppState;
  currentRole: UserRole;
  userEmail: string;
  isRtl: boolean;
  accentColor?: string;
}

export default function GoogleTasksSync({
  state,
  currentRole,
  userEmail,
  isRtl,
  accentColor = 'emerald'
}: GoogleTasksSyncProps) {
  // Authentication state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Tasks API state
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // UI state
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync Confirmation Modals
  const [confirmModal, setConfirmModal] = useState<{
    type: 'create_list' | 'create_task' | 'sync_campaign' | 'sync_project' | 'delete_task' | 'complete_task';
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Init Auth on Load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Load Task Lists once authenticated
  useEffect(() => {
    if (accessToken) {
      loadTaskLists();
    }
  }, [accessToken]);

  // Load Tasks once list is selected
  useEffect(() => {
    if (accessToken && selectedListId) {
      loadTasks(selectedListId);
    } else {
      setTasks([]);
    }
  }, [accessToken, selectedListId]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const loadTaskLists = async () => {
    if (!accessToken) return;
    setIsLoadingLists(true);
    setErrorMsg(null);
    try {
      const lists = await listTaskLists(accessToken);
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        // Auto-select first or look for a UGC GULF list
        const ugcList = lists.find(l => l.title.includes('UGC GULF') || l.title.includes('UGC'));
        setSelectedListId(ugcList ? ugcList.id : lists[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isRtl ? 'فشل تحميل قوائم المهام' : 'Failed to load Google Task lists.');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadTasks = async (listId: string) => {
    if (!accessToken) return;
    setIsLoadingTasks(true);
    setErrorMsg(null);
    try {
      const items = await listTasks(accessToken, listId);
      setTasks(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isRtl ? 'فشل تحميل المهام' : 'Failed to load tasks for this list.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        showToast(
          isRtl ? 'تم الاتصال بحساب Google بنجاح!' : 'Google Tasks integration connected successfully!',
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isRtl ? 'فشل الاتصال بحساب Google' : 'Failed to connect your Google Account.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
      setTaskLists([]);
      setTasks([]);
      setSelectedListId('');
      showToast(isRtl ? 'تم فصل حساب Google' : 'Google Account disconnected.', 'success');
    } catch (err) {
      showToast('Error signing out', 'error');
    }
  };

  const triggerCreateTaskList = () => {
    if (!newListName.trim()) return;
    
    // Explicit user confirmation before mutation
    setConfirmModal({
      type: 'create_list',
      title: isRtl ? 'إنشاء قائمة مهام جديدة' : 'Create New Task List',
      description: isRtl 
        ? `هل تريد بالتأكيد إنشاء قائمة مهام جديدة باسم "${newListName}" في حسابك على Google؟`
        : `Are you sure you want to create a new task list named "${newListName}" in your Google Tasks account?`,
      onConfirm: async () => {
        if (!accessToken) return;
        setIsCreatingList(true);
        try {
          const newList = await createTaskList(accessToken, newListName.trim());
          setTaskLists(prev => [...prev, newList]);
          setSelectedListId(newList.id);
          setNewListName('');
          showToast(
            isRtl ? `تم إنشاء القائمة "${newList.title}"` : `Task list "${newList.title}" created!`,
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to create list', 'error');
        } finally {
          setIsCreatingList(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const triggerCreateManualTask = () => {
    if (!newTaskTitle.trim()) return;

    setConfirmModal({
      type: 'create_task',
      title: isRtl ? 'إضافة مهمة جديدة' : 'Add New Task',
      description: isRtl 
        ? `هل تريد بالتأكيد إضافة المهمة "${newTaskTitle}" إلى قائمة Google Tasks المحددة؟`
        : `Are you sure you want to add the task "${newTaskTitle}" to your selected Google Task list?`,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        setIsCreatingTask(true);
        try {
          const taskObj: any = { title: newTaskTitle.trim() };
          if (newTaskNotes.trim()) taskObj.notes = newTaskNotes.trim();
          if (newTaskDue) {
            // Google Tasks expects due date in RFC 3339 format (YYYY-MM-DDTHH:MM:SS.SSSZ)
            taskObj.due = new Date(newTaskDue).toISOString();
          }

          const created = await createTask(accessToken, selectedListId, taskObj);
          setTasks(prev => [created, ...prev]);
          setNewTaskTitle('');
          setNewTaskNotes('');
          setNewTaskDue('');
          showToast(
            isRtl ? 'تمت إضافة المهمة بنجاح!' : 'Task added successfully to Google Tasks!',
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to create task', 'error');
        } finally {
          setIsCreatingTask(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const triggerToggleTask = (task: GoogleTask) => {
    const nextStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    const actionText = nextStatus === 'completed' 
      ? (isRtl ? 'إكمال' : 'Complete') 
      : (isRtl ? 'إعادة تنشيط' : 'Re-open');

    setConfirmModal({
      type: 'complete_task',
      title: isRtl ? 'تحديث حالة المهمة' : 'Update Task Status',
      description: isRtl 
        ? `هل تريد بالتأكيد ${actionText} المهمة "${task.title}" في Google Tasks؟`
        : `Are you sure you want to mark "${task.title}" as ${nextStatus}? This will sync directly back to your Google Tasks.`,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        try {
          const updated = await updateTask(accessToken, selectedListId, task.id, {
            status: nextStatus
          });
          setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
          showToast(
            isRtl ? 'تم تحديث حالة المهمة بنجاح' : 'Task status updated!',
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to update task status', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const triggerDeleteTask = (taskId: string, title: string) => {
    setConfirmModal({
      type: 'delete_task',
      title: isRtl ? 'حذف المهمة' : 'Delete Task',
      description: isRtl 
        ? `هل أنت متأكد من حذف المهمة "${title}" نهائياً من Google Tasks؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to permanently delete "${title}" from your Google Tasks? This action cannot be undone.`,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        try {
          await deleteTask(accessToken, selectedListId, taskId);
          setTasks(prev => prev.filter(t => t.id !== taskId));
          showToast(
            isRtl ? 'تم حذف المهمة بنجاح' : 'Task deleted successfully from Google Tasks.',
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to delete task', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // Sync a Campaign from local app state to Google Tasks
  const syncCampaignToTasks = (campaign: any) => {
    setConfirmModal({
      type: 'sync_campaign',
      title: isRtl ? 'مزامنة الحملة الإعلانية' : 'Sync Campaign to Google Tasks',
      description: isRtl 
        ? `هل تريد بالتأكيد تصدير ومزامنة الحملة "${campaign.title}" كـ مهمة جديدة في Google Tasks؟`
        : `Do you want to sync the campaign "${campaign.title}" to Google Tasks? It will set a task with a due date of ${campaign.deadline} and include briefs and references in the notes.`,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        setIsCreatingTask(true);
        try {
          const notesText = `🏆 [UGC GULF Campaign Brief]\nProduct: ${campaign.productName}\nCategory: ${campaign.category}\nBudget: $${campaign.budgetPerCreator} per creator\n\n📝 Brief Description:\n${campaign.description}\n\n🎬 Script Hook:\n${campaign.scriptText || 'None'}\n\n🎯 Target Demographics: ${campaign.targetDemographics?.gender || 'All'} (${campaign.targetDemographics?.ageRange || 'All'})\n🔗 Platform URL: ${window.location.origin}`;
          
          const taskObj = {
            title: `[UGC Campaign] ${campaign.title}`,
            notes: notesText,
            due: campaign.deadline ? new Date(campaign.deadline).toISOString() : undefined
          };

          const created = await createTask(accessToken, selectedListId, taskObj);
          setTasks(prev => [created, ...prev]);
          showToast(
            isRtl ? 'تم مزامنة الحملة الإعلانية بنجاح!' : 'Campaign synced successfully to Google Tasks!',
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to sync campaign', 'error');
        } finally {
          setIsCreatingTask(false);
          setConfirmModal(null);
        }
      }
    });
  };

  // Sync a Project from local app state to Google Tasks
  const syncProjectToTasks = (project: any) => {
    setConfirmModal({
      type: 'sync_project',
      title: isRtl ? 'مزامنة مشروع التعاون' : 'Sync Collaboration Project',
      description: isRtl 
        ? `هل تريد تصدير مشروع "${project.campaignTitle}" ومزامنته في حساب Google Tasks الخاص بك؟`
        : `Do you want to sync the project "${project.campaignTitle}" (with Creator: ${project.creatorName}) to Google Tasks? It will schedule a reminder due on ${project.dueDate} with current status & notes.`,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        setIsCreatingTask(true);
        try {
          const notesText = `🎬 [UGC GULF Collaboration Project]\nCampaign: ${project.campaignTitle}\nBrand: ${project.brandName}\nCreator: ${project.creatorName} (${project.creatorHandle})\nStatus: ${project.status.toUpperCase()}\nEscrow: ${project.escrowStatus.toUpperCase()} ($${project.amountHeld})\nDue Date: ${project.dueDate}\nTracking: ${project.trackingNumber || 'No tracking yet'}\n\nPitch Note: "${project.pitchNote || 'N/A'}"\n\n🔗 Dashboard Link: ${window.location.origin}`;

          const taskObj = {
            title: `[UGC Collab] ${project.campaignTitle} - ${project.creatorName}`,
            notes: notesText,
            due: project.dueDate ? new Date(project.dueDate).toISOString() : undefined
          };

          const created = await createTask(accessToken, selectedListId, taskObj);
          setTasks(prev => [created, ...prev]);
          showToast(
            isRtl ? 'تم مزامنة المشروع بنجاح مع Google Tasks!' : 'UGC Project successfully synced to Google Tasks!',
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to sync project', 'error');
        } finally {
          setIsCreatingTask(false);
          setConfirmModal(null);
        }
      }
    });
  };

  // Determine selectable local campaigns/projects depending on role
  const localCampaigns = state.campaigns || [];
  const localProjects = state.projects || [];

  return (
    <div id="google_tasks_sync_root" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header section with brand feel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{isRtl ? 'مزامنة Google Tasks' : 'Google Tasks Integration'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-orange-500 text-white">
                Workspace Live
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl 
                ? 'اربط مهام حملاتك ومواعيد تسليمات UGC مباشرة بحساب Google الخاص بك.'
                : 'Connect campaign deadlines and UGC delivery milestones directly with your real Google account.'
              }
            </p>
          </div>
        </div>

        {/* Profile / Login Button */}
        <div>
          {needsAuth ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                  <span>{isRtl ? 'جاري الاتصال...' : 'Connecting...'}</span>
                </>
              ) : (
                <>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isRtl ? 'ربط حساب Google' : 'Connect Google Tasks'}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
              {googleUser?.photoURL ? (
                <img 
                  src={googleUser.photoURL} 
                  alt={googleUser.displayName || 'Google user'} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">
                  {googleUser?.displayName?.charAt(0) || 'G'}
                </div>
              )}
              <div className="text-left">
                <span className="text-[11px] font-bold block text-slate-800 dark:text-zinc-150 leading-tight">
                  {googleUser?.displayName || 'Connected User'}
                </span>
                <span className="text-[9px] text-slate-400 block max-w-[120px] truncate leading-none">
                  {googleUser?.email || userEmail}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title={isRtl ? 'قطع الاتصال' : 'Disconnect'}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Feedbacks */}
      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {needsAuth ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-zinc-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
          <ListTodo className="w-10 h-10 text-slate-300 dark:text-zinc-700" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {isRtl ? 'الاتصال الآمن بـ Google Tasks' : 'Connect to your Google Account'}
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm px-4 leading-normal">
            {isRtl 
              ? 'يرجى تسجيل الدخول الآمن لتفويض التطبيق بمزامنة لوحة تحكم حملاتك ومهامك مع Google Tasks الخاصة بك.'
              : 'Sign in securely with Google Auth. We will create custom tasks for your campaign briefs and deadlines with your full control.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Local Campaigns & Projects list to Sync */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>
                  {currentRole === 'brand' 
                    ? (isRtl ? 'حملاتك النشطة للتصدير' : 'Your Campaigns to Sync')
                    : (isRtl ? 'مشاريعك لتصدير مهامها' : 'Your UGC Projects to Sync')
                  }
                </span>
              </h4>
            </div>

            {currentRole === 'brand' ? (
              localCampaigns.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-slate-200/50">
                  {isRtl ? 'لا توجد حملات نشطة حالياً.' : 'No active campaigns found.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {localCampaigns.map(c => (
                    <div 
                      key={c.id} 
                      className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl hover:border-orange-500/40 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-slate-800 dark:text-zinc-150 block truncate max-w-[200px]">
                          {c.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-orange-500" />
                          <span>Deadline: {c.deadline}</span>
                          <span className="text-zinc-600">|</span>
                          <span>Budget: ${c.budgetPerCreator}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => syncCampaignToTasks(c)}
                        disabled={isCreatingTask}
                        className="flex items-center gap-1 bg-black hover:bg-orange-600 dark:bg-zinc-100 dark:hover:bg-orange-500 text-white dark:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isRtl ? 'مزامنة' : 'Sync Task'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              localProjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-slate-200/50">
                  {isRtl ? 'لا توجد مشاريع نشطة حالياً.' : 'No active UGC projects found.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {localProjects.map(p => (
                    <div 
                      key={p.id} 
                      className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl hover:border-orange-500/40 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-zinc-150 truncate max-w-[180px]">
                            {p.campaignTitle}
                          </span>
                          <span className={`text-[8px] font-bold px-1 py-0.25 rounded uppercase tracking-wider ${
                            p.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-orange-500" />
                          <span>Due: {p.dueDate}</span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-orange-500 font-bold">{p.brandName}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => syncProjectToTasks(p)}
                        disabled={isCreatingTask}
                        className="flex items-center gap-1 bg-black hover:bg-orange-600 dark:bg-zinc-100 dark:hover:bg-orange-500 text-white dark:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isRtl ? 'مزامنة' : 'Sync Task'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Right Column: Google Tasks Live List Manager */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-850 p-4 rounded-2xl space-y-4 text-xs">
            
            {/* List Selection & Refresh */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {isRtl ? 'قائمة مهام Google المحددة' : 'Active Google Task List'}
              </label>
              <div className="flex items-center gap-2">
                {isLoadingLists ? (
                  <div className="h-9 px-3 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                  </div>
                ) : (
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="h-9 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-100 font-bold flex-1 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  >
                    {taskLists.map(list => (
                      <option key={list.id} value={list.id}>{list.title}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={loadTaskLists}
                  title={isRtl ? 'تحديث القوائم' : 'Refresh Lists'}
                  className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-orange-500 rounded-xl shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Create New Task List */}
            <div className="border-t border-slate-200/50 dark:border-zinc-850 pt-3 space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {isRtl ? 'إنشاء قائمة جديدة' : 'Create New List'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isRtl ? 'أدخل اسم القائمة...' : 'E.g., UGC Campaigns...'}
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] text-slate-800 dark:text-zinc-100 flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={triggerCreateTaskList}
                  disabled={isCreatingList || !newListName.trim()}
                  className="h-8 px-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                >
                  {isCreatingList ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  <span>{isRtl ? 'إنشاء' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* Create Manual Task */}
            <div className="border-t border-slate-200/50 dark:border-zinc-850 pt-3 space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {isRtl ? 'إضافة مهمة سريعة' : 'Quick Create Task'}
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder={isRtl ? 'عنوان المهمة...' : 'E.g., Review Sofia Reyes V1 draft'}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="h-8 w-full px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="h-8 px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-[10px] text-slate-700 dark:text-zinc-300 focus:outline-none"
                  />
                  <button
                    onClick={triggerCreateManualTask}
                    disabled={isCreatingTask || !newTaskTitle.trim()}
                    className="h-8 bg-black hover:bg-orange-500 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                  >
                    {isCreatingTask ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    <span>{isRtl ? 'إضافة المهمة' : 'Add Task'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Google Tasks Feed */}
            <div className="border-t border-slate-200/50 dark:border-zinc-850 pt-3 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {isRtl ? 'المهام الحالية في Google' : 'Live Tasks List'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold bg-slate-200 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                  {tasks.length} {isRtl ? 'مهام' : 'tasks'}
                </span>
              </div>

              {isLoadingTasks ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-[10px]">{isRtl ? 'جاري التحميل من Google Tasks...' : 'Loading Google Tasks...'}</span>
                </div>
              ) : tasks.length === 0 ? (
                <p className="py-8 text-center italic text-slate-400 text-[11px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/50 dark:border-zinc-800">
                  {isRtl ? 'القائمة فارغة. ابدأ بإضافة المهام.' : 'No tasks in this list yet.'}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {tasks.map(task => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div 
                        key={task.id} 
                        className={`p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-xl flex items-start gap-2.5 transition-all ${
                          isCompleted ? 'opacity-60 bg-slate-50/50' : ''
                        }`}
                      >
                        <button
                          onClick={() => triggerToggleTask(task)}
                          className="mt-0.5 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0 text-left">
                          <span className={`font-semibold text-slate-800 dark:text-zinc-100 block truncate leading-tight text-[11px] ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}>
                            {task.title}
                          </span>
                          {task.notes && (
                            <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2 mt-0.5 select-none">
                              {task.notes}
                            </p>
                          )}
                          {task.due && (
                            <span className="text-[8.5px] font-mono text-orange-500 flex items-center gap-0.5 mt-1 font-bold">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => triggerDeleteTask(task.id, task.title)}
                          className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fade-in text-left">
            <h5 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-orange-500" />
              <span>{confirmModal.title}</span>
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isRtl ? 'تأكيد الإجراء' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
