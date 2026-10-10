import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Tag,
  PiggyBank,
  Receipt,
  Calendar,
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercentage, formatDate, formatShortDate } from '../../utils/formatters';
import { NavigationTab } from '../layout/Sidebar';
import { Transaction } from '../../types';

interface OverviewViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onOpenBudgetModal?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenAddModal,
  onEditTransaction,
  onOpenBudgetModal,
}) => {
  const { user } = useAuth();
  const {
    stats,
    categoryMetrics,
    dailyTrends,
    monthlyComparison,
    dayOfWeekStats,
    overallBudgetComparison,
    budgetComparisons,
    filteredTransactions,
    periodTransactions,
    dateFilter,
    insights,
    setSelectedCategory,
  } = useData();

  const sym = user?.currencySymbol || '₹';

  // KPI calculations
  const totalExpense = stats.totalExpense;
  const meanDaily = stats.meanDailyExpense;
  const topCategory = categoryMetrics.highestCategory;
  const remainingBudget = overallBudgetComparison ? overallBudgetComparison.remaining : 0;
  const budgetUsagePercent = overallBudgetComparison ? overallBudgetComparison.percentageUsed : 0;
  const totalCount = stats.transactionCount;

  // Pie chart data
  const pieData = categoryMetrics.metrics.map(m => ({
    name: m.category,
    value: m.total,
    percentage: m.percentage,
    color: m.color,
  }));

  // Budget vs Actual data
  const budgetChartData = budgetComparisons.slice(0, 6).map(b => ({
    category: b.category.length > 12 ? b.category.slice(0, 10) + '..' : b.category,
    spent: b.spent,
    budget: b.limitAmount,
  }));

  // Cumulative Spending with pacing target
  const cumulativeData = dailyTrends.map((d, index) => {
    const totalDays = 30;
    const linearBudgetPace = overallBudgetComparison
      ? Math.round((overallBudgetComparison.limitAmount / totalDays) * (index + 1))
      : 0;
    return {
      date: d.displayDate,
      cumulative: d.cumulative,
      targetPace: linearBudgetPace,
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Dynamic Rule Insight Callout Banner if any warning or top highlight */}
      {insights.length > 0 && (
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 flex items-start gap-3">
          <Info size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-slate-900 dark:text-white mr-1.5">
              {insights[0].title}:
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {insights[0].message}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('insights')}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline shrink-0 whitespace-nowrap"
          >
            All Insights ({insights.length}) →
          </button>
        </div>
      )}

      {/* 6 High-Impact KPI Cards with subtle stagger animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Period Expenses */}
        <div
          onClick={() => onNavigateTab('transactions')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('transactions'); }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-1 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Expenses</span>
            <Wallet size={16} className="text-rose-500 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(totalExpense, sym)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {stats.expenseCount} purchases logged →
          </p>
        </div>

        {/* KPI 2: Average Daily Spend */}
        <div
          onClick={() => onNavigateTab('analytics')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('analytics'); }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Daily Mean Spend</span>
            <Calendar size={16} className="text-teal-500 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(meanDaily, sym)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Active spending rate →
          </p>
        </div>

        {/* KPI 3: Highest Category */}
        <div
          onClick={() => {
            if (topCategory) {
              setSelectedCategory(topCategory.category);
              onNavigateTab('transactions');
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && topCategory) {
              setSelectedCategory(topCategory.category);
              onNavigateTab('transactions');
            }
          }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-3 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Top Category</span>
            <Tag size={16} className="text-indigo-500 shrink-0" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {topCategory ? topCategory.category : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums truncate">
            {topCategory ? `${formatPercentage(topCategory.percentage)} (${formatCurrency(topCategory.total, sym)})` : 'No data'}
          </p>
        </div>

        {/* KPI 4: Remaining Monthly Budget */}
        <div
          onClick={() => onNavigateTab('budgets')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('budgets'); }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-4 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Budget Balance</span>
            <PiggyBank size={16} className={budgetUsagePercent >= 100 ? 'text-rose-500 shrink-0' : 'text-emerald-500 shrink-0'} />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(remainingBudget, sym)}
          </div>
          <p className={`text-[11px] mt-1 font-semibold ${
            budgetUsagePercent >= 100 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
          }`}>
            {budgetUsagePercent.toFixed(0)}% used of {formatCurrency(user?.monthlyBudget || 0, sym)}
          </p>
        </div>

        {/* KPI 5: Total Transactions */}
        <div
          onClick={() => onNavigateTab('transactions')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('transactions'); }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-5 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Transactions</span>
            <Receipt size={16} className="text-blue-500 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {stats.expenseCount} out · {stats.incomeCount} in →
          </p>
        </div>

        {/* KPI 6: Net Cash Flow / Savings Rate */}
        <div
          onClick={() => onNavigateTab('analytics')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('analytics'); }}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer interactive-card animate-fade-in-up stagger-6 shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Net Savings</span>
            {stats.netSavings >= 0 ? (
              <TrendingUp size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <TrendingDown size={16} className="text-rose-500 shrink-0" />
            )}
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${
            stats.netSavings >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(stats.netSavings, sym)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Rate: {stats.savingsRate.toFixed(1)}% of income
          </p>
        </div>
      </div>

      {/* Grid of 6 Interactive Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Expense Category Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Expenditure breakdown across distinct student buckets
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {categoryMetrics.metrics.length} Categories
            </span>
          </div>

          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <AlertCircle size={28} className="mb-2 opacity-50" />
                <span>No expense transactions recorded in this period</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart B: Monthly Spending Comparison */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Inflow vs Outflow
              </h3>
              <p className="text-xs text-slate-500">
                Month-over-month expenses vs student allowances
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              MoM Analysis
            </span>
          </div>

          <div className="h-64">
            {monthlyComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="income" name="Income / Allowance" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <AlertCircle size={28} className="mb-2 opacity-50" />
                <span>Add transactions across multiple months to visualize trend</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart C: Daily Spending Velocity & Moving Average */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Spending Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Daily expenditures with 3-day moving average trend line
              </p>
            </div>
          </div>

          <div className="h-64">
            {dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Daily Spend"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    name="3-Day Moving Avg"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No daily transaction data in selected range</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart D: Budget vs Actual Spending by Category */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Budget vs Actual Spending
              </h3>
              <p className="text-xs text-slate-500">
                Target allocations compared to recorded month-to-date spending
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              Manage Budgets →
            </button>
          </div>

          <div className="h-64">
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="budget" name="Budget Limit" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spent" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <PiggyBank size={28} className="mb-2 opacity-50" />
                <p>No category budgets defined yet.</p>
                <button
                  onClick={() => onNavigateTab('budgets')}
                  className="mt-2 px-3 py-1 bg-teal-600 text-white rounded text-xs"
                >
                  Create Category Budgets
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chart E: Cumulative Spending vs Linear Budget Pacing */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cumulative Spend & Budget Burn-Rate
              </h3>
              <p className="text-xs text-slate-500">
                Pacing progress vs ideal linear consumption path
              </p>
            </div>
          </div>

          <div className="h-64">
            {cumulativeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), sym), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Actual Cumulative Spend"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  {overallBudgetComparison && (
                    <Line
                      type="monotone"
                      dataKey="targetPace"
                      name="Linear Target Pacing"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>Record expenses across multiple days to view cumulative burn curve</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart F: Spending by Day of the Week */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Spending by Day of the Week
              </h3>
              <p className="text-xs text-slate-500">
                Cyclical student habits from Monday through Sunday
              </p>
            </div>
            {dayOfWeekStats.peakDay && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Peak: {dayOfWeekStats.peakDay.dayName}
              </span>
            )}
          </div>

          <div className="h-64">
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
                <Bar dataKey="average" name="Average Spent per Day" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Ledger Entries Snippet */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Latest financial records in active date window
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>View Full Ledger ({filteredTransactions.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Method</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.slice(0, 5).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onEditTransaction ? onEditTransaction(t) : onNavigateTab('transactions')}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    title="Click to view and edit transaction"
                  >
                    <td className="px-3 py-2.5 text-slate-500 font-mono">
                      {formatShortDate(t.date)}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.merchant && <span className="text-[10px] text-slate-400">({t.merchant})</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                      {t.category}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {t.paymentMethod}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, sym)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            <p>No transactions match the selected date window.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              + Log First Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
