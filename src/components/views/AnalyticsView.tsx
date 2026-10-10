import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  ShieldAlert,
  Calendar,
  CreditCard,
  Download,
  AlertTriangle,
  Info,
  TrendingUp,
  Percent,
  Sliders,
  X,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { exportAnalyticsSummaryToCSV } from '../../utils/csv';
import { AnomalyItem } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const {
    stats,
    categoryMetrics,
    anomalies: defaultAnomalies,
    dayOfWeekStats,
    monthlyComparison,
    periodTransactions,
  } = useData();

  const sym = user?.currencySymbol || '₹';

  // Interactive Z-Score Sensitivity Slider / Threshold
  const [zThreshold, setZThreshold] = useState<number>(2.0);
  const [selectedAnomalyDetail, setSelectedAnomalyDetail] = useState<AnomalyItem | null>(null);

  // Recalculate anomalies dynamically if user adjusts threshold
  const expenseTx = periodTransactions.filter(t => t.type === 'expense');
  const activeAnomalies = React.useMemo(() => {
    if (expenseTx.length < 5) return [];

    const categoryStats = new Map<string, { mean: number; stdDev: number; count: number }>();
    const categories = Array.from(new Set(expenseTx.map(t => t.category)));

    for (const cat of categories) {
      const catAmounts = expenseTx.filter(t => t.category === cat).map(t => t.amount);
      const mean = catAmounts.reduce((a, b) => a + b, 0) / catAmounts.length;
      const variance = catAmounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / catAmounts.length;
      const stdDev = Math.sqrt(variance);
      categoryStats.set(cat, { mean, stdDev, count: catAmounts.length });
    }

    const globalAmounts = expenseTx.map(t => t.amount);
    const globalMean = globalAmounts.reduce((a, b) => a + b, 0) / globalAmounts.length;
    const globalVariance = globalAmounts.reduce((a, b) => a + Math.pow(b - globalMean, 2), 0) / globalAmounts.length;
    const globalStdDev = Math.sqrt(globalVariance);

    const list: AnomalyItem[] = [];

    for (const t of expenseTx) {
      const catStat = categoryStats.get(t.category);
      let baselineMean = globalMean;
      let baselineStdDev = globalStdDev;

      if (catStat && catStat.count >= 3 && catStat.stdDev > 5) {
        baselineMean = catStat.mean;
        baselineStdDev = catStat.stdDev;
      }

      if (baselineStdDev <= 0) continue;
      const zScore = (t.amount - baselineMean) / baselineStdDev;

      if (zScore >= zThreshold) {
        let severity: 'moderate' | 'high' | 'critical' = 'moderate';
        if (zScore >= 3.0) severity = 'critical';
        else if (zScore >= 2.4) severity = 'high';

        const timesHigher = (t.amount / Math.max(baselineMean, 1)).toFixed(1);
        const reason = `Expense of ${formatCurrency(t.amount, sym)} is ${timesHigher}× higher than the ${t.category} baseline (mean ${formatCurrency(Math.round(baselineMean), sym)}) with Z-score of +${zScore.toFixed(2)}.`;

        list.push({
          transaction: t,
          reason,
          baselineMean: Math.round(baselineMean),
          baselineStdDev: Math.round(baselineStdDev),
          zScore: Math.round(zScore * 100) / 100,
          severity,
        });
      }
    }

    return list.sort((a, b) => b.zScore - a.zScore);
  }, [expenseTx, zThreshold, sym]);

  // Payment method breakdown calculation
  const paymentMethodsMap = new Map<string, number>();
  for (const t of expenseTx) {
    paymentMethodsMap.set(t.paymentMethod, (paymentMethodsMap.get(t.paymentMethod) || 0) + t.amount);
  }
  const paymentMethodData = Array.from(paymentMethodsMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const PAYMENT_COLORS = ['#0D9488', '#2563EB', '#6366F1', '#D97706', '#EC4899', '#64748B'];

  const handleExportSummary = () => {
    exportAnalyticsSummaryToCSV(stats, categoryMetrics.metrics);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Header Banner */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Calculator size={18} />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Analytics & Visualization (DAV) Modeling
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical statistical calculations, dispersion measures, and anomaly detection derived from recorded student records.
          </p>
        </div>

        <button
          onClick={handleExportSummary}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0 btn-press"
        >
          <Download size={14} />
          <span>Export DAV Report CSV</span>
        </button>
      </div>

      {/* Part 1: Descriptive Statistics Matrix */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Descriptive Statistics (Central Tendency & Dispersion)
            </h3>
            <p className="text-xs text-slate-500">
              Parametric and non-parametric properties of expenditure distribution
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            N = {stats.expenseCount} purchases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Arithmetic Mean (Daily)</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.meanDailyExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">μ = Σx / N_days</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Median Transaction</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.medianExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Q2 (50th Percentile)</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Standard Deviation</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.stdDevExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">σ (Spread / Dispersion)</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Interquartile Range</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.iqrExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">IQR = Q3 - Q1</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Variance (σ²)</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums truncate">
              {Math.round(stats.varianceExpense).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mean squared deviation</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">1st Quartile (Q1)</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.q1Expense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">25% below this bound</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">3rd Quartile (Q3)</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.q3Expense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">75% below this bound</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Minimum Single Expense</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.minExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Lower absolute bound</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Maximum Single Expense</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(stats.maxExpense, sym)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Upper absolute bound</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 interactive-card">
            <span className="text-[11px] font-medium text-slate-500 block">Net Savings Rate</span>
            <span className={`text-base font-bold font-mono tabular-nums ${
              stats.savingsRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stats.savingsRate.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Saved / Total Inflow</span>
          </div>
        </div>
      </div>

      {/* Part 2: Statistical Outlier & Anomaly Detection Panel with Interactive Sensitivity Slider */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statistical Anomaly & Outlier Detection
              </h3>
              <p className="text-xs text-slate-500">
                Transparent Standard Score (<span className="font-mono">Z = (x - μ) / σ</span>) based on category historical bounds
              </p>
            </div>
          </div>

          {/* Interactive Sensitivity Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sensitivity:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {[
                { label: 'Z ≥ 1.8σ', val: 1.8 },
                { label: 'Z ≥ 2.0σ', val: 2.0 },
                { label: 'Z ≥ 2.5σ', val: 2.5 },
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setZThreshold(item.val)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-colors btn-press ${
                    zThreshold === item.val
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
              activeAnomalies.length > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {activeAnomalies.length} Flagged
            </span>
          </div>
        </div>

        {activeAnomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Transaction</th>
                  <th className="px-3 py-2.5">Observed Amount</th>
                  <th className="px-3 py-2.5">Category Baseline (μ)</th>
                  <th className="px-3 py-2.5 font-mono">Z-Score</th>
                  <th className="px-3 py-2.5">Statistical Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeAnomalies.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedAnomalyDetail(item)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view mathematical proof"
                  >
                    <td className="px-3 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(item.transaction.date)}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      <div>{item.transaction.description}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.transaction.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.transaction.amount, sym)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.baselineMean, sym)} (σ = {formatCurrency(item.baselineStdDev, sym)})
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      +{item.zScore.toFixed(2)}σ
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center text-xs text-emerald-800 dark:text-emerald-300">
            <p className="font-semibold">No Statistical Outliers at Z ≥ {zThreshold}σ</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              All transactions in the current period remain within {zThreshold} standard deviations of their respective historical category averages.
            </p>
          </div>
        )}
      </div>

      {/* Part 3: Payment Methods & Day-of-Week Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Channel Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Expenditure by payment mechanism (UPI, Cards, Cash)
              </p>
            </div>
          </div>

          <div className="h-60">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={600}
                  >
                    {paymentMethodData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), 'Total Spent']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No payment data in this period
              </div>
            )}
          </div>
        </div>

        {/* Day of Week Analysis */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Spending Behavioral Pattern
              </h3>
              <p className="text-xs text-slate-500">
                Mean spend by weekday showing student habit cycles
              </p>
            </div>
            {dayOfWeekStats.peakDay && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Peak: {dayOfWeekStats.peakDay.dayName} ({formatCurrency(dayOfWeekStats.peakDay.average, sym)})
              </span>
            )}
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekStats.days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${v}`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), sym), 'Average Daily Spend']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="average"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outlier Mathematical Proof Modal */}
      {selectedAnomalyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-fade-in-scale">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Z-Score Mathematical Proof
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnomalyDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded btn-press"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Formula for Standard Score (Z-Score):
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-center text-sm font-bold">
                Z = (x - μ) / σ
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Observed Transaction (x):</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedAnomalyDetail.transaction.amount, sym)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category Mean (μ):</span>
                  <span className="font-mono">{formatCurrency(selectedAnomalyDetail.baselineMean, sym)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Deviation (σ):</span>
                  <span className="font-mono">{formatCurrency(selectedAnomalyDetail.baselineStdDev, sym)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 font-bold">
                  <span>Calculated Standard Score (Z):</span>
                  <span className="font-mono text-amber-600">+{selectedAnomalyDetail.zScore}σ</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                This transaction deviates significantly from regular student spending in <em>{selectedAnomalyDetail.transaction.category}</em>, placing it in the top {(100 - (selectedAnomalyDetail.zScore >= 2 ? 97.7 : 95)).toFixed(1)}% tail of the probability density function.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAnomalyDetail(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg btn-press"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
