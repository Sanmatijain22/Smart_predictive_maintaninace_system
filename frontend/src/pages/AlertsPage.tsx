import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  AlertTriangle, 
  AlertOctagon, 
  Wrench,
  UserCheck,
  Check
} from 'lucide-react';
import { Alert } from '../types';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/api';

interface AlertsPageProps {
  onSelectMachine: (id: string) => void;
  onRefreshStats: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ 
  onSelectMachine,
  onRefreshStats
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      await acknowledgeAlert(alertId, 'Duty Shift Engineer');
      await loadAlerts();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      await resolveAlert(alertId, 'Reliability Lead');
      await loadAlerts();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchSeverity = filterSeverity === 'ALL' || a.severity.toUpperCase() === filterSeverity;
    const matchStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'RESOLVED' && a.resolved) ||
      (filterStatus === 'ACKNOWLEDGED' && a.acknowledged && !a.resolved) ||
      (filterStatus === 'ACTIVE' && !a.acknowledged && !a.resolved);
    return matchSeverity && matchStatus;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
  const highCount = alerts.filter(a => a.severity === 'HIGH' && !a.resolved).length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-500" />
            <span>Predictive Alerts Centre</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time anomaly notifications triggered automatically by machine telemetry and ML threshold exceedance.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>{criticalCount} Critical Open</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
            <span>{highCount} Warning</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
        {/* Severity Filters */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
          {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterStatus === st ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl bg-slate-900 border transition-all ${
                  alert.resolved
                    ? 'border-slate-800/80 opacity-70'
                    : isCritical
                    ? 'border-rose-600/60 shadow-lg shadow-rose-950/20'
                    : isHigh
                    ? 'border-orange-500/60 shadow-md shadow-orange-950/10'
                    : 'border-amber-500/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                        {alert.id}
                      </span>

                      <button
                        onClick={() => onSelectMachine(alert.machine_id)}
                        className="font-mono font-bold text-xs text-slate-200 hover:text-blue-400 underline decoration-slate-600"
                      >
                        {alert.machine_id} - {alert.machine_name}
                      </button>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        isHigh ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {alert.severity}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {alert.anomaly_type}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Sensor Threshold details */}
                    {(alert.detected_value || alert.threshold_value) && (
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        {alert.detected_value && (
                          <span>Telemetry Reading: <strong className="text-rose-400 font-mono">{alert.detected_value}</strong></span>
                        )}
                        {alert.threshold_value && (
                          <span>Allowable Baseline: <strong className="text-slate-300 font-mono">{alert.threshold_value}</strong></span>
                        )}
                      </div>
                    )}

                    {/* Recommended Action Box */}
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="font-bold text-emerald-400">Prescribed Engineering Action: </span>
                      <span className="text-slate-300">{alert.recommended_action}</span>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-right text-[11px]">
                      {alert.resolved ? (
                        <div className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Resolved</span>
                        </div>
                      ) : alert.acknowledged ? (
                        <div className="text-amber-400 font-semibold flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          <span>Acknowledged by {alert.acknowledged_by || 'Operator'}</span>
                        </div>
                      ) : (
                        <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] animate-pulse">
                          ● Open Incident
                        </span>
                      )}
                    </div>

                    {/* Functional Buttons: Acknowledge & Resolve */}
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && !alert.resolved && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={actionLoading === alert.id}
                          className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs font-semibold transition-all"
                        >
                          {actionLoading === alert.id ? 'Saving...' : 'Acknowledge'}
                        </button>
                      )}

                      {!alert.resolved && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={actionLoading === alert.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{actionLoading === alert.id ? 'Resolving...' : 'Resolve Alert'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Matching Alerts</h3>
            <p className="text-xs text-slate-400">All machinery are within acceptable operational tolerances for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
