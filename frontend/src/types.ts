export interface Machine {
  id: string;
  name: string;
  department: string;
  model_number: string;
  installation_date: string;
  operating_hours: number;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  health_score: number;
  anomaly_score: number;
  failure_risk: 'Low Risk' | 'Medium Risk' | 'High Risk';
  failure_probability: number;
  current_temperature: number;
  current_vibration: number;
  current_rpm: number;
  current_pressure: number;
  current_power: number;
  baseline_temp: number;
  baseline_vib: number;
  baseline_rpm: number;
  baseline_press: number;
  baseline_power: number;
  last_maintenance?: string;
  next_scheduled_maintenance?: string;
  updated_at: string;
}

export interface SensorReading {
  id: number;
  machine_id: string;
  timestamp: string;
  temperature: number;
  vibration: number;
  rpm: number;
  pressure: number;
  power: number;
  operating_hours: number;
  anomaly_detected: boolean;
  anomaly_score: number;
}

export interface Alert {
  id: string;
  machine_id: string;
  machine_name?: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  anomaly_type: string;
  message: string;
  detected_value?: string;
  threshold_value?: string;
  recommended_action: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface MaintenanceTask {
  id: string;
  machine_id: string;
  machine_name?: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UPCOMING' | 'RECOMMENDED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  category: string;
  scheduled_date: string;
  completed_date?: string;
  assigned_technician: string;
  estimated_hours: number;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  plant_info: {
    name: string;
    department: string;
    system: string;
    disclaimer: string;
  };
  total_machines: number;
  healthy_machines: number;
  observation_machines: number;
  critical_machines: number;
  overall_health: number;
  predicted_maintenance_events: number;
  estimated_downtime_avoided_hours: number;
  estimated_cost_savings_inr: number;
  active_alerts_count: number;
  simulation_running: boolean;
  active_scenario: string;
  health_distribution: Array<{ name: string; count: number; color: string }>;
  risk_distribution: Array<{ name: string; count: number; color: string }>;
  department_stats: Array<{ department: string; machine_count: number; average_health: number }>;
  downtime_trends: Array<{ day: string; actual_downtime: number; prevented_downtime: number }>;
  recent_alerts: Alert[];
}

export interface PredictionResult {
  machine_id?: string;
  machine_name?: string;
  department?: string;
  health_score?: number;
  current_temperature?: number;
  current_vibration?: number;
  current_rpm?: number;
  current_pressure?: number;
  current_power?: number;
  operating_hours?: number;
  timestamp: string;
  failure_risk: 'Low Risk' | 'Medium Risk' | 'High Risk';
  risk_score: number;
  failure_probability: number;
  is_anomaly: boolean;
  anomaly_score: number;
  contributing_factors: string[];
  explanation: string;
  model_version: string;
  recommended_priority?: string;
  recommended_action?: string;
  tasks_suggested?: string[];
}
