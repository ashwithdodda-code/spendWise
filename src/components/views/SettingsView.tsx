import React, { useState } from 'react';
import {
  User,
  Settings,
  DollarSign,
  Moon,
  Sun,
  Shield,
  RotateCcw,
  LogOut,
  Database,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { DEMO_PROFILES } from '../../utils/sampleData';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';

interface SettingsViewProps {
  onOpenFirebaseModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenFirebaseModal }) => {
  const { user, updateProfile, logout, switchDemoProfile, isFirebaseActive } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetCurrentDemoData } = useData();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget?.toString() || '12000');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(monthlyBudget);
    await updateProfile({
      displayName: displayName.trim(),
      currency,
      currencySymbol: currencySymbols[currency] || '₹',
      monthlyBudget: isNaN(budgetNum) ? 10000 : budgetNum,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetCurrentDemoData();
    setIsResetting(false);
    setIsResetModalOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Profile & Preferences Form */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Account & Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Personalize your display identity, financial currency, and monthly budget default
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
            <Check size={16} />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              >
                <option value="INR">₹ INR (Indian Rupee - Default)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Monthly Budget ({currencySymbols[currency] || '₹'})
              </label>
              <input
                type="number"
                step="100"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Theme Mode Segmented Control */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Interface Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'light'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun size={14} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'dark'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'system'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Settings size={14} />
                <span>System</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Student Sandbox & Security Separation Section */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
            <Shield size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Strict User Scoping & Account Switcher
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate multi-tenant data separation between distinct student profiles
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Every student account has its own isolated records. Switch between demo personas below to verify that one student's records, budgets, and analytics never bleed into another student's account:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEMO_PROFILES.map((dp) => {
            const isActive = user?.userId === dp.profile.userId;
            return (
              <div
                key={dp.profile.userId}
                className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
                  isActive
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {dp.profile.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {dp.profile.email} · {dp.profile.userId.includes('priya') ? 'Hosteller (₹14,000)' : 'Day Scholar (₹11,000)'}
                  </p>
                  {isActive && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      ● Active Account
                    </span>
                  )}
                </div>

                {!isActive && (
                  <button
                    onClick={() => switchDemoProfile(dp.profile.userId)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Switch User
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Reset Demo Data Button */}
        {user?.isDemoUser && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Reset active student data to default clean state:
            </span>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
            >
              <RotateCcw size={13} />
              <span>{resetSuccess ? 'Refreshed!' : 'Reset Demo Records'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cloud Storage & Database Architecture */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={20} className="text-slate-500" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Database Backend: {isFirebaseActive ? 'Cloud Firestore (Remote)' : 'Isolated Local Sandbox'}
            </h3>
            <p className="text-[11px] text-slate-500">
              View configuration, security rules, or connect external Firebase project.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenFirebaseModal}
          className="px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40"
        >
          View Storage Info
        </button>
      </div>

      {/* Sign Out Card */}
      <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300">
            Sign Out of SpendWise
          </h3>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
            Ends your current session and clears in-memory state.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Reset Confirmation In-App Modal */}
      <DeleteConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Demo Account Records?"
        message="Are you sure you want to reset this student account to initial sample records? Any custom transactions and budget edits added to this demo profile will be refreshed."
        confirmLabel="Reset Account Data"
        isDeleting={isResetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
