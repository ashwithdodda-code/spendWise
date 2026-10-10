import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthView } from './components/auth/AuthView';
import { OverviewView } from './components/views/OverviewView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BudgetsView } from './components/views/BudgetsView';
import { InsightsView } from './components/views/InsightsView';
import { ImportExportView } from './components/views/ImportExportView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { DavReportModal } from './components/modals/DavReportModal';
import { FirebaseSetupModal } from './components/modals/FirebaseSetupModal';
import { Transaction, Budget } from './types';
import { CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useData();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isDavModalOpen, setIsDavModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'transaction' | 'budget';
    id: string;
    label: string;
  }>({
    isOpen: false,
    type: 'transaction',
    id: '',
    label: '',
  });

  // Toast feedback notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // If loading authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Initializing SpendWise workspace...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render login/signup
  if (!user) {
    return <AuthView />;
  }

  // Transaction modal handlers
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = async (txData: any, existingId?: string) => {
    if (existingId && editingTx) {
      await updateTransaction({ ...editingTx, ...txData });
      showToast('Transaction record updated.');
    } else {
      await addTransaction(txData);
      showToast('New transaction recorded.');
    }
  };

  const handlePromptDeleteTx = (id: string, description: string) => {
    setDeleteModalState({
      isOpen: true,
      type: 'transaction',
      id,
      label: description,
    });
  };

  // Budget modal handlers
  const handleOpenBudgetModal = (initial?: Budget) => {
    setEditingBudget(initial || null);
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async (budgetData: any, existingId?: string) => {
    if (existingId && editingBudget) {
      await updateBudget({ ...editingBudget, ...budgetData });
      showToast('Budget target updated.');
    } else {
      await createBudget(budgetData);
      showToast('New category budget configured.');
    }
  };

  const handlePromptDeleteBudget = (id: string, category: string) => {
    setDeleteModalState({
      isOpen: true,
      type: 'budget',
      id,
      label: `${category} Budget`,
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (deleteModalState.type === 'transaction') {
      await deleteTransaction(deleteModalState.id);
      showToast('Transaction deleted.');
    } else if (deleteModalState.type === 'budget') {
      await deleteBudget(deleteModalState.id);
      showToast('Budget target removed.');
    }
    setDeleteModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-teal-400 dark:text-teal-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenDavReport={() => setIsDavModalOpen(true)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <div
          className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Header Bar */}
          <Header
            currentTab={currentTab}
            onNavigateTab={setCurrentTab}
            onOpenAddModal={handleOpenAddTx}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
            onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
            onOpenDavReport={() => setIsDavModalOpen(true)}
          />

          {/* Active View Content with Smooth Tab Transitions */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {currentTab === 'overview' && (
                  <OverviewView
                    onNavigateTab={setCurrentTab}
                    onOpenAddModal={handleOpenAddTx}
                    onEditTransaction={handleEditTx}
                    onOpenBudgetModal={handleOpenBudgetModal}
                  />
                )}
                {currentTab === 'transactions' && (
                  <TransactionsView
                    onOpenAddModal={handleOpenAddTx}
                    onEditTransaction={handleEditTx}
                    onDeleteTransaction={handlePromptDeleteTx}
                  />
                )}
                {currentTab === 'analytics' && <AnalyticsView />}
                {currentTab === 'budgets' && (
                  <BudgetsView
                    onOpenBudgetModal={handleOpenBudgetModal}
                    onDeleteBudget={handlePromptDeleteBudget}
                  />
                )}
                {currentTab === 'insights' && <InsightsView />}
                {currentTab === 'import_export' && <ImportExportView />}
                {currentTab === 'settings' && (
                  <SettingsView onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTx}
        initialData={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        initialData={editingBudget}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={`Delete ${deleteModalState.type === 'transaction' ? 'Transaction' : 'Budget'}?`}
        message={`Are you sure you want to permanently delete "${deleteModalState.label}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <DavReportModal
        isOpen={isDavModalOpen}
        onClose={() => setIsDavModalOpen(false)}
      />

      <FirebaseSetupModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
