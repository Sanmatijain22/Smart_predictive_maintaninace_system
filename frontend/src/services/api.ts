import { Machine, SensorReading, Alert, MaintenanceTask, DashboardStats, PredictionResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchMachines(status?: string, search?: string): Promise<Machine[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  
  const res = await fetch(`${BASE_URL}/api/machines?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

export async function fetchMachineDetail(id: string): Promise<Machine> {
  const res = await fetch(`${BASE_URL}/api/machines/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch machine ${id}`);
  return res.json();
}

export async function fetchMachineHistory(id: string, limit: number = 60): Promise<SensorReading[]> {
  const res = await fetch(`${BASE_URL}/api/machines/${id}/history?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch history for ${id}`);
  return res.json();
}

export async function fetchMachineRecommendations(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/machines/${id}/recommendations`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations for ${id}`);
  return res.json();
}

export async function fetchLiveSensors(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/sensors/live`);
  if (!res.ok) throw new Error('Failed to fetch live sensors');
  return res.json();
}

export async function fetchPredictions(): Promise<{ disclaimer: string; model_architecture: string; predictions: PredictionResult[] }> {
  const res = await fetch(`${BASE_URL}/api/predictions`);
  if (!res.ok) throw new Error('Failed to fetch predictions');
  return res.json();
}

export async function analyzeTelemetry(data: {
  temperature: number;
  vibration: number;
  rpm: number;
  pressure: number;
  power: number;
  operating_hours: number;
}): Promise<PredictionResult> {
  const res = await fetch(`${BASE_URL}/api/predictions/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to run AI analysis');
  return res.json();
}

export async function fetchAlerts(severity?: string, resolved?: boolean, machineId?: string): Promise<Alert[]> {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (resolved !== undefined) params.append('resolved', String(resolved));
  if (machineId) params.append('machine_id', machineId);
  
  const res = await fetch(`${BASE_URL}/api/alerts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(alertId: string, operatorName: string = 'Control Room Engineer'): Promise<Alert> {
  const res = await fetch(`${BASE_URL}/api/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator_name: operatorName })
  });
  if (!res.ok) throw new Error('Failed to acknowledge alert');
  return res.json();
}

export async function resolveAlert(alertId: string, operatorName: string = 'Maintenance Lead'): Promise<Alert> {
  const res = await fetch(`${BASE_URL}/api/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator_name: operatorName })
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
}

export async function fetchMaintenanceTasks(status?: string, priority?: string, machineId?: string): Promise<MaintenanceTask[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (priority && priority !== 'ALL') params.append('priority', priority);
  if (machineId) params.append('machine_id', machineId);
  
  const res = await fetch(`${BASE_URL}/api/maintenance?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch maintenance tasks');
  return res.json();
}

export async function createMaintenanceTask(task: {
  machine_id: string;
  title: string;
  description: string;
  priority: string;
  status?: string;
  category?: string;
  scheduled_date?: string;
  assigned_technician?: string;
  estimated_hours?: number;
  notes?: string;
}): Promise<MaintenanceTask> {
  const res = await fetch(`${BASE_URL}/api/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Failed to create maintenance task');
  return res.json();
}

export async function updateMaintenanceTask(taskId: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  const res = await fetch(`${BASE_URL}/api/maintenance/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update maintenance task');
  return res.json();
}

export async function startSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/simulation/start`, { method: 'POST' });
  return res.json();
}

export async function pauseSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function triggerSimulationScenario(scenario: string, machineId: string = 'CNC-001', faultType: string = 'bearing_and_thermal'): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/simulation/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, machine_id: machineId, fault_type: faultType })
  });
  return res.json();
}

export async function resetSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/simulation/reset`, { method: 'POST' });
  return res.json();
}

export function getReportDownloadUrl(machineId: string): string {
  return `${BASE_URL}/api/reports/${machineId}`;
}
