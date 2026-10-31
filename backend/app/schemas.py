from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# Sensor Data Schema
class SensorReadingBase(BaseModel):
    temperature: float
    vibration: float
    rpm: float
    pressure: float
    power: float
    operating_hours: float

class SensorReadingCreate(SensorReadingBase):
    machine_id: str

class SensorReadingResponse(SensorReadingBase):
    id: int
    machine_id: str
    timestamp: datetime
    anomaly_detected: bool
    anomaly_score: float

    class Config:
        from_attributes = True

# Machine Schemas
class MachineBase(BaseModel):
    name: str
    department: str
    model_number: Optional[str] = "EK-IND-2024"
    installation_date: Optional[str] = "2023-01-15"
    operating_hours: float
    status: str
    health_score: float
    anomaly_score: float
    failure_risk: str
    failure_probability: float

class MachineResponse(MachineBase):
    id: str
    current_temperature: float
    current_vibration: float
    current_rpm: float
    current_pressure: float
    current_power: float
    last_maintenance: Optional[datetime] = None
    next_scheduled_maintenance: Optional[datetime] = None
    updated_at: datetime
    baseline_temp: float
    baseline_vib: float
    baseline_rpm: float
    baseline_press: float
    baseline_power: float

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionAnalyzeRequest(BaseModel):
    machine_id: Optional[str] = None
    temperature: float
    vibration: float
    rpm: float
    pressure: float
    power: float
    operating_hours: float

class PredictionResponse(BaseModel):
    machine_id: Optional[str] = None
    timestamp: datetime
    failure_risk: str # Low Risk, Medium Risk, High Risk
    risk_score: float
    is_anomaly: bool
    anomaly_score: float
    contributing_factors: List[str]
    explanation: str
    model_version: str
    recommended_action: Optional[str] = None

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    machine_id: str
    machine_name: Optional[str] = None
    timestamp: datetime
    severity: str
    anomaly_type: str
    message: str
    detected_value: Optional[str] = None
    threshold_value: Optional[str] = None
    recommended_action: str
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True

class AlertActionRequest(BaseModel):
    operator_name: Optional[str] = "Operator-1"
    note: Optional[str] = None

# Maintenance Schemas
class MaintenanceTaskCreate(BaseModel):
    machine_id: str
    title: str
    description: str
    priority: str
    status: Optional[str] = "SCHEDULED"
    category: Optional[str] = "Predictive"
    scheduled_date: Optional[datetime] = None
    assigned_technician: Optional[str] = "Lead Maintenance Tech"
    estimated_hours: Optional[float] = 2.0
    notes: Optional[str] = None

class MaintenanceTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    assigned_technician: Optional[str] = None
    estimated_hours: Optional[float] = None
    notes: Optional[str] = None

class MaintenanceTaskResponse(BaseModel):
    id: str
    machine_id: str
    machine_name: Optional[str] = None
    title: str
    description: str
    priority: str
    status: str
    category: str
    scheduled_date: datetime
    completed_date: Optional[datetime] = None
    assigned_technician: str
    estimated_hours: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class DashboardStatsResponse(BaseModel):
    plant_info: dict
    total_machines: int
    healthy_machines: int
    observation_machines: int
    critical_machines: int
    overall_health: float
    predicted_maintenance_events: int
    estimated_downtime_avoided_hours: float
    estimated_cost_savings_inr: float
    active_alerts_count: int
    simulation_running: bool
    active_scenario: str

