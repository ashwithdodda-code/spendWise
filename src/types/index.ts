export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  type: TransactionType;
  merchant?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string; // 'Overall' or specific category name
  limitAmount: number;
  month: string; // YYYY-MM
  warningThreshold?: number; // 75, 90, 100
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  currency: string; // 'INR', 'USD', 'EUR', 'GBP'
  currencySymbol: string; // '₹', '$', '€', '£'
  monthlyBudget: number;
  theme: 'system' | 'light' | 'dark';
  alertThresholds: number[]; // e.g. [75, 90, 100]
  isDemoUser?: boolean;
  avatarSeed?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DateFilterPreset = 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'prevMonth' | 'custom';

export interface DateFilter {
  preset: DateFilterPreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface AnomalyItem {
  transaction: Transaction;
  reason: string;
  baselineMean: number;
  baselineStdDev: number;
  zScore: number;
  severity: 'moderate' | 'high' | 'critical';
}

export interface RuleInsight {
  id: string;
  type: 'warning' | 'positive' | 'info' | 'opportunity';
  title: string;
  message: string;
  metric?: string;
  category?: string;
}

export interface DayOfWeekStat {
  dayName: string;
  shortName: string;
  total: number;
  count: number;
  average: number;
}

export interface CategoryMetric {
  category: string;
  total: number;
  percentage: number;
  count: number;
  avgAmount: number;
  color: string;
}

export interface DAVDescriptiveStats {
  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number; // percentage
  meanDailyExpense: number;
  medianExpense: number;
  minExpense: number;
  maxExpense: number;
  stdDevExpense: number;
  varianceExpense: number;
  iqrExpense: number;
  q1Expense: number;
  q3Expense: number;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
}
