import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  FileCheck,
  Building2,
  ExternalLink,
  Printer
} from 'lucide-react';
import { Machine } from '../types';
import { getReportDownloadUrl } from '../services/api';

interface ReportsPageProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ 
  machines,
  onSelectMachine
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    const url = getReportDownloadUrl(id);
    window.open(url, '_blank');
    setTimeout(() => setDownloadingId(null), 1500);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span>Industrial Machine Health & Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate formal multi-page engineering PDF reports with telemetry history, ML diagnostics, and ISO 55000 compliance logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 font-mono font-semibold">
            ReportLab PDF Engine
          </span>
        </div>
      </div>

      {/* Reports Feature Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-900/40 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Standardized Escorts Kubota Machine Health Documentation</span>
          </div>
          <p className="text-slate-300 text-[11px] max-w-2xl leading-relaxed">
            Each downloadable PDF report includes comprehensive equipment metadata, live sensor telemetry compared against engineering baselines, Isolation Forest anomaly scores, Random Forest failure probabilities, and prioritized maintenance action items.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => handleDownload('CNC-001')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition-all text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Sample Report (CNC-001)</span>
          </button>
        </div>
      </div>

      {/* Grid of 8 Machine Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {machines.map((m) => {
          const isCritical = m.status === 'critical';
          const isWarning = m.status === 'warning';

          return (
            <div
              key={m.id}
              className={`bg-slate-900 border rounded-xl p-4 shadow-xl transition-all space-y-3 flex flex-col justify-between ${
                isCritical ? 'border-rose-600/60' : isWarning ? 'border-amber-600/60' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: ID, Status */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono font-bold text-xs text-blue-400">{m.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    isCritical ? 'bg-rose-500/20 text-rose-300' :
                    isWarning ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {m.status}
                  </span>
                </div>

                {/* Machine Name */}
                <div className="mt-2.5">
                  <h3 className="text-sm font-bold text-white">{m.name}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.department}</div>
                </div>

                {/* Quick Diagnostics */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Health Score:</span>
                    <span className="font-mono font-bold text-white">{m.health_score}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Failure Risk:</span>
                    <span className={`font-semibold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.failure_risk}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Operating Hours:</span>
                    <span className="font-mono text-slate-300">{m.operating_hours.toFixed(0)}h</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onSelectMachine(m.id)}
                  className="text-slate-400 hover:text-blue-400 text-[11px] font-medium"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleDownload(m.id)}
                  disabled={downloadingId === m.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 font-semibold transition-all shadow-sm text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingId === m.id ? 'Opening...' : 'PDF Report'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF Structure Preview Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 text-xs">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-emerald-400" />
          <span>Report Documentation Specifications</span>
        </h3>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          All machine health reports are compiled dynamically on-the-fly by the backend Python service utilizing ReportLab. Reports are formatted for standard A4/Letter industrial engineering archiving, with precise color-coded condition matrices, multi-channel telemetry tables, explainable AI model factors, and sign-off blocks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-slate-400 text-[11px]">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block">Section 1:</strong>
            Equipment Identification, serial tags, and operational health overview.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block">Section 2:</strong>
            Real-time telemetry table with baseline targets and variance tolerances.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block">Section 3:</strong>
            Ensemble AI diagnosis, anomaly classification, and primary contributing factors.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block">Section 4:</strong>
            Actionable maintenance tasks, technician checklist, and active incident log.
          </div>
        </div>
      </div>
    </div>
  );
};
