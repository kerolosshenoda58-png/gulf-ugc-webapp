import { AppLanguage, UserRole } from '../types.js';
import { Globe, RefreshCw, Shield, Sparkles, User, Building2, LogOut } from 'lucide-react';

interface HeaderProps {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  currentRole: UserRole;
  setCurrentRole: (r: UserRole) => void;
  userEmail: string;
  onSignOut: () => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export default function Header({
  lang,
  setLang,
  currentRole,
  setCurrentRole,
  userEmail,
  onSignOut,
  onResetDb,
  isResetting
}: HeaderProps) {
  const isRtl = lang === 'ar';

  return (
    <header className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-900 sticky top-0 z-40 px-4 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo and Title */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black dark:bg-zinc-100 flex items-center justify-center font-black text-white dark:text-black text-xs uppercase shadow-sm">
              GULF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tighter">
                  UGC GULF
                </span>
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  v4 Spec
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isRtl ? "توظيف وكالات الخليج ومؤثريها" : "Hire Gulf Agencies, Influence Your Brand."}
              </p>
            </div>
          </div>

          {/* Quick Language switch (Mobile) */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="sm:hidden flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300"
          >
            <Globe className="w-4 h-4 text-slate-900 dark:text-zinc-100" />
          </button>
        </div>

        {/* Middle/Right Side: Dynamic Role Switcher and Global Utilities */}
        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-end">
          
          {/* Demo Trigger - Reset DB State */}
          <button
            id="btn_reset_db"
            onClick={onResetDb}
            disabled={isResetting}
            title="Reset DB values back to pristine seed data for demo"
            className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 hover:border-orange-500/30 dark:hover:text-orange-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isRtl ? "إعادة ضبط التجربة" : "Reset Seed Data"}</span>
          </button>

          {/* Role selector widget explicitly configured to show journey transition */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
            {/* Brand Switch */}
            <button
              onClick={() => setCurrentRole('brand')}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currentRole === 'brand'
                  ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>{isRtl ? "الشركة" : "Brand"}</span>
            </button>

            {/* Creator Switch */}
            <button
              onClick={() => setCurrentRole('creator')}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currentRole === 'creator'
                  ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{isRtl ? "الصانع" : "Creator"}</span>
            </button>

            {/* Admin Switch */}
            <button
              onClick={() => setCurrentRole('admin')}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{isRtl ? "المسؤول" : "Admin"}</span>
            </button>
          </div>

          {/* Language toggle desktop */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-black/30 dark:hover:border-zinc-700 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-slate-800 dark:text-zinc-200" />
            <span>{lang === 'en' ? "العربية" : "English"}</span>
          </button>

          {/* User badge + Sign Out */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-zinc-800">
            <div className="hidden lg:block text-right pr-2">
              <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[120px]" title={userEmail}>
                {userEmail}
              </span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
