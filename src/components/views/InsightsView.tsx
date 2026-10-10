import React from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Coffee,
  Calendar,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const InsightsView: React.FC = () => {
  const { user } = useAuth();
  const { insights, stats, anomalies, overallBudgetComparison, categoryMetrics } = useData();

  const sym = user?.currencySymbol || '₹';

  // Compute student financial health score (0 - 100) based on real data
  let score = 70;
  if (stats.savingsRate >= 20) score += 15;
  else if (stats.savingsRate > 0) score += 5;
  else score -= 15;

  if (overallBudgetComparison) {
    if (overallBudgetComparison.percentageUsed <= 85) score += 15;
    else if (overallBudgetComparison.percentageUsed > 100) score -= 20;
  }

  if (anomalies.length > 2) score -= 10;
  score = Math.max(10, Math.min(100, Math.round(score)));

  let healthLabel = 'Moderate';
  let healthColor = 'text-amber-600 dark:text-amber-400';
  if (score >= 80) {
    healthLabel = 'Excellent Financial Discipline';
    healthColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (score < 50) {
    healthLabel = 'Budget Under Strain';
    healthColor = 'text-rose-600 dark:text-rose-400';
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner: Financial Health Score */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Automated Analytical Insights
              </h2>
              <p className="text-xs text-slate-500">
                Rule-based algorithmic heuristics derived from your recorded financial behavior
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
              Discipline Score
            </span>
            <span className={`text-xs font-bold ${healthColor}`}>
              {healthLabel}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {score}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Generated Insights Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Active Behavioral Findings ({insights.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => {
            let Icon = Lightbulb;
            let badgeBg = 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900';
            if (insight.type === 'warning') {
              Icon = AlertTriangle;
              badgeBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
            } else if (insight.type === 'positive') {
              Icon = CheckCircle2;
              badgeBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
            } else if (insight.type === 'opportunity') {
              Icon = Coffee;
              badgeBg = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
            }

            return (
              <div
                key={insight.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md border ${badgeBg}`}>
                        <Icon size={16} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {insight.title}
                      </h4>
                    </div>
                    {insight.metric && (
                      <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums shrink-0">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {insight.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical College Recommendations Matrix */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Data-Backed Optimization Strategies for Students
        </h3>
        <p className="text-xs text-slate-500">
          Targeted heuristics based on typical collegiate expense leakages
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <Target size={15} className="text-teal-600" />
              <span>Micro-Expense Bundling</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Daily UPI quick taps (&lt; ₹100 for snacks and chai) account for high cumulative volume. Establish a fixed weekly petty-cash wallet to prevent unconscious leakage.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <Calendar size={15} className="text-indigo-600" />
              <span>Weekend Spending Decoupling</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Friday through Sunday typically accounts for over 40% of student discretionary spend. Pre-budget movie and restaurant outings on Friday mornings.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Academic Textbook Sharing</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Education & Books expenses can be reduced by 60% by leveraging senior student book rotations, digital library archives, or group-shared resource manuals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
