from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine
from app.services.simulation_engine import simulation_engine

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

class ScenarioRequest(BaseModel):
    scenario: str # NORMAL, FAULT_INJECTION, HYDRAULIC_LEAK, MOTOR_OVERLOAD
    machine_id: Optional[str] = "CNC-001"
    fault_type: Optional[str] = "bearing_and_thermal"

@router.post("/start")
async def start_simulation():
    await simulation_engine.start()
    return {"status": "started", "is_running": simulation_engine.is_running}

@router.post("/pause")
async def pause_simulation():
    await simulation_engine.pause()
    return {"status": "paused", "is_running": simulation_engine.is_running}

@router.post("/scenario")
def set_simulation_scenario(req: ScenarioRequest):
    simulation_engine.set_scenario(
        scenario=req.scenario,
        machine_id=req.machine_id or "CNC-001",
        fault_type=req.fault_type or "bearing_and_thermal"
    )
    return {
        "status": "scenario_applied",
        "scenario": req.scenario,
        "machine_id": req.machine_id,
        "fault_type": req.fault_type
    }

@router.post("/reset")
def reset_all_machines(db: Session = Depends(get_db)):
    simulation_engine.set_scenario("NORMAL")
    machines = db.query(Machine).all()
    for m in machines:
        m.current_temperature = m.baseline_temp
        m.current_vibration = m.baseline_vib
        m.current_rpm = m.baseline_rpm
        m.current_pressure = m.baseline_press
        m.current_power = m.baseline_power
        m.health_score = 94.0
        m.anomaly_score = 8.0
        m.failure_risk = "Low Risk"
        m.failure_probability = 0.03
        m.status = "healthy"
    db.commit()
    return {"status": "reset_complete", "message": "All machines restored to nominal baseline values."}

@router.get("/status")
def get_simulation_status():
    return {
        "is_running": simulation_engine.is_running,
        "active_scenario": simulation_engine.active_scenario,
        "injected_machine_id": simulation_engine.injected_machine_id,
        "fault_type": simulation_engine.fault_type,
        "fault_step": simulation_engine.fault_step,
        "max_fault_steps": simulation_engine.max_fault_steps
    }
