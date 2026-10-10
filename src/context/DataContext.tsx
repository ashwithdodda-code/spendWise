import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Budget,
  DateFilter,
  DateFilterPreset,
  DAVDescriptiveStats,
  CategoryMetric,
  DayOfWeekStat,
  AnomalyItem,
  RuleInsight
} from '../types';
import { useAuth } from './AuthContext';
import {
  getUserTransactions,
  saveTransaction,
  deleteTransaction as removeStorageTx,
  getUserBudgets,
  saveBudget,
  deleteBudget as removeStorageBudget,
  resetDemoData
} from '../services/storage';
import {
  computeDescriptiveStats,
  computeCategoryMetrics,
  computeDailyTrends,
  DailyTrendPoint,
  computeMonthlyComparison,
  MonthlyComparisonPoint,
  computeDayOfWeekStats,
  detectAnomalies,
  generateAutomatedInsights
} from '../utils/analytics';

interface BudgetComparisonItem {
  id: string;
  category: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
}

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  dateFilter: DateFilter;
  setDateFilterPreset: (preset: DateFilterPreset, customStart?: string, customEnd?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  typeFilter: 'all' | 'expense' | 'income';
  setTypeFilter: (t: 'all' | 'expense' | 'income') => void;

  // Filtered dataset
  filteredTransactions: Transaction[];
  periodTransactions: Transaction[];

  // Analytics
  stats: DAVDescriptiveStats;
  categoryMetrics: {
    metrics: CategoryMetric[];
    highestCategory: CategoryMetric | null;
    lowestCategory: CategoryMetric | null;
  };
  dailyTrends: DailyTrendPoint[];
  monthlyComparison: MonthlyComparisonPoint[];
  dayOfWeekStats: {
    days: DayOfWeekStat[];
    peakDay: DayOfWeekStat | null;
  };
  anomalies: AnomalyItem[];
  insights: RuleInsight[];
  budgetComparisons: BudgetComparisonItem[];
  overallBudgetComparison: BudgetComparisonItem | null;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactionsBatch: (ids: string[]) => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  importTransactionsBatch: (items: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[]) => Promise<number>;
  reloadUserData: () => Promise<void>;
  resetCurrentDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function calculateDateRange(preset: DateFilterPreset): { start: string; end: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (preset === 'today') {
    return { start: todayStr, end: todayStr };
  }

  if (preset === '7days') {
    const prior = new Date(today);
    prior.setDate(today.getDate() - 6);
    const pmm = String(prior.getMonth() + 1).padStart(2, '0');
    const pdd = String(prior.getDate()).padStart(2, '0');
    return { start: `${prior.getFullYear()}-${pmm}-${pdd}`, end: todayStr };
  }

  if (preset === '30days') {
    const prior = new Date(today);
    prior.setDate(today.getDate() - 29);
    const pmm = String(prior.getMonth() + 1).padStart(2, '0');
    const pdd = String(prior.getDate()).padStart(2, '0');
    return { start: `${prior.getFullYear()}-${pmm}-${pdd}`, end: todayStr };
  }

  if (preset === 'thisMonth') {
    return { start: `${yyyy}-${mm}-01`, end: todayStr };
  }

  if (preset === 'prevMonth') {
    const priorMonth = new Date(yyyy, today.getMonth() - 1, 1);
    const py = priorMonth.getFullYear();
    const pm = String(priorMonth.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(py, priorMonth.getMonth() + 1, 0).getDate();
    return { start: `${py}-${pm}-01`, end: `${py}-${pm}-${String(lastDay).padStart(2, '0')}` };
  }

  // 'all'
  return { start: '2020-01-01', end: '2030-12-31' };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const range = calculateDateRange('thisMonth');
    return {
      preset: 'thisMonth',
      startDate: range.start,
      endDate: range.end,
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  const loadData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [txList, bList] = await Promise.all([
        getUserTransactions(user.userId),
        getUserBudgets(user.userId),
      ]);
      setTransactions(txList);
      setBudgets(bList);
    } catch (err) {
      console.error('Failed to load user transactions and budgets', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setDateFilterPreset = (preset: DateFilterPreset, customStart?: string, customEnd?: string) => {
    if (preset === 'custom' && customStart && customEnd) {
      setDateFilter({ preset: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      const range = calculateDateRange(preset);
      setDateFilter({ preset, startDate: range.start, endDate: range.end });
    }
  };

  // 1. Transactions matching period filter (for period analytics)
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (dateFilter.preset === 'all') return true;
      return t.date >= dateFilter.startDate && t.date <= dateFilter.endDate;
    });
  }, [transactions, dateFilter]);

  // 2. Filtered transactions (with search, category, and type filters applied)
  const filteredTransactions = useMemo(() => {
    return periodTransactions.filter(t => {
      // Type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      // Category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesMerchant = t.merchant ? t.merchant.toLowerCase().includes(query) : false;
        const matchesTags = t.tags ? t.tags.some(tag => tag.toLowerCase().includes(query)) : false;
        return matchesDesc || matchesCategory || matchesMerchant || matchesTags;
      }
      return true;
    });
  }, [periodTransactions, typeFilter, selectedCategory, searchQuery]);

  // Analytics derived from periodTransactions
  const stats = useMemo(() => computeDescriptiveStats(periodTransactions), [periodTransactions]);
  const categoryMetrics = useMemo(() => computeCategoryMetrics(periodTransactions), [periodTransactions]);
  const dailyTrends = useMemo(() => computeDailyTrends(periodTransactions), [periodTransactions]);
  const monthlyComparison = useMemo(() => computeMonthlyComparison(transactions), [transactions]);
  const dayOfWeekStats = useMemo(() => computeDayOfWeekStats(periodTransactions), [periodTransactions]);
  const anomalies = useMemo(() => detectAnomalies(periodTransactions), [periodTransactions]);
  const insights = useMemo(() => {
    return generateAutomatedInsights(periodTransactions, budgets, user?.monthlyBudget || 0);
  }, [periodTransactions, budgets, user?.monthlyBudget]);

  // Budget vs Actual for current period
  const { budgetComparisons, overallBudgetComparison } = useMemo(() => {
    const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g. '2026-10'
    const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthKey));

    const comparisons: BudgetComparisonItem[] = [];
    let overallItem: BudgetComparisonItem | null = null;

    // Check user's overall budget
    const overallLimit = user?.monthlyBudget || 0;
    if (overallLimit > 0) {
      const overallSpent = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);
      const pct = (overallSpent / overallLimit) * 100;
      let status: BudgetComparisonItem['status'] = 'normal';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 90) status = 'critical';
      else if (pct >= 75) status = 'warning';

      overallItem = {
        id: 'budget-overall',
        category: 'Overall Budget',
        limitAmount: overallLimit,
        spent: overallSpent,
        remaining: Math.max(overallLimit - overallSpent, 0),
        percentageUsed: pct,
        status,
      };
    }

    // Category budgets
    for (const b of budgets) {
      if (b.category === 'Overall') continue;
      const spent = currentMonthExpenses
        .filter(t => t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      const pct = (spent / b.limitAmount) * 100;

      let status: BudgetComparisonItem['status'] = 'normal';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 90) status = 'critical';
      else if (pct >= 75) status = 'warning';

      comparisons.push({
        id: b.id,
        category: b.category,
        limitAmount: b.limitAmount,
        spent,
        remaining: Math.max(b.limitAmount - spent, 0),
        percentageUsed: pct,
        status,
      });
    }

    return { budgetComparisons: comparisons, overallBudgetComparison: overallItem };
  }, [transactions, budgets, user?.monthlyBudget]);

  // CRUD actions
  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.userId,
      createdAt: new Date().toISOString(),
    };
    await saveTransaction(user.userId, newTx);
    setTransactions(prev => [newTx, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  };

  const updateTransaction = async (updated: Transaction) => {
    if (!user) return;
    await saveTransaction(user.userId, updated);
    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)).sort((a, b) => b.date.localeCompare(a.date)));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await removeStorageTx(user.userId, id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteTransactionsBatch = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    for (const id of ids) {
      await removeStorageTx(user.userId, id);
    }
    setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
  };

  const createBudget = async (data: Omit<Budget, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newBudget: Budget = {
      ...data,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.userId,
      createdAt: new Date().toISOString(),
    };
    await saveBudget(user.userId, newBudget);
    setBudgets(prev => [...prev.filter(b => b.category !== newBudget.category), newBudget]);
  };

  const updateBudget = async (updated: Budget) => {
    if (!user) return;
    await saveBudget(user.userId, updated);
    setBudgets(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    await removeStorageBudget(user.userId, id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const importTransactionsBatch = async (items: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[]): Promise<number> => {
    if (!user || items.length === 0) return 0;
    const now = Date.now();
    const created: Transaction[] = items.map((item, idx) => ({
      ...item,
      id: `tx_imp_${now}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
      userId: user.userId,
      createdAt: new Date().toISOString(),
    }));

    for (const t of created) {
      await saveTransaction(user.userId, t);
    }

    setTransactions(prev => [...created, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    return created.length;
  };

  const resetCurrentDemoData = async () => {
    if (!user) return;
    resetDemoData(user.userId);
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        budgets,
        loading,
        dateFilter,
        setDateFilterPreset,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        typeFilter,
        setTypeFilter,
        filteredTransactions,
        periodTransactions,
        stats,
        categoryMetrics,
        dailyTrends,
        monthlyComparison,
        dayOfWeekStats,
        anomalies,
        insights,
        budgetComparisons,
        overallBudgetComparison,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        deleteTransactionsBatch,
        createBudget,
        updateBudget,
        deleteBudget,
        importTransactionsBatch,
        reloadUserData: loadData,
        resetCurrentDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
