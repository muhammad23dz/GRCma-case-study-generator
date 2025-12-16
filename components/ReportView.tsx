'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { GeneratedReport } from '@/types';
import { applyReportToPlatform } from '@/app/actions';
import { Download, RefreshCw, Database, CheckCircle, Mail, Shield, AlertTriangle, Users, FileWarning } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ReportViewProps {
  report: GeneratedReport;
  onReset: () => void;
}

export default function ReportView({ report, onReset }: ReportViewProps) {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async (targetEmail: string) => {
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: targetEmail,
          subject: `GRCma Assessment Report - ${new Date().toLocaleDateString()}`,
          htmlContent: `
            <h1>GRCma Assessment Report</h1>
            <p>Report Generated: ${new Date().toLocaleDateString()}</p>
            <p>Controls: ${report.sections?.controls?.length || 0}</p>
            <p>Risks: ${report.sections?.risks?.length || 0}</p>
            <p>Vendors: ${report.sections?.vendors?.length || 0}</p>
            <p>Click below to view full details on the platform.</p>
            <a href="${window.location.origin}/platform">View Full Report</a>
          `
        })
      });

      if (res.ok) {
        alert(t('rep_send_success'));
        setShowEmailModal(false);
      } else {
        throw new Error("Failed to send");
      }
    } catch (e: any) {
      alert(t('rep_send_err') + " " + e.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleImport = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      alert('You must be logged in to push to dashboard');
      return;
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    if (confirm(clearData ?
      'This will REPLACE all your existing GRC data. Continue?' :
      'This will ADD the generated data to your dashboard. Continue?')) {

      setIsImporting(true);
      try {
        await applyReportToPlatform(report, clearData, userEmail);
        setImportSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (e: any) {
        alert('Import failed: ' + e.message);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const data = report.sections || {};
  const controls = data.controls || [];
  const risks = data.risks || [];
  const vendors = data.vendors || [];
  const incidents = data.incidents || [];

  const hasData = controls.length > 0 || risks.length > 0 || vendors.length > 0 || incidents.length > 0;

  return (
    <div className="max-w-5xl mx-auto print:max-w-none print:w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
            GRC Assessment Report
          </h1>
          <p className="text-gray-400">
            Report ID: {report.id} | Generated: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Push to Dashboard - Available to all authenticated users */}
          {user && (
            !importSuccess ? (
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 text-xs text-slate-400 px-2 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={clearData}
                    onChange={(e) => setClearData(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  Replace Mode
                </label>
                <button
                  onClick={handleImport}
                  disabled={isImporting || !hasData}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  {isImporting ? 'Pushing...' : 'Push to Dashboard'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Success! Redirecting...</span>
              </div>
            )
          )}

          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all border border-white/10 flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all border border-white/10 flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all border border-white/10 flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleSendEmail}
        loading={isSendingEmail}
      />

      {/* Summary Stats */}
      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{controls.length}</div>
            <div className="text-sm text-slate-400">Controls</div>
          </div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{risks.length}</div>
            <div className="text-sm text-slate-400">Risks</div>
          </div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{vendors.length}</div>
            <div className="text-sm text-slate-400">Vendors</div>
          </div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 text-center">
            <FileWarning className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{incidents.length}</div>
            <div className="text-sm text-slate-400">Incidents</div>
          </div>
        </div>
      )}

      {!hasData && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center mb-8">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Data Generated</h3>
          <p className="text-slate-400">
            The LLM did not return any GRC entities. This could be due to:
          </p>
          <ul className="text-slate-400 text-sm mt-2 list-disc list-inside">
            <li>API key configuration issues</li>
            <li>Network problems</li>
            <li>The prompt may need adjustment</li>
          </ul>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Controls Section */}
      {controls.length > 0 && (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-2xl border border-emerald-500/20">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Controls ({controls.length})
          </h2>
          <div className="space-y-3">
            {controls.map((c: any, i: number) => (
              <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{c.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{c.description || 'No description'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${c.controlType === 'preventive' ? 'bg-emerald-500/20 text-emerald-400' :
                      c.controlType === 'detective' ? 'bg-blue-500/20 text-blue-400' :
                        c.controlType === 'corrective' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                    }`}>
                    {c.controlType || 'unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks Section */}
      {risks.length > 0 && (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-2xl border border-orange-500/20">
          <h2 className="text-2xl font-bold mb-4 text-orange-400 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Risks ({risks.length})
          </h2>
          <div className="space-y-3">
            {risks.map((r: any, i: number) => (
              <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">{r.category || 'General'}</span>
                    </div>
                    <p className="text-white">{r.narrative || 'No narrative'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-400">
                      {(r.likelihood || 3) * (r.impact || 3)}
                    </div>
                    <div className="text-xs text-slate-400">Risk Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendors Section */}
      {vendors.length > 0 && (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-2xl border border-blue-500/20">
          <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Vendors ({vendors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendors.map((v: any, i: number) => (
              <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                <h3 className="font-bold text-white">{v.name}</h3>
                <p className="text-sm text-slate-400">{v.services || v.category || 'No services listed'}</p>
                {v.riskScore && (
                  <div className="mt-2 text-xs text-blue-400">Risk Score: {v.riskScore}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incidents Section */}
      {incidents.length > 0 && (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-2xl border border-red-500/20">
          <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
            <FileWarning className="w-6 h-6" />
            Incidents ({incidents.length})
          </h2>
          <div className="space-y-3">
            {incidents.map((inc: any, i: number) => (
              <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{inc.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{inc.description || 'No description'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        inc.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                    }`}>
                    {inc.severity || 'unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
        <p>Generated by GRCma Platform • Powered by HMAMOUCH</p>
      </div>
    </div>
  );
}

function EmailModal({ isOpen, onClose, onSubmit, loading }: { isOpen: boolean, onClose: () => void, onSubmit: (e: string) => void, loading: boolean }) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Send Report via Email</h3>
        <input
          type="email"
          placeholder="recipient@example.com"
          className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => onSubmit(email)}
            disabled={loading || !email}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send Report
          </button>
        </div>
      </div>
    </div>
  );
}
