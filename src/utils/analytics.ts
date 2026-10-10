import {
  Transaction,
  Budget,
  DAVDescriptiveStats,
  CategoryMetric,
  DayOfWeekStat,
  AnomalyItem,
  RuleInsight
} from '../types';
import { getCategoryColor } from './formatters';

/**
 * Computes descriptive statistical metrics on student expense data.
 * Pure mathematical functions for Data Analytics & Visualization (DAV).
 */
export function computeDescriptiveStats(transactions: Transaction[]): DAVDescriptiveStats {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const incomeTx = transactions.filter(t => t.type === 'income');

  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  const expenseAmounts = expenseTx.map(t => t.amount).sort((a, b) => a - b);
  const n = expenseAmounts.length;

  if (n === 0) {
    return {
      totalExpense: 0,
      totalIncome,
      netSavings,
      savingsRate: 0,
      meanDailyExpense: 0,
      medianExpense: 0,
      minExpense: 0,
      maxExpense: 0,
      stdDevExpense: 0,
      varianceExpense: 0,
      iqrExpense: 0,
      q1Expense: 0,
      q3Expense: 0,
      transactionCount: transactions.length,
      expenseCount: 0,
      incomeCount: incomeTx.length,
    };
  }

  // Median
  let median = 0;
  if (n % 2 === 1) {
    median = expenseAmounts[Math.floor(n / 2)];
  } else {
    median = (expenseAmounts[n / 2 - 1] + expenseAmounts[n / 2]) / 2;
  }

  // Quartiles (Q1 and Q3)
  const q1 = computeQuartile(expenseAmounts, 0.25);
  const q3 = computeQuartile(expenseAmounts, 0.75);
  const iqr = q3 - q1;

  // Mean
  const mean = totalExpense / n;

  // Variance & Standard Deviation
  const variance = expenseAmounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Mean daily spending based on unique dates spanned
  const uniqueDates = new Set(expenseTx.map(t => t.date));
  const distinctDays = Math.max(uniqueDates.size, 1);
  const meanDailyExpense = totalExpense / distinctDays;

  return {
    totalExpense,
    totalIncome,
    netSavings,
    savingsRate,
    meanDailyExpense,
    medianExpense: median,
    minExpense: expenseAmounts[0],
    maxExpense: expenseAmounts[n - 1],
    stdDevExpense: stdDev,
    varianceExpense: variance,
    iqrExpense: iqr,
    q1Expense: q1,
    q3Expense: q3,
    transactionCount: transactions.length,
    expenseCount: n,
    incomeCount: incomeTx.length,
  };
}

function computeQuartile(sortedArr: number[], q: number): number {
  if (sortedArr.length === 0) return 0;
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  } else {
    return sortedArr[base];
  }
}

/**
 * Computes category breakdown and contribution percentages.
 */
export function computeCategoryMetrics(transactions: Transaction[]): {
  metrics: CategoryMetric[];
  highestCategory: CategoryMetric | null;
  lowestCategory: CategoryMetric | null;
} {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const total = expenseTx.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { total: number; count: number }>();
  for (const t of expenseTx) {
    const entry = map.get(t.category) || { total: 0, count: 0 };
    entry.total += t.amount;
    entry.count += 1;
    map.set(t.category, entry);
  }

  const metrics: CategoryMetric[] = Array.from(map.entries()).map(([category, val]) => {
    return {
      category,
      total: val.total,
      percentage: total > 0 ? (val.total / total) * 100 : 0,
      count: val.count,
      avgAmount: val.count > 0 ? val.total / val.count : 0,
      color: getCategoryColor(category),
    };
  }).sort((a, b) => b.total - a.total);

  return {
    metrics,
    highestCategory: metrics.length > 0 ? metrics[0] : null,
    lowestCategory: metrics.length > 0 ? metrics[metrics.length - 1] : null,
  };
}

/**
 * Daily Spending aggregation, moving average & cumulative total
 */
export interface DailyTrendPoint {
  date: string;
  displayDate: string;
  amount: number;
  cumulative: number;
  movingAvg: number;
}

export function computeDailyTrends(transactions: Transaction[]): DailyTrendPoint[] {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  if (expenseTx.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, number>();
  for (const t of expenseTx) {
    dateMap.set(t.date, (dateMap.get(t.date) || 0) + t.amount);
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  let cumulative = 0;
  const points: DailyTrendPoint[] = [];

  const windowSize = 3;
  const recentValues: number[] = [];

  for (const date of sortedDates) {
    const amount = dateMap.get(date) || 0;
    cumulative += amount;

    recentValues.push(amount);
    if (recentValues.length > windowSize) {
      recentValues.shift();
    }
    const movingAvg = recentValues.reduce((s, v) => s + v, 0) / recentValues.length;

    // format display date
    const parts = date.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;

    points.push({
      date,
      displayDate,
      amount,
      cumulative,
      movingAvg: Math.round(movingAvg * 10) / 10,
    });
  }

  return points;
}

/**
 * Spending distribution across days of the week (Monday - Sunday)
 */
export function computeDayOfWeekStats(transactions: Transaction[]): {
  days: DayOfWeekStat[];
  peakDay: DayOfWeekStat | null;
} {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const stats = dayNames.map((name, i) => ({
    dayName: name,
    shortName: shortNames[i],
    total: 0,
    count: 0,
    average: 0,
  }));

  const expenseTx = transactions.filter(t => t.type === 'expense');
  for (const t of expenseTx) {
    const [y, m, d] = t.date.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const dateObj = new Date(y, m - 1, d);
      const dayIdx = dateObj.getDay();
      stats[dayIdx].total += t.amount;
      stats[dayIdx].count += 1;
    }
  }

  // Calculate averages
  for (const s of stats) {
    s.average = s.count > 0 ? Math.round(s.total / s.count) : 0;
  }

  // Rearrange to start Monday (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const reordered = [...stats.slice(1), stats[0]];

  let peakDay: DayOfWeekStat | null = null;
  let maxAvg = -1;
  for (const d of reordered) {
    if (d.average > maxAvg && d.count > 0) {
      maxAvg = d.average;
      peakDay = d;
    }
  }

  return { days: reordered, peakDay };
}

/**
 * Monthly comparison (Month-over-Month expenses vs income)
 */
export interface MonthlyComparisonPoint {
  month: string; // '2026-08'
  monthLabel: string; // 'Aug 2026'
  expense: number;
  income: number;
  savings: number;
}

export function computeMonthlyComparison(transactions: Transaction[]): MonthlyComparisonPoint[] {
  const map = new Map<string, { expense: number; income: number }>();

  for (const t of transactions) {
    const monthKey = t.date.substring(0, 7); // 'YYYY-MM'
    const cur = map.get(monthKey) || { expense: 0, income: 0 };
    if (t.type === 'expense') cur.expense += t.amount;
    if (t.type === 'income') cur.income += t.amount;
    map.set(monthKey, cur);
  }

  const sortedMonths = Array.from(map.keys()).sort();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return sortedMonths.map(month => {
    const data = map.get(month)!;
    const [y, m] = month.split('-').map(Number);
    const label = !isNaN(m) ? `${monthNames[m - 1]} ${y}` : month;
    return {
      month,
      monthLabel: label,
      expense: data.expense,
      income: data.income,
      savings: data.income - data.expense,
    };
  });
}

/**
 * Statistical Anomaly Detection using Z-Score & Tukey IQR fences.
 * Transparent, explainable data science technique.
 */
export function detectAnomalies(transactions: Transaction[]): AnomalyItem[] {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  if (expenseTx.length < 5) return [];

  // Group by category to find category-specific baseline
  const categoryStats = new Map<string, { mean: number; stdDev: number; count: number }>();
  const categories = Array.from(new Set(expenseTx.map(t => t.category)));

  for (const cat of categories) {
    const catAmounts = expenseTx.filter(t => t.category === cat).map(t => t.amount);
    const mean = catAmounts.reduce((a, b) => a + b, 0) / catAmounts.length;
    const variance = catAmounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / catAmounts.length;
    const stdDev = Math.sqrt(variance);
    categoryStats.set(cat, { mean, stdDev, count: catAmounts.length });
  }

  // Global baseline
  const globalAmounts = expenseTx.map(t => t.amount);
  const globalMean = globalAmounts.reduce((a, b) => a + b, 0) / globalAmounts.length;
  const globalVariance = globalAmounts.reduce((a, b) => a + Math.pow(b - globalMean, 2), 0) / globalAmounts.length;
  const globalStdDev = Math.sqrt(globalVariance);

  const anomalies: AnomalyItem[] = [];

  for (const t of expenseTx) {
    const catStat = categoryStats.get(t.category);
    let baselineMean = globalMean;
    let baselineStdDev = globalStdDev;

    // If category has at least 3 transactions and stdDev > 0, use category-specific baseline
    if (catStat && catStat.count >= 3 && catStat.stdDev > 5) {
      baselineMean = catStat.mean;
      baselineStdDev = catStat.stdDev;
    }

    if (baselineStdDev <= 0) continue;

    const zScore = (t.amount - baselineMean) / baselineStdDev;

    if (zScore >= 2.0) {
      let severity: 'moderate' | 'high' | 'critical' = 'moderate';
      if (zScore >= 3.0) severity = 'critical';
      else if (zScore >= 2.4) severity = 'high';

      const timesHigher = (t.amount / Math.max(baselineMean, 1)).toFixed(1);
      const reason = `Expense of ₹${t.amount.toLocaleString()} is ${timesHigher}× higher than the ${t.category} baseline (mean ₹${Math.round(baselineMean).toLocaleString()}) with Z-score of +${zScore.toFixed(2)}.`;

      anomalies.push({
        transaction: t,
        reason,
        baselineMean: Math.round(baselineMean),
        baselineStdDev: Math.round(baselineStdDev),
        zScore: Math.round(zScore * 100) / 100,
        severity,
      });
    }
  }

  return anomalies.sort((a, b) => b.zScore - a.zScore);
}

/**
 * Generates verified analytical insights from empirical data.
 */
export function generateAutomatedInsights(
  transactions: Transaction[],
  budgets: Budget[],
  userMonthlyBudget: number
): RuleInsight[] {
  const insights: RuleInsight[] = [];
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const incomeTx = transactions.filter(t => t.type === 'income');

  if (expenseTx.length === 0) {
    return [
      {
        id: 'no-data',
        type: 'info',
        title: 'Ready for Analysis',
        message: 'Log or import student transactions to activate statistical trend analysis, budget burn-rate projections, and anomaly detection.',
      }
    ];
  }

  const { metrics, highestCategory } = computeCategoryMetrics(transactions);
  const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);

  // 1. Dominant Expense Category Insight
  if (highestCategory && highestCategory.percentage >= 25) {
    insights.push({
      id: 'dominant-category',
      type: highestCategory.percentage > 40 ? 'warning' : 'info',
      title: `${highestCategory.category} Dominates Expenditure`,
      message: `${highestCategory.category} accounts for ${highestCategory.percentage.toFixed(1)}% (₹${highestCategory.total.toLocaleString()}) of your recorded expenses across ${highestCategory.count} transactions.`,
      metric: `${highestCategory.percentage.toFixed(0)}% of total`,
      category: highestCategory.category,
    });
  }

  // 2. Savings Rate & Cash Flow Insight
  if (totalIncome > 0) {
    const net = totalIncome - totalExpense;
    const rate = (net / totalIncome) * 100;
    if (net < 0) {
      insights.push({
        id: 'negative-cashflow',
        type: 'warning',
        title: 'Deficit Detected',
        message: `Your recorded expenses exceed your income by ₹${Math.abs(net).toLocaleString()}. Consider reviewing non-essential discretionary expenses.`,
        metric: `Deficit: ₹${Math.abs(net).toLocaleString()}`,
      });
    } else if (rate >= 20) {
      insights.push({
        id: 'positive-savings',
        type: 'positive',
        title: 'Strong Savings Discipline',
        message: `You are retaining ${rate.toFixed(1)}% (₹${net.toLocaleString()}) of your recorded income, exceeding the recommended student savings threshold of 15%.`,
        metric: `${rate.toFixed(0)}% Savings Rate`,
      });
    }
  }

  // 3. Overall Monthly Budget Insight
  if (userMonthlyBudget > 0) {
    const pctUsed = (totalExpense / userMonthlyBudget) * 100;
    if (pctUsed >= 100) {
      insights.push({
        id: 'budget-exceeded',
        type: 'warning',
        title: 'Overall Budget Exhausted',
        message: `You have spent ₹${totalExpense.toLocaleString()}, which is ${(pctUsed - 100).toFixed(1)}% over your target limit of ₹${userMonthlyBudget.toLocaleString()}.`,
        metric: `${pctUsed.toFixed(0)}% spent`,
      });
    } else if (pctUsed >= 80) {
      insights.push({
        id: 'budget-approaching',
        type: 'warning',
        title: 'Approaching Budget Ceiling',
        message: `You have consumed ${pctUsed.toFixed(1)}% of your monthly budget. Remaining safe allowance is ₹${(userMonthlyBudget - totalExpense).toLocaleString()}.`,
        metric: `${pctUsed.toFixed(0)}% consumed`,
      });
    } else {
      insights.push({
        id: 'budget-healthy',
        type: 'positive',
        title: 'Budget On Track',
        message: `You have used ${pctUsed.toFixed(1)}% of your monthly budget with ₹${(userMonthlyBudget - totalExpense).toLocaleString()} still available.`,
        metric: `${(100 - pctUsed).toFixed(0)}% remaining`,
      });
    }
  }

  // 4. Day of the Week Behavioral Insight
  const { peakDay } = computeDayOfWeekStats(transactions);
  if (peakDay && peakDay.count >= 2) {
    insights.push({
      id: 'day-of-week-peak',
      type: 'info',
      title: `${peakDay.dayName} Peak Spending Pattern`,
      message: `Your average daily expense peaks on ${peakDay.dayName} at ₹${peakDay.average.toLocaleString()} (${peakDay.count} transactions recorded).`,
      metric: `Avg ₹${peakDay.average.toLocaleString()}`,
    });
  }

  // 5. Category-Specific Budget Overruns
  for (const b of budgets) {
    const catSpent = expenseTx.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
    const pct = (catSpent / b.limitAmount) * 100;
    if (pct >= 100) {
      insights.push({
        id: `budget-over-${b.id}`,
        type: 'warning',
        title: `${b.category} Over-Budget`,
        message: `Spent ₹${catSpent.toLocaleString()} against a target of ₹${b.limitAmount.toLocaleString()} (${pct.toFixed(0)}% utilized).`,
        metric: `Over by ₹${(catSpent - b.limitAmount).toLocaleString()}`,
        category: b.category,
      });
    }
  }

  // 6. Micro-Transactions Frequency
  const microTx = expenseTx.filter(t => t.amount <= 150);
  if (microTx.length >= 6) {
    const microTotal = microTx.reduce((s, t) => s + t.amount, 0);
    insights.push({
      id: 'micro-transactions',
      type: 'opportunity',
      title: 'Cumulative Impact of Small Purchases',
      message: `${microTx.length} small purchases (≤ ₹150 for chai, snacks, auto) totaled ₹${microTotal.toLocaleString()}, which represents ${((microTotal / totalExpense) * 100).toFixed(1)}% of your total spending.`,
      metric: `₹${microTotal.toLocaleString()} in micro-spends`,
    });
  }

  return insights;
}
