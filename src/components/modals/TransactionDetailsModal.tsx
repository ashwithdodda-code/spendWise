import React from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Store,
  Tag,
  Clock,
  Edit2,
  Trash2,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, description: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  if (!isOpen || !transaction) return null;

  const sym = user?.currencySymbol || '₹';
  const catColor = getCategoryColor(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isIncome
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400'
            }`}>
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transaction Details
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {transaction.id.slice(0, 16)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg btn-press"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Amount Hero */}
          <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 ${
              isIncome
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {isIncome ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
              {transaction.type}
            </span>
            <div className={`text-3xl font-extrabold font-mono tabular-nums ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, sym)}
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {transaction.description}
            </p>
          </div>

          {/* Key-Value Details */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag size={14} /> Category:
              </span>
              <span className="font-semibold flex items-center gap-1.5" style={{ color: catColor }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                {transaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar size={14} /> Date:
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {formatDate(transaction.date)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CreditCard size={14} /> Payment Method:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {transaction.paymentMethod}
              </span>
            </div>

            {transaction.merchant && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Store size={14} /> Payee / Merchant:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {transaction.merchant}
                </span>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block mb-1.5">Associated Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {transaction.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(transaction.id, transaction.description);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors btn-press"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors btn-press"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors btn-press"
              >
                <Edit2 size={14} />
                <span>Edit Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
