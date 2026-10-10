import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  ArrowUpDown,
  Download,
  Receipt,
  Tag,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../utils/csv';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from '../../utils/formatters';
import { TransactionDetailsModal } from '../modals/TransactionDetailsModal';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';

interface TransactionsViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string, description: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const { user } = useAuth();
  const {
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    typeFilter,
    setTypeFilter,
    dateFilter,
    deleteTransactionsBatch,
  } = useData();

  const sym = user?.currencySymbol || '₹';

  // Sort state
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected item for details modal
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<Transaction | null>(null);

  // Multi-select bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Combine categories for dropdown
  const allCategories = ['all', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES]))];

  // Sorting logic
  const sorted = [...filteredTransactions].sort((a, b) => {
    if (sortField === 'date') {
      const cmp = a.date.localeCompare(b.date);
      return sortOrder === 'desc' ? -cmp : cmp;
    }
    if (sortField === 'amount') {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
    if (sortField === 'category') {
      const cmp = a.category.localeCompare(b.category);
      return sortOrder === 'desc' ? -cmp : cmp;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportFiltered = () => {
    exportTransactionsToCSV(
      sorted,
      `spendwise_filtered_${dateFilter.preset}_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportSelected = () => {
    const selectedRecords = sorted.filter(t => selectedIds.includes(t.id));
    exportTransactionsToCSV(
      selectedRecords,
      `spendwise_selected_${selectedRecords.length}_records.csv`
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map(t => t.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePromptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    await deleteTransactionsBatch(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleting(false);
    setIsBulkDeleteModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || typeFilter !== 'all';

  // Sub-metrics of filtered list
  const filteredExpenseTotal = sorted.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const filteredIncomeTotal = sorted.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 pb-12 animate-fade-in-up">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by note, merchant, category, or tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter transactions by category"
            className="px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {allCategories.filter(c => c !== 'all').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            aria-label="Filter transactions by type"
            className="px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              title="Reset all filters and search query"
              className="flex items-center gap-1 px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors btn-press"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* Export CSV button */}
          <button
            onClick={handleExportFiltered}
            title="Export filtered records to CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 transition-colors btn-press"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-2xs transition-colors btn-press"
          >
            <Plus size={15} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>Total matches: <strong>{sorted.length}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Expenses: <strong className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(filteredExpenseTotal, sym)}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Income: <strong className="font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(filteredIncomeTotal, sym)}</strong></span>
        </div>
        {selectedIds.length > 0 && (
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            {selectedIds.length} records selected
          </span>
        )}
      </div>

      {/* Transactions Table & Mobile Cards */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.length === paginated.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all transactions on current page"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-4 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3">Description & Merchant</th>
                <th
                  onClick={() => toggleSort('category')}
                  className="px-4 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Tags</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-4 py-3 text-right cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount ({sym})</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.length > 0 ? (
                paginated.map((t) => {
                  const catColor = getCategoryColor(t.category);
                  const isChecked = selectedIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTxForDetails(t)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group ${
                        isChecked ? 'bg-teal-50/50 dark:bg-teal-950/30' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectRow(t.id, e as any)}
                          aria-label={`Select transaction ${t.description}`}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {t.description}
                        </div>
                        {t.merchant && (
                          <div className="text-[11px] text-slate-400">
                            {t.merchant}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                          style={{ color: catColor }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        {t.tags && t.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] text-slate-500 font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, sym)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedTxForDetails(t)}
                            title="View Transaction Details"
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onEditTransaction(t)}
                            title="Edit Transaction"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(t.id, t.description)}
                            title="Delete Transaction"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    <p className="mb-2">No transactions match your query or filters.</p>
                    {hasActiveFilters ? (
                      <button
                        onClick={handleClearFilters}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Reset active filters
                      </button>
                    ) : (
                      <button
                        onClick={onOpenAddModal}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        + Log your first transaction
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginated.length > 0 ? (
            paginated.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTxForDetails(t)}
                className="p-4 space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.description}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(t.date)} · {t.category}
                    </p>
                  </div>
                  <div className={`text-sm font-bold font-mono tabular-nums ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, sym)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500" onClick={(e) => e.stopPropagation()}>
                  <span>Method: {t.paymentMethod}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditTransaction(t)}
                      className="text-teal-600 font-medium btn-press"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(t.id, t.description)}
                      className="text-rose-600 font-medium btn-press"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No transactions found.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors btn-press"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors btn-press"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar when rows are selected */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 animate-fade-in-scale">
          <span className="text-xs font-semibold">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-slate-700 dark:bg-slate-300" />
          <button
            onClick={handleExportSelected}
            className="flex items-center gap-1 text-xs font-medium hover:underline btn-press"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePromptBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-1 text-xs font-semibold text-rose-400 dark:text-rose-600 hover:underline btn-press"
          >
            <Trash2 size={13} />
            <span>{isBulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white dark:hover:text-slate-900 ml-1 btn-press"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Full Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={selectedTxForDetails !== null}
        onClose={() => setSelectedTxForDetails(null)}
        transaction={selectedTxForDetails}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />

      {/* Bulk Delete In-App Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Transactions?"
        message={`Are you sure you want to permanently delete all ${selectedIds.length} selected transaction records? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.length} Records`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  );
};
