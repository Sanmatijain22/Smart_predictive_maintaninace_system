import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Thermometer, 
  Gauge, 
  Zap, 
  Clock, 
  Flame, 
  ChevronRight,
  Droplets,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { Machine } from '../types';
import { triggerSimulationScenario } from '../services/api';

interface MachinesPageProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
  onRefresh: () => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ 
  machines, 
  onSelectMachine,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [injectingId, setInjectingId] = useState<string | null>(null);

  const filteredMachines = machines.filter(m => {
    const matchesStatus = filterStatus === 'all' || m.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleQuickFault = async (e: React.MouseEvent, machineId: string) => {
    e.stopPropagation();
    setInjectingId(machineId);
    try {
      await triggerSimulationScenario('FAULT_INJECTION', machineId, 'bearing_and_thermal');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setInjectingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Live Industrial Machine Monitoring</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono">
              8 Plant Assets
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-channel sensor telemetry, dynamic threshold bounding, and unsupervised anomaly scoring.
          </p>
        </div>

        {/* View Switcher & Counter */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Card Matrix
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Telemetry Table
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
        {/* Status Filters */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Machines', count: machines.length },
            { id: 'healthy', label: 'Healthy', count: machines.filter(m => m.status === 'healthy').length },
            { id: 'warning', label: 'Warning', count: machines.filter(m => m.status === 'warning').length },
            { id: 'critical', label: 'Critical', count: machines.filter(m => m.status === 'critical').length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{f.label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-black/30 text-slate-200">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Machine ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMachines.map((m) => {
            const isCritical = m.status === 'critical';
            const isWarning = m.status === 'warning';

            return (
              <div
                key={m.id}
                onClick={() => onSelectMachine(m.id)}
                className={`group relative bg-slate-900 border rounded-xl p-4 shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isCritical 
                    ? 'border-rose-600/60 shadow-rose-950/20 hover:border-rose-500' 
                    : isWarning 
                    ? 'border-amber-600/60 shadow-amber-950/20 hover:border-amber-500' 
                    : 'border-slate-800 hover:border-blue-500/60'
                }`}
              >
                {/* Header: ID, Status Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-xs text-blue-400 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50">
                      {m.id}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {m.department.split(' ')[0]}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isCritical 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                      : isWarning 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {isCritical ? <AlertOctagon className="h-3 w-3" /> : isWarning ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    <span>{m.status}</span>
                  </span>
                </div>

                {/* Machine Name */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {m.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{m.model_number}</span>
                    <span>•</span>
                    <span>{m.operating_hours.toFixed(0)}h run</span>
                  </div>
                </div>

                {/* Health & Failure Risk Bar */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Health Index</span>
                    <span className="font-mono font-bold text-white">{m.health_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.health_score >= 80 ? 'bg-emerald-500' :
                        m.health_score >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${m.health_score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400">
                    <span>Risk: <strong className={isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>{m.failure_risk}</strong></span>
                    <span>Anomaly: <strong className="font-mono text-slate-300">{m.anomaly_score}%</strong></span>
                  </div>
                </div>

                {/* Live Telemetry Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {/* Temperature */}
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800/40">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-rose-400" /> Temp
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {m.current_temperature.toFixed(1)}°C
                    </div>
                  </div>

                  {/* Vibration */}
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800/40">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-emerald-400" /> Vibration
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {m.current_vibration.toFixed(2)} mm/s
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800/40">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-sky-400" /> Pressure
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {m.current_pressure.toFixed(1)} bar
                    </div>
                  </div>

                  {/* Power */}
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800/40">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-400" /> Power
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {m.current_power.toFixed(1)} kW
                    </div>
                  </div>
                </div>

                {/* Bottom Footer: Quick Trigger & View Detail */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => handleQuickFault(e, m.id)}
                    title="Simulate immediate stress/overheat on this machine"
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Flame className="h-3 w-3 text-rose-500" />
                    <span>Inject Fault</span>
                  </button>

                  <span className="text-blue-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Machine ID & Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health Index</th>
                  <th className="py-3 px-4">Temp (°C)</th>
                  <th className="py-3 px-4">Vib (mm/s)</th>
                  <th className="py-3 px-4">RPM</th>
                  <th className="py-3 px-4">Pressure</th>
                  <th className="py-3 px-4">Power</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMachines.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMachine(m.id)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="font-bold text-blue-400 font-mono">{m.id}</div>
                      <div className="text-[11px] text-slate-300">{m.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{m.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        m.status === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        m.status === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {m.health_score}%
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span className={m.current_temperature > 85 ? 'text-rose-400 font-bold' : ''}>
                        {m.current_temperature.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span className={m.current_vibration > 6 ? 'text-rose-400 font-bold' : ''}>
                        {m.current_vibration.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{m.current_rpm.toFixed(0)}</td>
                    <td className="py-3 px-4 font-mono">{m.current_pressure.toFixed(1)} bar</td>
                    <td className="py-3 px-4 font-mono">{m.current_power.toFixed(1)} kW</td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={
                        m.failure_risk === 'High Risk' ? 'text-rose-400' :
                        m.failure_risk === 'Medium Risk' ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {m.failure_risk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMachine(m.id);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors font-medium text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
