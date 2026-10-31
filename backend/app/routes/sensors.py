from typing import List, Dict, Any
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine
from app.services.simulation_engine import connection_manager

router = APIRouter(tags=["Sensors"])

@router.get("/api/sensors/live")
def get_live_sensors(db: Session = Depends(get_db)):
    machines = db.query(Machine).all()
    results = []
    for m in machines:
        results.append({
            "machine_id": m.id,
            "machine_name": m.name,
            "department": m.department,
            "status": m.status,
            "temperature": m.current_temperature,
            "vibration": m.current_vibration,
            "rpm": m.current_rpm,
            "pressure": m.current_pressure,
            "power": m.current_power,
            "operating_hours": m.operating_hours,
            "health_score": m.health_score,
            "anomaly_score": m.anomaly_score,
            "failure_risk": m.failure_risk,
            "failure_probability": m.failure_probability,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None
        })
    return {"count": len(results), "sensors": results}

@router.websocket("/ws/sensors")
async def websocket_sensors_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; wait for ping/client message
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception:
        connection_manager.disconnect(websocket)

