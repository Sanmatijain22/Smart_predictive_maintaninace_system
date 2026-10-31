import asyncio
import datetime
import random
import uuid
from typing import List, Set
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Machine, SensorReading, Alert, Prediction, SimulationSetting, MaintenanceTask
from app.services.anomaly_detection import anomaly_service
from app.services.failure_prediction import prediction_service
from app.services.maintenance_engine import maintenance_engine

INITIAL_MACHINES = [
    {
        "id": "CNC-001",
        "name": "CNC Machining Center",
        "department": "Engine Block Machining Line",
        "model_number": "EK-CNC-5AXIS-800",
        "installation_date": "2023-03-12",
        "operating_hours": 3420.0,
        "baseline_temp": 62.0,
        "baseline_vib": 1.8,
        "baseline_rpm": 2800.0,
        "baseline_press": 115.0,
        "baseline_power": 28.5,
    },
    {
        "id": "HYD-002",
        "name": "Hydraulic Press",
        "department": "Heavy Sheet Metal Stamping",
        "model_number": "EK-HP-800TON",
        "installation_date": "2022-08-20",
        "operating_hours": 5120.0,
        "baseline_temp": 58.0,
        "baseline_vib": 2.2,
        "baseline_rpm": 1450.0,
        "baseline_press": 210.0,
        "baseline_power": 46.0,
    },
    {
        "id": "ENG-003",
        "name": "Tractor Engine Assembly Unit",
        "department": "Powertrain Assembly Bay 3",
        "model_number": "EK-ENG-ASM-V4",
        "installation_date": "2023-11-05",
        "operating_hours": 2180.0,
        "baseline_temp": 52.0,
        "baseline_vib": 1.2,
        "baseline_rpm": 1200.0,
        "baseline_press": 85.0,
        "baseline_power": 18.0,
    },
    {
        "id": "GEAR-004",
        "name": "Gear Cutting Machine",
        "department": "Transmission & Gearbox Shop",
        "model_number": "EK-GEAR-HOB-450",
        "installation_date": "2022-05-18",
        "operating_hours": 6250.0,
        "baseline_temp": 66.0,
        "baseline_vib": 2.5,
        "baseline_rpm": 1800.0,
        "baseline_press": 95.0,
        "baseline_power": 32.0,
    },
    {
        "id": "WELD-005",
        "name": "Welding Robot",
        "department": "Chassis Robotic Welding Cell",
        "model_number": "EK-ROBO-ARC-6AX",
        "installation_date": "2024-01-10",
        "operating_hours": 1420.0,
        "baseline_temp": 48.0,
        "baseline_vib": 1.0,
        "baseline_rpm": 600.0,
        "baseline_press": 45.0,
        "baseline_power": 14.5,
    },
    {
        "id": "DRL-006",
        "name": "Drilling Machine",
        "department": "Cylinder Head Precision Drilling",
        "model_number": "EK-MULTI-DRL-16",
        "installation_date": "2023-06-25",
        "operating_hours": 3890.0,
        "baseline_temp": 55.0,
        "baseline_vib": 2.0,
        "baseline_rpm": 2200.0,
        "baseline_press": 75.0,
        "baseline_power": 22.0,
    },
    {
        "id": "CNV-007",
        "name": "Conveyor Motor",
        "department": "Assembly Line Final Conveyor",
        "model_number": "EK-DRIVE-CNV-55KW",
        "installation_date": "2022-02-14",
        "operating_hours": 7820.0,
        "baseline_temp": 50.0,
        "baseline_vib": 1.5,
        "baseline_rpm": 950.0,
        "baseline_press": 30.0,
        "baseline_power": 12.0,
    },
    {
        "id": "PUMP-008",
        "name": "Hydraulic Pump Station",
        "department": "Main Hydraulic Power Pack Station",
        "model_number": "EK-PUMP-SYS-350",
        "installation_date": "2023-09-30",
        "operating_hours": 4310.0,
        "baseline_temp": 64.0,
        "baseline_vib": 2.4,
        "baseline_rpm": 1500.0,
        "baseline_press": 175.0,
        "baseline_power": 38.5,
    }
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)

connection_manager = ConnectionManager()

class SimulationEngine:
    def __init__(self):
        self.is_running = True
        self.task = None
        self.active_scenario = "NORMAL"
        self.injected_machine_id = "CNC-001"
        self.fault_type = "bearing_and_thermal" # bearing_and_thermal, hydraulic_leak, motor_overload
        self.fault_step = 0
        self.max_fault_steps = 10

    def seed_database_if_needed(self):
        db: Session = SessionLocal()
        try:
            count = db.query(Machine).count()
            if count == 0:
                print("Seeding initial 8 industrial machines into database...")
                now = datetime.datetime.utcnow()
                for data in INITIAL_MACHINES:
                    m = Machine(
                        id=data["id"],
                        name=data["name"],
                        department=data["department"],
                        model_number=data["model_number"],
                        installation_date=data["installation_date"],
                        operating_hours=data["operating_hours"],
                        status="healthy",
                        health_score=94.5,
                        anomaly_score=8.0,
                        failure_risk="Low Risk",
                        failure_probability=0.03,
                        current_temperature=data["baseline_temp"],
                        current_vibration=data["baseline_vib"],
                        current_rpm=data["baseline_rpm"],
                        current_pressure=data["baseline_press"],
                        current_power=data["baseline_power"],
                        baseline_temp=data["baseline_temp"],
                        baseline_vib=data["baseline_vib"],
                        baseline_rpm=data["baseline_rpm"],
                        baseline_press=data["baseline_press"],
                        baseline_power=data["baseline_power"],
                        last_maintenance=now - datetime.timedelta(days=random.randint(15, 60)),
                        next_scheduled_maintenance=now + datetime.timedelta(days=random.randint(20, 60)),
                    )
                    db.add(m)
                    
                    # Add initial baseline sensor history (15 points per machine)
                    for i in range(15, 0, -1):
                        past_time = now - datetime.timedelta(minutes=i * 2)
                        reading = SensorReading(
                            machine_id=data["id"],
                            timestamp=past_time,
                            temperature=round(data["baseline_temp"] + random.uniform(-1.5, 1.5), 1),
                            vibration=round(data["baseline_vib"] + random.uniform(-0.2, 0.2), 2),
                            rpm=round(data["baseline_rpm"] + random.uniform(-20, 20), 1),
                            pressure=round(data["baseline_press"] + random.uniform(-3, 3), 1),
                            power=round(data["baseline_power"] + random.uniform(-1, 1), 1),
                            operating_hours=round(data["operating_hours"] - (i * 0.03), 1),
                            anomaly_detected=False,
                            anomaly_score=round(random.uniform(5.0, 15.0), 1)
                        )
                        db.add(reading)

                # Seed sample initial maintenance tasks
                task1 = MaintenanceTask(
                    id="MNT-101",
                    machine_id="GEAR-004",
                    title="Lubrication & Hob Cutter Inspection",
                    description="Routine scheduled lubrication of spindle gears and check tool wear index.",
                    priority="MEDIUM",
                    status="UPCOMING",
                    category="Preventive",
                    scheduled_date=now + datetime.timedelta(days=3),
                    assigned_technician="V. Sharma (Senior Machinist)",
                    estimated_hours=2.0
                )
                task2 = MaintenanceTask(
                    id="MNT-102",
                    machine_id="CNV-007",
                    title="Conveyor Drive Belt Tension Check",
                    description="Examine belt deflection and drive pulley bearing alignment.",
                    priority="LOW",
                    status="SCHEDULED",
                    category="Inspection",
                    scheduled_date=now + datetime.timedelta(days=7),
                    assigned_technician="R. Patel (Mechanic)",
                    estimated_hours=1.5
                )
                db.add(task1)
                db.add(task2)
                
                db.commit()
                print("Database seeded successfully with 8 machines, sensor history, and maintenance tasks.")
        except Exception as e:
            db.rollback()
            print("Error seeding database:", e)
        finally:
            db.close()

    async def start(self):
        self.is_running = True
        if self.task is None or self.task.done():
            self.task = asyncio.create_task(self._run_loop())
            print("Simulation loop started.")

    async def pause(self):
        self.is_running = False
        print("Simulation loop paused.")

    def set_scenario(self, scenario: str, machine_id: str = "CNC-001", fault_type: str = "bearing_and_thermal"):
        self.active_scenario = scenario
        self.injected_machine_id = machine_id
        self.fault_type = fault_type
        if scenario == "FAULT_INJECTION":
            self.fault_step = 1
        else:
            self.fault_step = 0

    async def _run_loop(self):
        while True:
            try:
                if self.is_running:
                    await self._tick()
            except Exception as e:
                print("Exception in simulation tick:", e)
            await asyncio.sleep(3.0)

    async def _tick(self):
        db: Session = SessionLocal()
        try:
            machines = db.query(Machine).all()
            if not machines:
                return

            now = datetime.datetime.utcnow()
            payload = []

            for m in machines:
                # Calculate new sensor readings with machine-specific bounds
                base_t = m.baseline_temp
                base_v = m.baseline_vib
                base_rpm = m.baseline_rpm
                base_p = m.baseline_press
                base_kw = m.baseline_power

                # Check if this machine is injected with fault in the scenario
                is_injected = (
                    self.active_scenario == "FAULT_INJECTION" 
                    and m.id == self.injected_machine_id
                )

                if is_injected:
                    self.fault_step = min(self.fault_step + 1, self.max_fault_steps)
                    severity_factor = self.fault_step / self.max_fault_steps # 0.1 to 1.0

                    if self.fault_type == "bearing_and_thermal":
                        # CNC overheating + critical vibration
                        new_t = base_t + (severity_factor * 33.0) + random.uniform(-1.0, 1.0) # Up to ~95°C
                        new_v = base_v + (severity_factor * 6.8) + random.uniform(-0.3, 0.4)  # Up to ~8.6 mm/s
                        new_rpm = base_rpm - (severity_factor * 250.0) + random.uniform(-15, 15)
                        new_p = base_p + random.uniform(-2, 2)
                        new_kw = base_kw + (severity_factor * 18.0) + random.uniform(-1, 1) # Overcurrent
                    elif self.fault_type == "hydraulic_leak":
                        # Hydraulic press pressure loss
                        new_t = base_t + (severity_factor * 18.0) + random.uniform(-1.0, 1.0)
                        new_v = base_v + (severity_factor * 2.5) + random.uniform(-0.2, 0.2)
                        new_rpm = base_rpm + random.uniform(-10, 10)
                        new_p = max(25.0, base_p - (severity_factor * 155.0) + random.uniform(-3, 3)) # Down to 55 bar
                        new_kw = base_kw + (severity_factor * 8.0)
                    else:
                        # Electrical overload
                        new_t = base_t + (severity_factor * 25.0)
                        new_v = base_v + (severity_factor * 3.5)
                        new_rpm = base_rpm - (severity_factor * 200.0)
                        new_p = base_p
                        new_kw = base_kw + (severity_factor * 28.0)
                else:
                    # Normal realistic bounded sensor jitter
                    new_t = base_t + random.uniform(-1.2, 1.2)
                    new_v = max(0.4, base_v + random.uniform(-0.15, 0.15))
                    new_rpm = max(100.0, base_rpm + random.uniform(-15.0, 15.0))
                    new_p = max(10.0, base_p + random.uniform(-2.5, 2.5))
                    new_kw = max(2.0, base_kw + random.uniform(-0.8, 0.8))

                new_t = round(float(new_t), 1)
                new_v = round(float(new_v), 2)
                new_rpm = round(float(new_rpm), 1)
                new_p = round(float(new_p), 1)
                new_kw = round(float(new_kw), 1)
                m.operating_hours = round(float(m.operating_hours + 0.005), 2)

                # Anomaly Detection & ML Prediction
                is_anomaly, anomaly_score = anomaly_service.detect(
                    new_t, new_v, new_rpm, new_p, new_kw, m.operating_hours
                )
                pred_result = prediction_service.predict(
                    new_t, new_v, new_rpm, new_p, new_kw, m.operating_hours
                )

                # Compute Health Score (100 - weighted risk & anomaly)
                health_score = round(max(5.0, min(100.0, 100.0 - (pred_result["risk_score"] * 0.7 + anomaly_score * 0.3))), 1)

                # Machine status
                if pred_result["failure_risk"] == "High Risk" or health_score < 45.0:
                    status = "critical"
                elif pred_result["failure_risk"] == "Medium Risk" or health_score < 75.0:
                    status = "warning"
                else:
                    status = "healthy"

                # Update Machine record
                m.current_temperature = new_t
                m.current_vibration = new_v
                m.current_rpm = new_rpm
                m.current_pressure = new_p
                m.current_power = new_kw
                m.health_score = health_score
                m.anomaly_score = anomaly_score
                m.failure_risk = pred_result["failure_risk"]
                m.failure_probability = pred_result["failure_probability"]
                m.status = status
                m.updated_at = now

                # Save SensorReading
                reading = SensorReading(
                    machine_id=m.id,
                    timestamp=now,
                    temperature=new_t,
                    vibration=new_v,
                    rpm=new_rpm,
                    pressure=new_p,
                    power=new_kw,
                    operating_hours=m.operating_hours,
                    anomaly_detected=is_anomaly,
                    anomaly_score=anomaly_score
                )
                db.add(reading)

                # Prune older readings if excessive (>120 per machine)
                excess_count = db.query(SensorReading).filter(SensorReading.machine_id == m.id).count()
                if excess_count > 120:
                    oldest_to_delete = db.query(SensorReading).filter(SensorReading.machine_id == m.id).order_by(SensorReading.timestamp.asc()).limit(20).all()
                    for old_r in oldest_to_delete:
                        db.delete(old_r)

                # Check Alert Generation
                if status in ["warning", "critical"]:
                    # Check if an unresolved alert already exists for this condition recently
                    existing_alert = db.query(Alert).filter(
                        Alert.machine_id == m.id,
                        Alert.resolved == False
                    ).first()

                    if not existing_alert:
                        severity = "CRITICAL" if status == "critical" else "MEDIUM"
                        rec = maintenance_engine.evaluate(new_t, new_v, new_rpm, new_p, new_kw, m.operating_hours, pred_result["failure_risk"])
                        
                        alert_id = f"ALT-{random.randint(1000, 9999)}"
                        if new_v >= 7.0:
                            anomaly_desc = "Critical Spindle Vibration Exceedance"
                            detected_str = f"{new_v} mm/s"
                            thresh_str = "4.5 mm/s (ISO 10816)"
                        elif new_t >= 88.0:
                            anomaly_desc = "Thermal Overheat Runaway"
                            detected_str = f"{new_t} °C"
                            thresh_str = "80.0 °C"
                        elif new_p < 60.0:
                            anomaly_desc = "Severe Hydraulic Pressure Loss"
                            detected_str = f"{new_p} bar"
                            thresh_str = "80.0 bar"
                        else:
                            anomaly_desc = f"Sensor Anomaly Detected ({pred_result['failure_risk']})"
                            detected_str = f"Score: {anomaly_score}%"
                            thresh_str = "Nominal Profile"

                        new_alert = Alert(
                            id=alert_id,
                            machine_id=m.id,
                            timestamp=now,
                            severity=severity,
                            anomaly_type=anomaly_desc,
                            message=f"{m.name}: {anomaly_desc}. Sensor values indicate significant deviation from nominal baseline.",
                            detected_value=detected_str,
                            threshold_value=thresh_str,
                            recommended_action=rec["summary_recommendation"],
                            acknowledged=False,
                            resolved=False
                        )
                        db.add(new_alert)

                payload.append({
                    "id": m.id,
                    "name": m.name,
                    "department": m.department,
                    "temperature": new_t,
                    "vibration": new_v,
                    "rpm": new_rpm,
                    "pressure": new_p,
                    "power": new_kw,
                    "operating_hours": m.operating_hours,
                    "health_score": health_score,
                    "anomaly_score": anomaly_score,
                    "failure_risk": pred_result["failure_risk"],
                    "failure_probability": pred_result["failure_probability"],
                    "status": status,
                    "contributing_factors": pred_result["contributing_factors"],
                    "explanation": pred_result["explanation"]
                })

            db.commit()

            # Broadcast via WebSocket
            await connection_manager.broadcast({
                "type": "TELEMETRY_UPDATE",
                "timestamp": now.isoformat(),
                "machines": payload,
                "scenario": self.active_scenario
            })

        except Exception as e:
            db.rollback()
            print("Error in simulation tick execution:", e)
        finally:
            db.close()

simulation_engine = SimulationEngine()

