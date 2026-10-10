import React, { useState, useEffect } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { Budget } from '../../types';
import { DEFAULT_CATEGORIES } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>, existingId?: string) => Promise<void>;
  initialData?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>('Food & Dining');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [month, setMonth] = useState<string>(() => new Date().toISOString().substring(0, 7));
  const [warningThreshold, setWarningThreshold] = useState<number>(85);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setLimitAmount(initialData.limitAmount.toString());
      setMonth(initialData.month);
      setWarningThreshold(initialData.warningThreshold || 85);
    } else {
      setCategory('Food & Dining');
      setLimitAmount('');
      setMonth(new Date().toISOString().substring(0, 7));
      setWarningThreshold(85);
    }
    setError(null);
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(limitAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please provide a valid positive budget amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          category,
          limitAmount: Math.round(parsed),
          month,
          warningThreshold,
        },
        initialData?.id
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PiggyBank className="text-teal-600 dark:text-teal-400" size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Update Budget Target' : 'Set Category Budget'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            >
              <option value="Overall">Overall Monthly Budget</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Monthly Limit ({user?.currencySymbol || '₹'}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                {user?.currencySymbol || '₹'}
              </span>
              <input
                type="number"
                step="10"
                required
                placeholder="e.g. 3500"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tabular-nums focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Applicable Month (YYYY-MM)
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alert Trigger Threshold ({warningThreshold}%)
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>85% (Recommended)</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Target' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
