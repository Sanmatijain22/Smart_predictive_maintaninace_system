
import {
  Machine,
  SensorReading,
  Alert,
  MaintenanceTask,
  DashboardStats,
  PredictionResult
} from '../types';

// Backend API URL
const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://smart-predictive-maintaninace-system.onrender.com'
).replace(/\/+$/, '');

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error ${response.status}: ${errorText || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/api/dashboard/stats');
}

export async function fetchMachines(
  status?: string,
  search?: string
): Promise<Machine[]> {
  const params = new URLSearchParams();

  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);

  const query = params.toString();
  return apiRequest<Machine[]>(`/api/machines${query ? `?${query}` : ''}`);
}

export async function fetchMachineDetail(id: string): Promise<Machine> {
  return apiRequest<Machine>(`/api/machines/${encodeURIComponent(id)}`);
}

export async function fetchMachineHistory(
  id: string,
  limit: number = 60
): Promise<SensorReading[]> {
  return apiRequest<SensorReading[]>(
    `/api/machines/${encodeURIComponent(id)}/history?limit=${limit}`
  );
}

export async function fetchMachineRecommendations(id: string): Promise<any> {
  return apiRequest<any>(
    `/api/machines/${encodeURIComponent(id)}/recommendations`
  );
}

export async function fetchLiveSensors(): Promise<any> {
  return apiRequest<any>('/api/sensors/live');
}

export async function fetchPredictions(): Promise<{
  disclaimer: string;
  model_architecture: string;
  predictions: PredictionResult[];
}> {
  return apiRequest('/api/predictions');
}

export async function analyzeTelemetry(data: {
  temperature: number;
  vibration: number;
  rpm: number;
  pressure: number;
  power: number;
  operating_hours: number;
}): Promise<PredictionResult> {
  return apiRequest('/api/predictions/analyze', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function fetchAlerts(
  severity?: string,
  resolved?: boolean,
  machineId?: string
): Promise<Alert[]> {
  const params = new URLSearchParams();

  if (severity) params.append('severity', severity);
  if (resolved !== undefined) params.append('resolved', String(resolved));
  if (machineId) params.append('machine_id', machineId);

  const query = params.toString();
  return apiRequest<Alert[]>(`/api/alerts${query ? `?${query}` : ''}`);
}

export async function acknowledgeAlert(
  alertId: string,
  operatorName: string = 'Control Room Engineer'
): Promise<Alert> {
  return apiRequest<Alert>(
    `/api/alerts/${encodeURIComponent(alertId)}/acknowledge`,
    {
      method: 'POST',
      body: JSON.stringify({ operator_name: operatorName })
    }
  );
}

export async function resolveAlert(
  alertId: string,
  operatorName: string = 'Maintenance Lead'
): Promise<Alert> {
  return apiRequest<Alert>(
    `/api/alerts/${encodeURIComponent(alertId)}/resolve`,
    {
      method: 'POST',
      body: JSON.stringify({ operator_name: operatorName })
    }
  );
}

export async function fetchMaintenanceTasks(
  status?: string,
  priority?: string,
  machineId?: string
): Promise<MaintenanceTask[]> {
  const params = new URLSearchParams();

  if (status && status !== 'ALL') params.append('status', status);
  if (priority && priority !== 'ALL') params.append('priority', priority);
  if (machineId) params.append('machine_id', machineId);

  const query = params.toString();
  return apiRequest<MaintenanceTask[]>(
    `/api/maintenance${query ? `?${query}` : ''}`
  );
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
  return apiRequest<MaintenanceTask>('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(task)
  });
}

export async function updateMaintenanceTask(
  taskId: string,
  updates: Partial<MaintenanceTask>
): Promise<MaintenanceTask> {
  return apiRequest<MaintenanceTask>(
    `/api/maintenance/${encodeURIComponent(taskId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates)
    }
  );
}

export async function startSimulation(): Promise<any> {
  return apiRequest<any>('/api/simulation/start', { method: 'POST' });
}

export async function pauseSimulation(): Promise<any> {
  return apiRequest<any>('/api/simulation/pause', { method: 'POST' });
}

export async function triggerSimulationScenario(
  scenario: string,
  machineId: string = 'CNC-001',
  faultType: string = 'bearing_and_thermal'
): Promise<any> {
  return apiRequest<any>('/api/simulation/scenario', {
    method: 'POST',
    body: JSON.stringify({
      scenario,
      machine_id: machineId,
      fault_type: faultType
    })
  });
}

export async function resetSimulation(): Promise<any> {
  return apiRequest<any>('/api/simulation/reset', { method: 'POST' });
}

export function getReportDownloadUrl(machineId: string): string {
  return `${BASE_URL}/api/reports/${encodeURIComponent(machineId)}`;
}
