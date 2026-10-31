import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String(50), primary_key=True, index=True) # e.g. "CNC-001"
    name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    model_number = Column(String(100), default="EK-IND-2024")
    installation_date = Column(String(50), default="2023-01-15")
    operating_hours = Column(Float, default=1240.0)
    status = Column(String(20), default="healthy") # healthy, warning, critical, maintenance
    health_score = Column(Float, default=95.0) # 0 to 100
    anomaly_score = Column(Float, default=8.5) # 0 to 100
    failure_risk = Column(String(20), default="Low Risk") # Low Risk, Medium Risk, High Risk
    failure_probability = Column(Float, default=0.04) # 0.0 to 1.0
    
    # Current live telemetry values
    current_temperature = Column(Float, default=65.0) # °C
    current_vibration = Column(Float, default=2.1)    # mm/s
    current_rpm = Column(Float, default=2400.0)       # RPM
    current_pressure = Column(Float, default=120.0)   # bar
    current_power = Column(Float, default=28.5)       # kW
    
    last_maintenance = Column(DateTime, default=datetime.datetime.utcnow)
    next_scheduled_maintenance = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(days=30))
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Operating baselines & boundaries for realistic machine-specific behavior
    baseline_temp = Column(Float, default=65.0)
    baseline_vib = Column(Float, default=2.0)
    baseline_rpm = Column(Float, default=2400.0)
    baseline_press = Column(Float, default=120.0)
    baseline_power = Column(Float, default=28.0)

    # Relationships
    readings = relationship("SensorReading", back_populates="machine", cascade="all, delete-orphan", order_by="desc(SensorReading.timestamp)")
    alerts = relationship("Alert", back_populates="machine", cascade="all, delete-orphan", order_by="desc(Alert.timestamp)")
    maintenance_tasks = relationship("MaintenanceTask", back_populates="machine", cascade="all, delete-orphan", order_by="desc(MaintenanceTask.scheduled_date)")
    predictions = relationship("Prediction", back_populates="machine", cascade="all, delete-orphan", order_by="desc(Prediction.timestamp)")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    temperature = Column(Float, nullable=False) # °C
    vibration = Column(Float, nullable=False)   # mm/s
    rpm = Column(Float, nullable=False)         # RPM
    pressure = Column(Float, nullable=False)    # bar
    power = Column(Float, nullable=False)       # kW
    operating_hours = Column(Float, nullable=False)
    
    anomaly_detected = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)

    machine = relationship("Machine", back_populates="readings")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    failure_risk = Column(String(20), nullable=False) # Low Risk, Medium Risk, High Risk
    risk_score = Column(Float, nullable=False) # 0.0 to 1.0 (or 0-100%)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0) # 0 to 100
    
    contributing_factors = Column(Text, default="[]") # JSON list of strings
    explanation = Column(Text, nullable=False)
    model_version = Column(String(50), default="v1.4-RF+IF-Ensemble")

    machine = relationship("Machine", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True) # e.g. "ALT-1001"
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    anomaly_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    detected_value = Column(String(100), nullable=True)
    threshold_value = Column(String(100), nullable=True)
    recommended_action = Column(Text, nullable=False)
    
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)

    machine = relationship("Machine", back_populates="alerts")


class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(String(50), primary_key=True, index=True) # e.g. "MNT-2001"
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="RECOMMENDED") # UPCOMING, RECOMMENDED, SCHEDULED, IN_PROGRESS, COMPLETED
    category = Column(String(50), default="Predictive") # Preventive, Corrective, Predictive, Inspection
    scheduled_date = Column(DateTime, default=datetime.datetime.utcnow)
    completed_date = Column(DateTime, nullable=True)
    assigned_technician = Column(String(100), default="Lead Maintenance Tech")
    estimated_hours = Column(Float, default=2.5)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    machine = relationship("Machine", back_populates="maintenance_tasks")


class SimulationSetting(Base):
    __tablename__ = "simulation_settings"

    id = Column(Integer, primary_key=True, default=1)
    is_running = Column(Boolean, default=True)
    interval_seconds = Column(Float, default=3.0)
    active_scenario = Column(String(50), default="NORMAL") # NORMAL, FAULT_INJECTION, HIGH_LOAD, MULTI_STRESS
    injected_machine_id = Column(String(50), nullable=True)
    fault_type = Column(String(50), nullable=True) # bearing_wear, cooling_failure, hydraulic_leak, electrical_overload
    fault_progress = Column(Float, default=0.0) # 0.0 to 1.0

