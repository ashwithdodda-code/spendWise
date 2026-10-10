import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  PiggyBank,
  Lightbulb,
  ArrowUpDown,
  Settings,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../utils/sampleData';

export type NavigationTab =
  | 'overview'
  | 'transactions'
  | 'analytics'
  | 'budgets'
  | 'insights'
  | 'import_export'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDavReport: () => void;
  onOpenFirebaseModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenDavReport,
  onOpenFirebaseModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout, isFirebaseActive, switchDemoProfile } = useAuth();

  const navItems = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as NavigationTab, label: 'Transactions', icon: ReceiptText },
    { id: 'analytics' as NavigationTab, label: 'Analytics (DAV)', icon: BarChart3 },
    { id: 'budgets' as NavigationTab, label: 'Budgets & Pacing', icon: PiggyBank },
    { id: 'insights' as NavigationTab, label: 'Spending Insights', icon: Lightbulb },
    { id: 'import_export' as NavigationTab, label: 'Import / Export', icon: ArrowUpDown },
    { id: 'settings' as NavigationTab, label: 'Profile & Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleNavClick('overview')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 text-white font-bold text-base shrink-0 shadow-xs transition-transform hover:scale-105 duration-200">
              ₹
            </div>
            {!isCollapsed && (
              <div className="truncate animate-fade-in-scale">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg block leading-none">
                  SpendWise
                </span>
                <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium tracking-tight">
                  Student Expense Analytics
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 btn-press ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
            {/* DAV Academic Project Report Button */}
            <button
              onClick={() => {
                onOpenDavReport();
                onCloseMobile();
              }}
              title={isCollapsed ? 'DAV Project Report & Viva Notes' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-all btn-press"
            >
              <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              {!isCollapsed && (
                <div className="text-left truncate">
                  <span className="block font-semibold leading-tight">DAV Project Docs</span>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Viva & Algorithms Guide</span>
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Database & Demo Status Banner */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          {!isCollapsed && (
            <div className="mb-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span>Storage Engine</span>
                <button
                  type="button"
                  onClick={onOpenFirebaseModal}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Configure
                </button>
              </div>
              <div
                onClick={onOpenFirebaseModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onOpenFirebaseModal(); }}
                className="cursor-pointer flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:border-teal-500 transition-colors btn-press shadow-2xs"
              >
                {isFirebaseActive ? (
                  <>
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate font-medium">Cloud Firestore</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={14} className="text-teal-500 shrink-0" />
                    <span className="truncate font-medium">Demo Sandbox (Local)</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Demo Profile Switcher for Testing Strict Data Separation */}
          {!isCollapsed && user && (
            <div className="mb-3">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                Active Student Account
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_PROFILES.map((dp) => {
                  const isSelected = user.userId === dp.profile.userId;
                  return (
                    <button
                      key={dp.profile.userId}
                      type="button"
                      onClick={() => switchDemoProfile(dp.profile.userId)}
                      className={`text-[11px] py-1.5 px-2 rounded-md font-medium truncate transition-all text-left btn-press ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {dp.profile.displayName.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User profile & Sign-out */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.displayName || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email || 'student@campus.edu'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
