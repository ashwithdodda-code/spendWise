import React, { useState } from 'react';
import { X, Cloud, CheckCircle2, Copy, Shield, Database, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { isFirebaseActive, user } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);
  const [configJson, setConfigJson] = useState(() => {
    return localStorage.getItem('spendwise_firebase_config') || '';
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    try {
      if (!configJson.trim()) {
        localStorage.removeItem('spendwise_firebase_config');
        setSaveStatus('Removed custom config. Running in Demo Mode.');
        setTimeout(() => window.location.reload(), 800);
        return;
      }
      const parsed = JSON.parse(configJson);
      if (!parsed.apiKey || !parsed.projectId) {
        setSaveStatus('Config must contain at least "apiKey" and "projectId".');
        return;
      }
      localStorage.setItem('spendwise_firebase_config', JSON.stringify(parsed));
      setSaveStatus('Saved successfully! Reloading application to initialize Firebase...');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setSaveStatus('Invalid JSON format. Please verify your Firebase config object.');
    }
  };

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    match /users/{userId} {
      allow get, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{id} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /budgets/{id} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <Database className="text-teal-600 dark:text-teal-400" size={20} />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Database & Cloud Storage Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Cloud Firestore & Isolated Demo Sandbox Architecture
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isFirebaseActive
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
              : 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20'
          }`}>
            {isFirebaseActive ? (
              <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <Cloud size={18} className="text-teal-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Current Engine: {isFirebaseActive ? 'Live Cloud Firestore Connected' : 'Interactive Demo Sandbox (Local Isolation)'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {isFirebaseActive
                  ? 'All student transactions and budgets are synchronized directly with your remote Cloud Firestore project, secured via Attribute-Based Access Control (ABAC).'
                  : 'Running in the student sandbox. User data is strictly partitioned by authenticated user ID (Priya Sharma, Rohan Verma, or custom student profile) so accounts never mix.'}
              </p>
            </div>
          </div>

          {/* Connect Firebase Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Connect to Your Google Firebase Project (Optional)
            </h3>
            <p className="text-slate-500 leading-relaxed">
              To persist transactions across different devices with Google Cloud, paste your Firebase web config JSON below:
            </p>
            <textarea
              rows={5}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-project-id",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              className="w-full p-3 font-mono text-[11px] border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-teal-500"
            />
            {saveStatus && (
              <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                {saveStatus}
              </p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveConfig}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Save Firebase Config
              </button>
              {configJson && (
                <button
                  onClick={() => {
                    setConfigJson('');
                    localStorage.removeItem('spendwise_firebase_config');
                    setSaveStatus('Cleared config.');
                    setTimeout(() => window.location.reload(), 600);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                >
                  Clear & Revert to Demo Mode
                </button>
              )}
            </div>
          </div>

          {/* Security Rules Preview */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Shield size={14} className="text-teal-600" />
                <span>Configured Firestore Security Rules (firestore.rules)</span>
              </div>
              <button
                onClick={copyRulesToClipboard}
                className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
              >
                <Copy size={12} />
                <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
              </button>
            </div>
            <pre className="p-3 font-mono text-[10px] bg-slate-900 text-slate-200 rounded-lg overflow-x-auto max-h-36">
              {sampleRules}
            </pre>
            <p className="text-[11px] text-slate-500">
              The project root includes complete <code className="font-mono">firestore.rules</code> with default-deny, input constraints, and strict <code className="font-mono">request.auth.uid</code> owner validation.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
