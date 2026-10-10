import Papa from 'papaparse';
import { Transaction, PaymentMethod, TransactionType } from '../types';

export interface CSVParseResult {
  valid: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[];
  invalid: {
    row: number;
    error: string;
    raw: Record<string, any>;
  }[];
}

/**
 * Generates sample CSV text that students can download and inspect
 */
export function getSampleCSVContent(): string {
  return [
    'Date,Amount,Type,Category,Description,Payment Method,Merchant,Tags',
    '2026-10-01,150,expense,Food & Dining,Campus canteen lunch,UPI,Campus Bistro,college;food',
    '2026-10-02,450,expense,Education & Books,Data Structures reference handbook,Debit Card,College Bookstore,academics;cs',
    '2026-10-03,60,expense,Transport,Metro commute to campus,UPI,Delhi Metro,commute',
    '2026-10-04,12000,income,Allowance & Stipend,Monthly parent allowance,Net Banking,Family,pocket-money',
    '2026-10-05,280,expense,Entertainment,Movie ticket with roommates,UPI,PVR Cinemas,social',
    '2026-10-06,3500,expense,Accommodation & Rent,Hostel electricity and mess fee,UPI,Hostel Office,rent;hostel',
    '2026-10-07,180,expense,Health & Medical,Pharmacy fever medication,Cash,Apollo Pharmacy,wellness',
    '2026-10-08,199,expense,Subscriptions,Music streaming student discount,Credit Card,Spotify,music',
    '2026-10-09,4000,income,Freelance & Tutoring,Python programming tutor stipend,UPI,Client,freelance;income'
  ].join('\n');
}

export function downloadSampleCSV(): void {
  const content = getSampleCSVContent();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'spendwise_student_expenses_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports transaction list to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'spendwise_transactions.csv'): void {
  const data = transactions.map(t => ({
    Date: t.date,
    Amount: t.amount,
    Type: t.type,
    Category: t.category,
    Description: t.description,
    'Payment Method': t.paymentMethod,
    Merchant: t.merchant || '',
    Tags: t.tags ? t.tags.join(';') : '',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports comprehensive DAV Statistical Summary Report
 */
export function exportAnalyticsSummaryToCSV(stats: any, categories: any[], filename: string = 'spendwise_dav_analytics_report.csv'): void {
  const summaryRows = [
    { Metric: 'Report Generated At', Value: new Date().toISOString() },
    { Metric: 'Total Recorded Expenses', Value: stats.totalExpense },
    { Metric: 'Total Recorded Income', Value: stats.totalIncome },
    { Metric: 'Net Savings', Value: stats.netSavings },
    { Metric: 'Savings Rate (%)', Value: stats.savingsRate?.toFixed(2) },
    { Metric: 'Mean Daily Expense', Value: stats.meanDailyExpense?.toFixed(2) },
    { Metric: 'Median Expense Amount', Value: stats.medianExpense },
    { Metric: 'Minimum Single Expense', Value: stats.minExpense },
    { Metric: 'Maximum Single Expense', Value: stats.maxExpense },
    { Metric: 'Standard Deviation (σ)', Value: stats.stdDevExpense?.toFixed(2) },
    { Metric: 'Interquartile Range (IQR)', Value: stats.iqrExpense?.toFixed(2) },
    { Metric: 'Total Transactions Logged', Value: stats.transactionCount },
    { Metric: '', Value: '' },
    { Metric: '--- CATEGORY BREAKDOWN ---', Value: '' }
  ];

  for (const c of categories) {
    summaryRows.push({
      Metric: `${c.category} Total`,
      Value: `${c.total} (${c.percentage?.toFixed(1)}%)`
    });
  }

  const csv = Papa.unparse(summaryRows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates CSV string or file content
 */
export function parseCSVFile(csvContent: string): CSVParseResult {
  const result: CSVParseResult = { valid: [], invalid: [] };

  const parsed = Papa.parse<Record<string, any>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s_-]+/g, '')
  });

  if (parsed.errors && parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      result.invalid.push({
        row: err.row || 0,
        error: `CSV formatting error: ${err.message}`,
        raw: {}
      });
    }
  }

  const rows = parsed.data;

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header row

    // Find date
    const rawDate = row['date'] || row['transactiondate'] || row['txndate'] || row['day'];
    let formattedDate = '';
    if (rawDate) {
      const clean = String(rawDate).trim();
      // Try YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        formattedDate = clean;
      } else {
        // Try DD/MM/YYYY or MM/DD/YYYY
        const d = new Date(clean);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }
    }

    if (!formattedDate) {
      result.invalid.push({
        row: rowNum,
        error: 'Invalid or missing date (expected YYYY-MM-DD or standard date format)',
        raw: row
      });
      return;
    }

    // Find amount
    const rawAmount = row['amount'] || row['cost'] || row['price'] || row['value'];
    const amountNum = parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      result.invalid.push({
        row: rowNum,
        error: 'Invalid amount (must be a positive number greater than 0)',
        raw: row
      });
      return;
    }

    // Find type
    const rawType = (row['type'] || row['transactiontype'] || 'expense').toLowerCase();
    const type: TransactionType = rawType.includes('in') ? 'income' : 'expense';

    // Find category
    let category = row['category'] || (type === 'income' ? 'Allowance & Stipend' : 'Food & Dining');
    category = String(category).trim();
    if (!category) {
      category = type === 'income' ? 'Income' : 'Other';
    }

    // Find description
    const description = String(row['description'] || row['desc'] || row['note'] || row['merchant'] || 'Expense').trim();

    // Find payment method
    let paymentMethod: PaymentMethod = 'UPI';
    const rawMethod = String(row['paymentmethod'] || row['method'] || row['payment'] || 'UPI').toUpperCase();
    if (rawMethod.includes('CASH')) paymentMethod = 'Cash';
    else if (rawMethod.includes('DEBIT')) paymentMethod = 'Debit Card';
    else if (rawMethod.includes('CREDIT')) paymentMethod = 'Credit Card';
    else if (rawMethod.includes('NET') || rawMethod.includes('BANK')) paymentMethod = 'Net Banking';
    else if (rawMethod.includes('OTHER')) paymentMethod = 'Other';

    // Merchant & tags
    const merchant = row['merchant'] ? String(row['merchant']).trim() : undefined;
    const rawTags = row['tags'] || row['tag'];
    let tags: string[] | undefined;
    if (rawTags) {
      tags = String(rawTags).split(/[;,]/).map(t => t.trim()).filter(Boolean);
    }

    result.valid.push({
      amount: Math.round(amountNum * 100) / 100,
      category,
      date: formattedDate,
      description: description.slice(0, 200),
      paymentMethod,
      type,
      merchant: merchant ? merchant.slice(0, 100) : undefined,
      tags: tags ? tags.slice(0, 5) : undefined,
    });
  });

  return result;
}
