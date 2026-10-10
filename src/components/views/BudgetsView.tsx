import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  Compass,
  Tag,
  PlusCircle,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Budget } from '../../types';
import { formatCurrency, formatPercentage, DEFAULT_CATEGORIES } from '../../utils/formatters';

interface BudgetsViewProps {
  onOpenBudgetModal: (initialData?: Budget) => void;
  onDeleteBudget: (id: string, category: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenBudgetModal,
  onDeleteBudget,
}) => {
  const { user, updateProfile } = useAuth();
  const {
    overallBudgetComparison,
    budgetComparisons,
    budgets,
    stats,
  } = useData();

  const sym = user?.currencySymbol || '₹';
  const [budgetSearch, setBudgetSearch] = useState('');
  const [isEditingOverallInline, setIsEditingOverallInline] = useState(false);
  const [newOverallLimit, setNewOverallLimit] = useState(user?.monthlyBudget?.toString() || '12000');

  // Days in month calculation for pacing
  const today = new Date();
  const currentDay = today.getDate();
  const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(totalDays - currentDay, 1);

  // Projected spending at current burn rate
  const dailyBurnRate = stats.meanDailyExpense;
  const projectedMonthEnd = (overallBudgetComparison ? overallBudgetComparison.spent : 0) + (dailyBurnRate * daysRemaining);
  const budgetLimit = overallBudgetComparison ? overallBudgetComparison.limitAmount : (user?.monthlyBudget || 0);
  const isPacingOver = budgetLimit > 0 && projectedMonthEnd > budgetLimit;

  // Unbudgeted standard categories
  const budgetedCategories = new Set(budgets.map(b => b.category));
  const unbudgetedCategories = DEFAULT_CATEGORIES.filter(c => !budgetedCategories.has(c));

  const filteredBudgets = budgetComparisons.filter(b =>
    b.category.toLowerCase().includes(budgetSearch.toLowerCase())
  );

  const handleSaveOverallInline = async () => {
    const parsed = parseFloat(newOverallLimit);
    if (!isNaN(parsed) && parsed > 0) {
      await updateProfile({ monthlyBudget: parsed });
      setIsEditingOverallInline(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Top Banner: Overall Budget & Pacing Projection */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <PiggyBank size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Spending Envelope & Pacing
              </h2>
              <p className="text-xs text-slate-500">
                Academic cycle: Day {currentDay} of {totalDays} ({daysRemaining} days remaining in month)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenBudgetModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-2xs transition-colors shrink-0 btn-press"
            >
              <Plus size={15} />
              <span>Add Category Budget</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Metrics */}
        {overallBudgetComparison ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Total Monthly Budget</span>
                  <button
                    onClick={() => setIsEditingOverallInline(!isEditingOverallInline)}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 size={11} />
                    <span>{isEditingOverallInline ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                {isEditingOverallInline ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-slate-400">{sym}</span>
                    <input
                      type="number"
                      value={newOverallLimit}
                      onChange={(e) => setNewOverallLimit(e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      onClick={handleSaveOverallInline}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded btn-press"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums block mt-0.5">
                    {formatCurrency(overallBudgetComparison.limitAmount, sym)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">Actual Month-to-Date Spend</span>
                <span className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums block mt-0.5">
                  {formatCurrency(overallBudgetComparison.spent, sym)}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">Remaining Allowance</span>
                <span className={`text-xl font-bold font-mono tabular-nums block mt-0.5 ${
                  overallBudgetComparison.remaining <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {formatCurrency(overallBudgetComparison.remaining, sym)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-400">
                  {overallBudgetComparison.percentageUsed.toFixed(1)}% Consumed
                </span>
                <span className={`font-mono ${
                  overallBudgetComparison.percentageUsed >= 100
                    ? 'text-rose-600'
                    : overallBudgetComparison.percentageUsed >= 85
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}>
                  {overallBudgetComparison.percentageUsed >= 100 ? 'Budget Cap Exceeded!' : 'Nominal Pacing'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overallBudgetComparison.percentageUsed >= 100
                      ? 'bg-rose-500'
                      : overallBudgetComparison.percentageUsed >= 85
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  style={{ width: `${Math.min(overallBudgetComparison.percentageUsed, 100)}%` }}
                />
              </div>
            </div>

            {/* Linear Pacing Forecast Diagnostic */}
            <div className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${
              isPacingOver
                ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
            }`}>
              <Compass size={18} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">
                  {isPacingOver ? 'Pacing Warning: High Burn Velocity' : 'Pacing Sustainable: Within Target Trajectory'}
                </span>
                <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">
                  At your current average expenditure of <strong>{formatCurrency(dailyBurnRate, sym)}/day</strong>, month-end forecast is <strong>{formatCurrency(projectedMonthEnd, sym)}</strong> ({isPacingOver ? `projected overage of ${formatCurrency(projectedMonthEnd - budgetLimit, sym)}` : `projected headroom of ${formatCurrency(budgetLimit - projectedMonthEnd, sym)}`}).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-center text-xs">
            <p className="text-slate-500">No overall budget defined yet.</p>
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Budgets & Threshold Warnings
            </h3>
            <p className="text-xs text-slate-500">
              Departmental caps and automated warning states
            </p>
          </div>

          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter category budgets..."
              value={budgetSearch}
              onChange={(e) => setBudgetSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {filteredBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.map((item) => {
              const originalBudget = budgets.find(b => b.id === item.id);
              const isExceeded = item.spent > item.limitAmount;
              const isWarning = item.percentageUsed >= 75 && !isExceeded;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between interactive-card"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.category}
                      </h4>
                      <div className="flex items-center gap-1">
                        {originalBudget && (
                          <button
                            onClick={() => onOpenBudgetModal(originalBudget)}
                            title="Edit Category Target"
                            aria-label={`Edit ${item.category} budget`}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded btn-press"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteBudget(item.id, item.category)}
                          title="Delete Target"
                          aria-label={`Delete ${item.category} budget`}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded btn-press"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(item.spent, sym)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        target: {formatCurrency(item.limitAmount, sym)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className={`font-semibold ${
                      isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {item.percentageUsed.toFixed(0)}% used
                    </span>
                    <span className="text-slate-500 font-mono">
                      {isExceeded
                        ? `Over by ${formatCurrency(item.spent - item.limitAmount, sym)}`
                        : `${formatCurrency(item.remaining, sym)} remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 space-y-2">
            <p>No category budgets matching your query.</p>
            <button
              onClick={() => onOpenBudgetModal()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg btn-press"
            >
              Set Category Budget
            </button>
          </div>
        )}

        {/* Quick Add Unbudgeted Categories Strip */}
        {unbudgetedCategories.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <PlusCircle size={14} className="text-teal-600" />
              <span>Recommended Categories to Budget:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {unbudgetedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onOpenBudgetModal({ id: '', userId: '', category: cat, limitAmount: 2000, month: new Date().toISOString().substring(0, 7), createdAt: '' })}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors btn-press"
                >
                  <Plus size={12} />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
