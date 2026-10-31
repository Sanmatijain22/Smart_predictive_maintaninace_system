from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Machine, Alert, MaintenanceTask, SensorReading
from app.config import settings
from app.services.simulation_engine import simulation_engine

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_machines = db.query(Machine).count()
    healthy_machines = db.query(Machine).filter(Machine.status == "healthy").count()
    observation_machines = db.query(Machine).filter(Machine.status == "warning").count()
    critical_machines = db.query(Machine).filter(Machine.status == "critical").count()
    
    avg_health = db.query(func.avg(Machine.health_score)).scalar() or 0.0
    
    # Active alerts (unresolved)
    active_alerts_count = db.query(Alert).filter(Alert.resolved == False).count()
    
    # Predictive events: machines in warning or critical
    predicted_maintenance_events = observation_machines + (critical_machines * 2)
    
    # Estimated downtime avoided (demo calculation: 14.5 hours per predicted intervention)
    estimated_downtime_avoided = round(predicted_maintenance_events * 14.5 + 42.0, 1)
    # Approximate cost savings in INR (₹45,000 per downtime hour in heavy tractor manufacturing)
    estimated_savings_inr = round(estimated_downtime_avoided * 45000)

    # Machine health distribution data for charts
    health_distribution = [
        {"name": "Healthy (>75%)", "count": healthy_machines, "color": "#16A34A"},
        {"name": "Under Observation (45-75%)", "count": observation_machines, "color": "#EAB308"},
        {"name": "Critical Failure Risk (<45%)", "count": critical_machines, "color": "#DC2626"}
    ]

    # Failure risk distribution
    low_risk = db.query(Machine).filter(Machine.failure_risk == "Low Risk").count()
    med_risk = db.query(Machine).filter(Machine.failure_risk == "Medium Risk").count()
    high_risk = db.query(Machine).filter(Machine.failure_risk == "High Risk").count()
    risk_distribution = [
        {"name": "Low Risk", "count": low_risk, "color": "#16A34A"},
        {"name": "Medium Risk", "count": med_risk, "color": "#EAB308"},
        {"name": "High Risk", "count": high_risk, "color": "#DC2626"}
    ]

    # Department health overview
    dept_stats = []
    departments = db.query(Machine.department).distinct().all()
    for (dept,) in departments:
        dept_machines = db.query(Machine).filter(Machine.department == dept).all()
        dept_avg_health = round(sum(m.health_score for m in dept_machines) / len(dept_machines), 1)
        dept_stats.append({
            "department": dept,
            "machine_count": len(dept_machines),
            "average_health": dept_avg_health
        })

    # Recent alerts
    recent_alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(5).all()
    recent_alerts_data = [
        {
            "id": a.id,
            "machine_id": a.machine_id,
            "timestamp": a.timestamp.isoformat(),
            "severity": a.severity,
            "anomaly_type": a.anomaly_type,
            "message": a.message,
            "recommended_action": a.recommended_action,
            "acknowledged": a.acknowledged,
            "resolved": a.resolved
        }
        for a in recent_alerts
    ]

    # Simulated 7-day downtime trend (demo estimate showing avoided vs actual downtime)
    downtime_trends = [
        {"day": "Mon", "actual_downtime": 1.2, "prevented_downtime": 4.5},
        {"day": "Tue", "actual_downtime": 0.5, "prevented_downtime": 6.2},
        {"day": "Wed", "actual_downtime": 2.1, "prevented_downtime": 5.8},
        {"day": "Thu", "actual_downtime": 0.8, "prevented_downtime": 8.1},
        {"day": "Fri", "actual_downtime": 1.0, "prevented_downtime": 7.4},
        {"day": "Sat", "actual_downtime": 0.4, "prevented_downtime": 5.0},
        {"day": "Sun", "actual_downtime": 0.0, "prevented_downtime": 3.2},
    ]

    return {
        "plant_info": {
            "name": settings.PLANT,
            "department": settings.DEPARTMENT,
            "system": settings.SYSTEM_NAME,
            "disclaimer": settings.DATA_DISCLAIMER
        },
        "total_machines": total_machines,
        "healthy_machines": healthy_machines,
        "observation_machines": observation_machines,
        "critical_machines": critical_machines,
        "overall_health": round(avg_health, 1),
        "predicted_maintenance_events": predicted_maintenance_events,
        "estimated_downtime_avoided_hours": estimated_downtime_avoided,
        "estimated_cost_savings_inr": estimated_savings_inr,
        "active_alerts_count": active_alerts_count,
        "simulation_running": simulation_engine.is_running,
        "active_scenario": simulation_engine.active_scenario,
        "health_distribution": health_distribution,
        "risk_distribution": risk_distribution,
        "department_stats": dept_stats,
        "downtime_trends": downtime_trends,
        "recent_alerts": recent_alerts_data
    }

