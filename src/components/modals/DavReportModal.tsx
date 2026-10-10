import React from 'react';
import { X, GraduationCap, BarChart2, Calculator, ShieldAlert, Compass, Lightbulb, CheckCircle2 } from 'lucide-react';

interface DavReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DavReportModal: React.FC<DavReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                DAV Academic Project Specification & Viva Documentation
              </h2>
              <p className="text-xs text-slate-500">
                SpendWise: College-level Data Analytics & Visualization Capstone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1: Problem Statement */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Compass size={16} />
              <h3>1. Problem Statement & Motivation</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              College students frequently experience financial stress and cash-flow depletion midway through academic terms. Traditional expense trackers act merely as static digital ledgers without statistical diagnostics, failing to highlight cumulative micro-spending patterns, weekend spending spikes, or pacing deviations relative to time elapsed in the academic month. SpendWise provides students with mathematical transparency, statistical anomaly detection, and automated prescriptive insights.
            </p>
          </section>

          {/* Section 2: Dataset Architecture */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <BarChart2 size={16} />
              <h3>2. Data Model & Attribute Schema</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-1">
                  Primary Dimension Attributes
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><code className="text-[11px] font-mono">date</code> (Temporal: ISO 8601 YYYY-MM-DD)</li>
                  <li><code className="text-[11px] font-mono">category</code> (Nominal categorical: 11 distinct classes)</li>
                  <li><code className="text-[11px] font-mono">type</code> (Binary: Expense vs. Income)</li>
                  <li><code className="text-[11px] font-mono">paymentMethod</code> (Nominal: UPI, Cash, Cards, Net Banking)</li>
                  <li><code className="text-[11px] font-mono">tags</code> (Multi-valued categorical array)</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-1">
                  Quantitative Measure Attributes
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><code className="text-[11px] font-mono">amount</code> (Continuous ratio-scale financial variable)</li>
                  <li><code className="text-[11px] font-mono">limitAmount</code> (Budget ceiling per category/month)</li>
                  <li><code className="text-[11px] font-mono">warningThreshold</code> (Percentage trigger point: 50–100%)</li>
                  <li><code className="text-[11px] font-mono">userId</code> (Relational foreign key for strict data scoping)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Analytics Methods */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Calculator size={16} />
              <h3>3. Mathematical & Analytical Methods</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-1">
                  Descriptive Measures
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mean Daily Expense (<span className="font-mono">μ = Σx / N_days</span>), Median (<span className="font-mono">Q2</span>), Variance (<span className="font-mono">σ² = Σ(x - μ)² / N</span>), and Standard Deviation (<span className="font-mono">σ</span>) alongside Interquartile Range (<span className="font-mono">IQR = Q3 - Q1</span>) to provide robust dispersion bounds resilient to outliers.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-1">
                  Statistical Anomaly Engine
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Calculates baseline mean and standard deviation per category. Transactions with standard score <span className="font-mono">Z = (x - μ) / σ ≥ 2.0</span> are flagged transparently, explaining the exact multiple over normal spending to prevent financial surprises.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-1">
                  Budget Burn-Rate & Pacing
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Projects month-end spending via linear burn rate: <span className="font-mono">Projected = (Spent / Elapsed_Days) × Total_Month_Days</span>. Warns when actual velocity outpaces linear budget allocation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Visualizations */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <BarChart2 size={16} />
              <h3>4. Visualization Framework & Justifications</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Category Distribution Donut:</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Provides immediate part-to-whole visual ratio without visual distortion; center readout shows total volume.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Daily Spending Area & Moving Average:</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Displays high-frequency daily fluctuations alongside a 3-day smoothed trend line to separate noise from sustained shifts.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Budget vs. Actual Bar Comparison:</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Direct side-by-side bar length comparison with green/amber/red color-coding based on configurable thresholds.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Day-of-Week Behavioral Bar Chart:</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Aggregates expenses from Monday through Sunday to expose cyclical weekend spending spikes typical in student demographics.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Faculty Demo Guide */}
          <section className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Lightbulb size={16} />
              <span>How to Demonstrate to Faculty / Viva Evaluators</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <li><strong>Strict User Data Separation:</strong> Switch between <em>Priya Sharma (Hosteller)</em> and <em>Rohan Verma (Day Scholar)</em> in the sidebar. Show that transaction tallies, budgets, and charts adapt completely without data bleeding.</li>
              <li><strong>Dynamic Metric Reactivity:</strong> Click <em>+ Add Transaction</em>, add an expense of ₹2,500 under Food, and observe the KPI cards, Donut chart, and Anomaly engine update in real time.</li>
              <li><strong>Statistical Outlier Verification:</strong> Navigate to <em>Analytics (DAV)</em> and show the Outlier table explaining the Z-score calculation.</li>
              <li><strong>CSV Import Pipeline:</strong> Go to <em>Import / Export</em>, download the sample CSV, or upload a test file to verify batch validation, error catching, and instant ingestion.</li>
              <li><strong>Theme & Viewport Responsiveness:</strong> Toggle Dark/Light mode and resize window to demonstrate responsive desktop grids and mobile drawers.</li>
            </ol>
          </section>

          {/* Section 6: Limitations */}
          <section className="space-y-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <ShieldAlert size={14} />
              <span>Project Limitations & Academic Scope</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Z-score anomaly detection assumes quasi-normal baseline distributions; for smaller datasets (&lt; 5 records per category), robust non-parametric IQR fences are utilized. Multi-currency real-time exchange rates are currently simulated at fixed pegs; automated bank SMS scraping is not implemented to preserve user data privacy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
