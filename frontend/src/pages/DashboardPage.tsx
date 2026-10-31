import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HeartPulse, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight,
  TrendingDown,
  Layers,
  Thermometer,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { DashboardStats, Machine } from '../types';

interface DashboardPageProps {
  stats: DashboardStats | null;
  machines: Machine[];
  onSelectMachine: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  stats, 
  machines,
  onSelectMachine,
  onNavigateTab
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-slate-400">Loading plant telemetry & intelligence...</p>
        </div>
      </div>
    );
  }

  // Machine temperature data for temperature comparison chart
  const machineTempData = machines.map(m => ({
    name: m.name.split(' ')[0] + ' ' + (m.name.split(' ')[1] || ''),
    id: m.id,
    current: m.current_temperature,
    baseline: m.baseline_temp,
  }));

  // Machine vibration data
  const machineVibData = machines.map(m => ({
    name: m.name.split(' ')[0] + ' ' + (m.name.split(' ')[1] || ''),
    id: m.id,
    vibration: m.current_vibration,
    baseline: m.baseline_vib,
  }));

  const COLORS = ['#16A34A', '#EAB308', '#DC2626'];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Top Banner with Plant Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-800 gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Executive Reliability Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time machine health diagnostics, predictive downtime avoidance, and anomaly intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Plant Availability:</span>
            <span className="font-mono font-bold text-emerald-400">97.8%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Est. Savings:</span>
            <span className="font-mono font-bold text-blue-400">
              ₹{(stats.estimated_cost_savings_inr / 100000).toFixed(2)} Lakhs
            </span>
          </div>
        </div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Machines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Assets</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.total_machines}</div>
          <div className="mt-1 text-[11px] text-slate-400">Escorts Fleet</div>
        </div>

        {/* Healthy Machines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Healthy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">{stats.healthy_machines}</div>
          <div className="mt-1 text-[11px] text-emerald-500 font-medium">Nominal tolerance</div>
        </div>

        {/* Machines Under Observation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Observation</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">{stats.observation_machines}</div>
          <div className="mt-1 text-[11px] text-amber-400/80 font-medium">Warning threshold</div>
        </div>

        {/* Critical Machines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-500 font-mono">{stats.critical_machines}</div>
          <div className="mt-1 text-[11px] text-rose-400/80 font-medium">Action required</div>
        </div>

        {/* Overall Health Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Fleet Health</span>
            <HeartPulse className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-400 font-mono">{stats.overall_health}%</div>
          <div className="mt-1 text-[11px] text-indigo-300">Target &gt; 90.0%</div>
        </div>

        {/* Predicted Maintenance Events */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Predicted Events</span>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-400 font-mono">{stats.predicted_maintenance_events}</div>
          <div className="mt-1 text-[11px] text-orange-300">Within 72 Hours</div>
        </div>

        {/* Avoided Downtime */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Downtime Avoided</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {stats.estimated_downtime_avoided_hours}h
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Demo Estimate</div>
        </div>
      </div>

      {/* Row 2: Charts - Health Distribution, Risk Distribution, Downtime Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Machine Health Distribution Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Asset Health Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">8 Monitored</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.health_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.health_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Failure Risk Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              AI Failure Risk Classification
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">Random Forest</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.risk_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.risk_distribution.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Downtime Trends (Prevented vs Actual) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Downtime Prevention (Hours)
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Avoided vs Incurred</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.downtime_trends}>
                <defs>
                  <linearGradient id="preventedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="prevented_downtime" name="Avoided (Hrs)" stroke="#10B981" fillOpacity={1} fill="url(#preventedGrad)" />
                <Area type="monotone" dataKey="actual_downtime" name="Actual (Hrs)" stroke="#EF4444" fillOpacity={1} fill="url(#actualGrad)" />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Temperature Trends & Vibration Across Machines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temperature Comparison Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Fleet Operating Temperatures (°C)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Current vs Baseline</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineTempData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748B" fontSize={11} domain={[30, 110]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="baseline" name="Baseline (°C)" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar dataKey="current" name="Live Temp (°C)" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vibration Comparison Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Fleet Vibration Signatures (mm/s)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">ISO 10816 Thresholds</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineVibData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="baseline" name="Nominal Vib" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar dataKey="vibration" name="Live Vib (mm/s)" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Alerts & Department Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Alerts Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent Predictive Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recent_alerts && stats.recent_alerts.length > 0 ? (
              stats.recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectMachine(alert.machine_id);
                    onNavigateTab('machines');
                  }}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{alert.machine_id}</span>
                        <span className="text-slate-500">•</span>
                        <span>{alert.anomaly_type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className={`text-[10px] font-semibold ${alert.resolved ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {alert.resolved ? '✓ Resolved' : (alert.acknowledged ? 'Acknowledged' : '● Action Required')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active anomalies or critical alerts registered in this logging period.
              </div>
            )}
          </div>
        </div>

        {/* Department Health Overview (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Department Breakdown
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Escorts Plant</span>
            </div>

            <div className="space-y-3">
              {stats.department_stats && stats.department_stats.map((dept, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[170px]">{dept.department}</span>
                    <span className="font-mono font-bold text-white">{dept.average_health}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.average_health >= 85 ? 'bg-emerald-500' :
                        dept.average_health >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${dept.average_health}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Overall Plant Compliance:</span>
            <span className="font-bold text-emerald-400">99.4% (ISO 55000)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
