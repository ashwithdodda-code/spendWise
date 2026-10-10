import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, CreditCard, Store, FileText, PlusCircle, Check } from 'lucide-react';
import { Transaction, PaymentMethod, TransactionType } from '../../types';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>, existingId?: string) => Promise<void>;
  initialData?: Transaction | null;
}

const SUGGESTED_EXPENSE_TAGS = ['canteen', 'commute', 'books', 'hostel', 'snacks', 'exam', 'friends'];
const SUGGESTED_INCOME_TAGS = ['allowance', 'stipend', 'tutoring', 'freelance', 'cashback'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description);
      setPaymentMethod(initialData.paymentMethod);
      setMerchant(initialData.merchant || '');
      setTagInput(initialData.tags ? initialData.tags.join(', ') : '');
      const isCustom = !DEFAULT_CATEGORIES.includes(initialData.category) && !INCOME_CATEGORIES.includes(initialData.category);
      setIsCustomCategory(isCustom);
      if (isCustom) {
        setCustomCategory(initialData.category);
      }
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('UPI');
      setMerchant('');
      setTagInput('');
      setIsCustomCategory(false);
      setCustomCategory('');
    }
    setError(null);
  }, [initialData, isOpen]);

  // Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addValue: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount((cur + addValue).toString());
  };

  const handleToggleSuggestedTag = (tag: string) => {
    const currentTags = tagInput.split(/[,;]/).map(t => t.trim()).filter(Boolean);
    if (currentTags.includes(tag)) {
      setTagInput(currentTags.filter(t => t !== tag).join(', '));
    } else {
      setTagInput([...currentTags, tag].join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid positive amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description for this transaction.');
      return;
    }

    if (!date) {
      setError('Please select a valid transaction date.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please select or specify a category.');
      return;
    }

    const tags = tagInput
      ? tagInput
          .split(/[,;]/)
          .map(t => t.trim())
          .filter(Boolean)
      : undefined;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          amount: Math.round(parsedAmount * 100) / 100,
          category: finalCategory,
          date,
          description: description.trim(),
          paymentMethod,
          type,
          merchant: merchant.trim() || undefined,
          tags,
        },
        initialData?.id
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'expense' ? DEFAULT_CATEGORIES : INCOME_CATEGORIES;
  const suggestedTags = type === 'expense' ? SUGGESTED_EXPENSE_TAGS : SUGGESTED_INCOME_TAGS;
  const activeTagsList = tagInput.split(/[,;]/).map(t => t.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Transaction Record' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-500">
              Student financial ledger entry in {user?.currencySymbol || '₹'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg btn-press"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-lg animate-fade-in-scale">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense / Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Food & Dining');
                setIsCustomCategory(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all btn-press ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Allowance & Stipend');
                setIsCustomCategory(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all btn-press ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount ({user?.currencySymbol || '₹'}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                  {user?.currencySymbol || '₹'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tabular-nums focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Quick increment buttons */}
              <div className="flex items-center gap-1 mt-1.5">
                {[50, 100, 500, 1000].map(addVal => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => handleQuickAddAmount(addVal)}
                    className="px-2 py-0.5 text-[10px] font-mono font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 btn-press"
                  >
                    +{addVal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                {isCustomCategory ? 'Use Standard Category' : '+ Add Custom Category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                placeholder="e.g. Lab Equipment, Gym, Stationery"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description / Note *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Canteen lunch thali with classmates"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Payment Method & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Merchant / Payee (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Campus Xerox, Blinkit"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Tags with Quick Suggestion Chips */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags (Optional, separated by comma)
            </label>
            <input
              type="text"
              placeholder="e.g. exam, hostel, semester5, project"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            />
            {/* Quick suggested chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Suggestions:</span>
              {suggestedTags.map((tag) => {
                const isActive = activeTagsList.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleSuggestedTag(tag)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors btn-press ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors btn-press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors disabled:opacity-50 btn-press"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
