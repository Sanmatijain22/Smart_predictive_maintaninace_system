import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  User, 
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { MaintenanceTask, Machine } from '../types';
import { fetchMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask } from '../services/api';

interface MaintenancePageProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ 
  machines,
  onSelectMachine
}) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New task form state
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'CNC-001');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('HIGH');
  const [taskCategory, setTaskCategory] = useState('Predictive');
  const [taskTech, setTaskTech] = useState('Senior Reliability Tech');
  const [taskHours, setTaskHours] = useState<number>(2.5);

  const loadTasks = async () => {
    try {
      const data = await fetchMaintenanceTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaintenanceTask({
        machine_id: selectedMachineId,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        category: taskCategory,
        assigned_technician: taskTech,
        estimated_hours: taskHours,
        status: 'SCHEDULED'
      });
      setShowModal(false);
      setTaskTitle('');
      setTaskDesc('');
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      await updateMaintenanceTask(taskId, {
        status: 'COMPLETED',
        completed_date: new Date().toISOString()
      });
      await loadTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchStatus = filterStatus === 'ALL' || t.status.toUpperCase() === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priority.toUpperCase() === filterPriority;
    return matchStatus && matchPriority;
  });

  const upcomingCount = tasks.filter(t => t.status === 'UPCOMING' || t.status === 'SCHEDULED').length;
  const recommendedCount = tasks.filter(t => t.status === 'RECOMMENDED').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-400" />
            <span>Industrial Maintenance Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated work orders, AI-recommended interventions, technician dispatch, and lifecycle overhaul logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-slate-400">Upcoming & Scheduled</div>
          <div className="text-xl font-black font-mono text-blue-400 mt-1">{upcomingCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-slate-400">AI Recommended</div>
          <div className="text-xl font-black font-mono text-amber-400 mt-1">{recommendedCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-slate-400">Completed Orders</div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">{completedCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-slate-400">Mean Time to Repair (MTTR)</div>
          <div className="text-xl font-black font-mono text-white mt-1">2.4h</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          {['ALL', 'SCHEDULED', 'RECOMMENDED', 'UPCOMING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Maintenance Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCritical = task.priority === 'CRITICAL';
            const isHigh = task.priority === 'HIGH';
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl bg-slate-900 border transition-all ${
                  isCompleted ? 'border-slate-800/80 opacity-60' :
                  isCritical ? 'border-rose-600/50 shadow-md shadow-rose-950/10' :
                  isHigh ? 'border-orange-500/50' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Task Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                        {task.id}
                      </span>

                      <button
                        onClick={() => onSelectMachine(task.machine_id)}
                        className="font-mono font-bold text-xs text-slate-200 hover:text-blue-400 underline decoration-slate-600"
                      >
                        {task.machine_id} - {task.machine_name}
                      </button>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        isHigh ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {task.priority} Priority
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {task.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center flex-wrap gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>Sched: {new Date(task.scheduled_date).toLocaleDateString()}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{task.assigned_technician}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>Est: {task.estimated_hours}h</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Status & Complete Button */}
                  <div className="flex items-center lg:flex-col items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      task.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {task.status}
                    </span>

                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(task.id)}
                        disabled={actionLoading === task.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{actionLoading === task.id ? 'Updating...' : 'Mark Completed'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No maintenance tasks found matching the selected criteria.
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span>Create New Maintenance Work Order</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Machinery</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spindle Bearing Replacement & Laser Alignment"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency)</option>
                    <option value="HIGH">HIGH (High Priority)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Routine)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Predictive">Predictive (AI Driven)</option>
                    <option value="Preventive">Preventive (Scheduled)</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Inspection">Autonomous Inspection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Specialist</label>
                  <input
                    type="text"
                    value={taskTech}
                    onChange={(e) => setTaskTech(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={taskHours}
                    onChange={(e) => setTaskHours(parseFloat(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Description & Scope</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail step-by-step procedures, required spare parts, and lockout-tagout instructions..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
