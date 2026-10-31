import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Wrench, 
  Thermometer, 
  Activity, 
  Gauge, 
  Zap, 
  Clock, 
  RotateCw, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  BrainCircuit, 
  ShieldCheck, 
  Calendar, 
  FileText,
  Flame,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Machine, SensorReading, Alert } from '../types';
import { 
  fetchMachineDetail, 
  fetchMachineHistory, 
  fetchMachineRecommendations, 
  fetchAlerts, 
  getReportDownloadUrl,
  createMaintenanceTask
} from '../services/api';

interface MachineDetailPageProps {
  machineId: string;
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({ 
  machineId, 
  onBack,
  onNavigateTab
}) => {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [recs, setRecs] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState(false);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('HIGH');
  const [taskDescription, setTaskDescription] = useState('');

  const loadData = async () => {
    try {
      const [m, h, r, a] = await Promise.all([
        fetchMachineDetail(machineId),
        fetchMachineHistory(machineId, 40),
        fetchMachineRecommendations(machineId),
        fetchAlerts(undefined, undefined, machineId)
      ]);
      setMachine(m);
      setHistory(h);
      setRecs(r);
      setAlerts(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [machineId]);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;
    try {
      await createMaintenanceTask({
        machine_id: machine.id,
        title: taskTitle || `Prescribed Maintenance for ${machine.name}`,
        description: taskDescription || (recs?.recommendations?.summary_recommendation || 'Preventive overhaul based on sensor telemetry.'),
        priority: taskPriority,
        category: 'Predictive',
        assigned_technician: 'Lead Plant Specialist',
        estimated_hours: 2.5
      });
      setShowTaskModal(false);
      setTaskSuccess(true);
      setTimeout(() => setTaskSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !machine) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-slate-400">Loading asset telemetry & history...</p>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Machine not found.</p>
        <button onClick={onBack} className="mt-3 text-blue-400 font-semibold text-xs">← Back to Machines</button>
      </div>
    );
  }

  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: item.temperature,
    vibration: item.vibration,
    baseline_temp: machine.baseline_temp,
    baseline_vib: machine.baseline_vib,
  }));

  const isCritical = machine.status === 'critical';
  const isWarning = machine.status === 'warning';

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                {machine.id}
              </span>
              <h1 className="text-lg font-black text-white">{machine.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {machine.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{machine.department}</span>
              <span>•</span>
              <span>Model: {machine.model_number}</span>
              <span>•</span>
              <span>Installed: {machine.installation_date}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: PDF Download & Create Work Order */}
        <div className="flex items-center flex-wrap gap-2">
          <a
            href={getReportDownloadUrl(machine.id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Download PDF Report</span>
          </a>

          <button
            onClick={() => {
              setTaskTitle(`Intervention on ${machine.name} (${machine.id})`);
              setTaskDescription(recs?.recommendations?.summary_recommendation || 'Perform diagnostic check.');
              setShowTaskModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {taskSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Maintenance Task successfully scheduled and persisted in database!</span>
        </div>
      )}

      {/* Row 1: KPI Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Temperature</span>
            <Thermometer className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.current_temperature.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {machine.baseline_temp.toFixed(1)}°C
          </div>
        </div>

        {/* Vibration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Vibration</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.current_vibration.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {machine.baseline_vib.toFixed(2)} mm/s
          </div>
        </div>

        {/* Rotational Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Rotational Speed</span>
            <RotateCw className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.current_rpm.toFixed(0)} <span className="text-xs font-normal text-slate-400">RPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {machine.baseline_rpm.toFixed(0)} RPM
          </div>
        </div>

        {/* Hydraulic Pressure */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Hydraulic Press.</span>
            <Gauge className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.current_pressure.toFixed(1)} <span className="text-xs font-normal text-slate-400">bar</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {machine.baseline_press.toFixed(1)} bar
          </div>
        </div>

        {/* Power Draw */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Power Draw</span>
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.current_power.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {machine.baseline_power.toFixed(1)} kW
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Operating Hours</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 text-xl font-black text-white font-mono">
            {machine.operating_hours.toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Lifecycle: 10,000h
          </div>
        </div>
      </div>

      {/* Row 2: AI Diagnosis Card & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Diagnostics Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Diagnostic & Anomaly Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v1.4 RF+IF Ensemble</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</span>
              <div className="text-lg font-black font-mono text-white mt-0.5">{machine.health_score}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Anomaly Score</span>
              <div className="text-lg font-black font-mono text-amber-400 mt-0.5">{machine.anomaly_score}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Failure Risk</span>
              <div className={`text-sm font-black mt-1 ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                {machine.failure_risk}
              </div>
            </div>
          </div>

          {/* Explanation text */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 text-xs">
            <div className="font-semibold text-blue-300 mb-1">AI Analytical Assessment:</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {recs?.prediction_breakdown?.explanation || 'All monitored variables are conforming to nominal baseline standards.'}
            </p>
          </div>

          {/* Contributing Factors */}
          {recs?.prediction_breakdown?.contributing_factors && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">Contributing Sensor Factors:</div>
              <ul className="space-y-1 text-xs">
                {recs.prediction_breakdown.contributing_factors.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Maintenance Recommendations Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Actionable Maintenance Recommendations
              </h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              recs?.recommendations?.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
              recs?.recommendations?.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              Priority: {recs?.recommendations?.priority || 'LOW'}
            </span>
          </div>

          <div className="space-y-2">
            {recs?.recommendations?.recommendations ? (
              recs.recommendations.recommendations.map((recText: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs">
                  <span className="font-mono font-bold text-blue-400 text-[11px] shrink-0 mt-0.5">
                    0{idx+1}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{recText}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No immediate maintenance action required.</p>
            )}
          </div>

          {recs?.recommendations?.tasks_suggested && recs.recommendations.tasks_suggested.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">Suggested Work Orders:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {recs.recommendations.tasks_suggested.map((t: string, idx: number) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Interactive Real-Time Sensor Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temperature Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Real-Time Temperature History (°C)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Last 40 Readings</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" name="Actual (°C)" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline_temp" name="Nominal (°C)" stroke="#64748B" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vibration Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Real-Time Vibration Spectrum (mm/s)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Last 40 Readings</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline_vib" name="Nominal Vib" stroke="#64748B" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Previous Alerts for this Machine */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recorded Alerts for {machine.id}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{alerts.length} Records</span>
        </div>

        {alerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Alert ID</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Condition Detected</th>
                  <th className="py-2.5 px-3">Recommended Action</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{a.id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                        a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 font-mono">
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{a.anomaly_type}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300">{a.recommended_action}</td>
                    <td className="py-2.5 px-3 font-semibold text-[11px]">
                      {a.resolved ? (
                        <span className="text-emerald-400">Resolved</span>
                      ) : a.acknowledged ? (
                        <span className="text-amber-400">Acknowledged</span>
                      ) : (
                        <span className="text-rose-400">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">
            No incident alerts logged for this machine.
          </p>
        )}
      </div>

      {/* Create Work Order Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span>Create Maintenance Work Order</span>
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Asset</label>
                <input
                  type="text"
                  disabled
                  value={`${machine.id} - ${machine.name}`}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate)</option>
                  <option value="HIGH">HIGH (Within 24 Hours)</option>
                  <option value="MEDIUM">MEDIUM (Within 48 Hours)</option>
                  <option value="LOW">LOW (Next Planned Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Instructions</label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
