import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Calendar,
  Cloud,
  CheckCircle2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DateFilterPreset } from '../../types';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavigationTab;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  onToggleMobileMenu: () => void;
  onOpenFirebaseModal: () => void;
  onOpenDavReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenAddModal,
  onToggleMobileMenu,
  onOpenFirebaseModal,
  onOpenDavReport,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { dateFilter, setDateFilterPreset } = useData();
  const { isFirebaseActive, user, logout } = useAuth();

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [customStart, setCustomStart] = useState(dateFilter.startDate);
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate);

  const customPickerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customPickerRef.current && !customPickerRef.current.contains(e.target as Node)) {
        setShowCustomPicker(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCustomPicker(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getBreadcrumbTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'transactions':
        return 'Transaction Ledger';
      case 'analytics':
        return 'DAV Statistical Analytics';
      case 'budgets':
        return 'Budgets & Spending Pacing';
      case 'insights':
        return 'Spending Insights & Alerts';
      case 'import_export':
        return 'CSV Data Management';
      case 'settings':
        return 'Account & Profile Settings';
      default:
        return 'Dashboard';
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as DateFilterPreset;
    if (val === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setDateFilterPreset(val);
    }
  };

  const applyCustomDates = () => {
    if (customStart && customEnd) {
      setDateFilterPreset('custom', customStart, customEnd);
      setShowCustomPicker(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden btn-press"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">
            {getBreadcrumbTitle(currentTab)}
          </span>
          <span className="text-slate-400 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {user?.displayName} <span className="font-mono font-medium">({user?.currencySymbol})</span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Date Filter Selector */}
        <div className="relative flex items-center" ref={customPickerRef}>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <Calendar size={14} className="text-slate-500 shrink-0" />
            <select
              value={dateFilter.preset}
              onChange={handlePresetChange}
              aria-label="Filter transactions by date preset"
              className="bg-transparent border-none outline-hidden cursor-pointer font-medium text-xs pr-1"
            >
              <option value="thisMonth">This Month</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="prevMonth">Previous Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Custom Date Range Popover */}
          {showCustomPicker && (
            <div className="absolute top-11 right-0 z-50 p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl flex flex-col gap-2.5 min-w-[270px] animate-fade-in-scale">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Custom Date Range</span>
                <span className="text-[10px] text-slate-400 font-mono">YYYY-MM-DD</span>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">Start Date:</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">End Date:</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors btn-press"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCustomDates}
                  className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors btn-press shadow-2xs"
                >
                  Apply Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Database state button */}
        <button
          onClick={onOpenFirebaseModal}
          title={isFirebaseActive ? 'Connected to Cloud Firestore' : 'Running in Local Demo Sandbox'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors btn-press ${
            isFirebaseActive
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          {isFirebaseActive ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>Firestore</span>
            </>
          ) : (
            <>
              <Cloud size={13} className="text-slate-400 shrink-0" />
              <span>Sandbox</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors btn-press"
        >
          {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap btn-press"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* User Profile Avatar Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            aria-expanded={showUserMenu}
            aria-label="Open user profile menu"
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute top-11 right-0 z-50 w-56 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl animate-fade-in-scale">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <Settings size={14} className="text-slate-400" />
                  <span>Account & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    onOpenDavReport();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-left transition-colors"
                >
                  <GraduationCap size={14} />
                  <span>Academic DAV Notes</span>
                </button>

                <button
                  onClick={() => {
                    onOpenFirebaseModal();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  <Cloud size={14} className="text-slate-400" />
                  <span>Storage Engine Settings</span>
                </button>
              </div>

              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
