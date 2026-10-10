import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  parseCSVFile,
  CSVParseResult,
  downloadSampleCSV,
  exportTransactionsToCSV,
  exportAnalyticsSummaryToCSV
} from '../../utils/csv';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ImportExportView: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    filteredTransactions,
    importTransactionsBatch,
    stats,
    categoryMetrics,
    dateFilter,
  } = useData();

  const sym = user?.currencySymbol || '₹';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSuccessCount(null);
    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = parseCSVFile(content);
        setParseResult(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read CSV file. Please verify file encoding and integrity.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const count = await importTransactionsBatch(parseResult.valid);
      setImportSuccessCount(count);
      setParseResult(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMessage(err.message || 'Import operation encountered an unexpected error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportAll = () => {
    exportTransactionsToCSV(
      transactions,
      `spendwise_all_transactions_${user?.displayName?.replace(/\s+/g, '_') || 'student'}.csv`
    );
  };

  const handleExportFiltered = () => {
    exportTransactionsToCSV(
      filteredTransactions,
      `spendwise_filtered_${dateFilter.preset}_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportSummary = () => {
    exportAnalyticsSummaryToCSV(stats, categoryMetrics.metrics);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Section: CSV Importer */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Upload size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Transactions from CSV
              </h2>
              <p className="text-xs text-slate-500">
                Batch ingest personal transactions with automated field mapping and row validation
              </p>
            </div>
          </div>

          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors shrink-0"
          >
            <FileSpreadsheet size={14} />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* Dropzone Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/50"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <Upload size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {fileName ? `Selected: ${fileName}` : 'Click to select CSV file or drag and drop'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Columns supported: Date, Amount, Type, Category, Description, Payment Method, Merchant, Tags
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-xs animate-fade-in-scale">
            <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <span className="font-bold">Import Notice</span>
              <p className="text-[11px] mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Import Success Banner */}
        {importSuccessCount !== null && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs animate-fade-in-scale">
            <CheckCircle2 size={18} className="shrink-0" />
            <div>
              <span className="font-bold">Import Complete!</span>
              <p className="text-[11px]">
                Successfully ingested {importSuccessCount} transactions into your personal ledger. Metrics, charts, and budget pacing have been updated.
              </p>
            </div>
          </div>
        )}

        {/* Parse Results Preview & Validation Table */}
        {parseResult && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ {parseResult.valid.length} Valid Rows
                </span>
                {parseResult.invalid.length > 0 && (
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ✕ {parseResult.invalid.length} Invalid Rows
                  </span>
                )}
              </div>

              <button
                onClick={handleCommitImport}
                disabled={parseResult.valid.length === 0 || isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                {isProcessing ? 'Importing...' : `Commit Import (${parseResult.valid.length} Records)`}
              </button>
            </div>

            {/* Validation Errors list if any */}
            {parseResult.invalid.length > 0 && (
              <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 text-xs space-y-1.5">
                <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle size={15} />
                  <span>Row Validation Issues Caught:</span>
                </div>
                <ul className="list-disc pl-5 text-[11px] text-rose-600 dark:text-rose-300 space-y-0.5">
                  {parseResult.invalid.map((inv, idx) => (
                    <li key={idx}>
                      Row {inv.row}: {inv.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview of first 5 valid records */}
            {parseResult.valid.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Sample Data Ingestion Preview (First 5 of {parseResult.valid.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parseResult.valid.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono text-slate-500">{row.date}</td>
                          <td className="px-3 py-2 font-medium capitalize">{row.type}</td>
                          <td className="px-3 py-2">{row.category}</td>
                          <td className="px-3 py-2">{row.description}</td>
                          <td className="px-3 py-2 font-mono text-right tabular-nums">
                            {formatCurrency(row.amount, sym)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: CSV Exporters */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
            <Download size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Export Student Data & Reports
            </h2>
            <p className="text-xs text-slate-500">
              Download clean CSV files scoped strictly to your authenticated profile
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Export All */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Complete Ledger Export
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download all {transactions.length} lifetime expenses and income records.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>Export All ({transactions.length})</span>
            </button>
          </div>

          {/* Export Filtered */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Filtered Period Export
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download currently filtered records ({filteredTransactions.length} records in {dateFilter.preset}).
              </p>
            </div>
            <button
              onClick={handleExportFiltered}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>Export Filtered ({filteredTransactions.length})</span>
            </button>
          </div>

          {/* Export Statistical Summary */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                DAV Statistical Summary
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download descriptive parameters (Mean, Std Dev, IQR, Median) for college presentation.
              </p>
            </div>
            <button
              onClick={handleExportSummary}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <FileText size={14} />
              <span>Export DAV Metrics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
