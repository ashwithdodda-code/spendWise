export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#0D9488', // teal-600
  'Food': '#0D9488',
  'Transport': '#2563EB', // blue-600
  'Education & Books': '#7C3AED', // violet-600
  'Education': '#7C3AED',
  'Accommodation & Rent': '#0284C7', // sky-600
  'Accommodation': '#0284C7',
  'Shopping': '#D97706', // amber-600
  'Entertainment': '#EC4899', // pink-500
  'Health & Medical': '#10B981', // emerald-500
  'Health': '#10B981',
  'Bills & Utilities': '#6366F1', // indigo-500
  'Bills': '#6366F1',
  'Subscriptions': '#8B5CF6', // purple-500
  'Personal Care': '#14B8A6', // teal-500
  'Allowance & Stipend': '#059669', // green-600 (income)
  'Freelance & Tutoring': '#16A34A', // green-600 (income)
  'Scholarship': '#047857',
  'Other': '#64748B', // slate-500
};

export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Education & Books',
  'Accommodation & Rent',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Bills & Utilities',
  'Subscriptions',
  'Personal Care',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Allowance & Stipend',
  'Part-time Job',
  'Freelance & Tutoring',
  'Scholarship',
  'Gift / Award',
  'Other Income'
];

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#64748B';
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || !isFinite(amount)) return `${symbol}0`;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Formatting with standard locale for currency
  const parts = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2
  });

  return `${isNegative ? '-' : ''}${symbol}${parts}`;
}

export function formatPercentage(val: number, includeSign: boolean = false): string {
  if (isNaN(val) || !isFinite(val)) return '0%';
  const rounded = Math.round(val * 10) / 10;
  if (includeSign && rounded > 0) {
    return `+${rounded}%`;
  }
  return `${rounded}%`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
