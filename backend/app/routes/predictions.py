import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine, Prediction
from app.schemas import PredictionAnalyzeRequest, PredictionResponse
from app.services.anomaly_detection import anomaly_service
from app.services.failure_prediction import prediction_service
from app.services.maintenance_engine import maintenance_engine
from app.config import settings

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("")
def get_recent_predictions(db: Session = Depends(get_db)):
    """
    Returns latest predictions across all monitored machines.
    """
    machines = db.query(Machine).all()
    results = []
    for m in machines:
        pred = prediction_service.predict(
            m.current_temperature,
            m.current_vibration,
            m.current_rpm,
            m.current_pressure,
            m.current_power,
            m.operating_hours
        )
        is_anom, anom_score = anomaly_service.detect(
            m.current_temperature,
            m.current_vibration,
            m.current_rpm,
            m.current_pressure,
            m.current_power,
            m.operating_hours
        )
        rec = maintenance_engine.evaluate(
            m.current_temperature,
            m.current_vibration,
            m.current_rpm,
            m.current_pressure,
            m.current_power,
            m.operating_hours,
            pred["failure_risk"]
        )
        results.append({
            "machine_id": m.id,
            "machine_name": m.name,
            "department": m.department,
            "health_score": m.health_score,
            "current_temperature": m.current_temperature,
            "current_vibration": m.current_vibration,
            "current_rpm": m.current_rpm,
            "current_pressure": m.current_pressure,
            "current_power": m.current_power,
            "operating_hours": m.operating_hours,
            "failure_risk": pred["failure_risk"],
            "risk_score": pred["risk_score"],
            "failure_probability": pred["failure_probability"],
            "is_anomaly": is_anom,
            "anomaly_score": anom_score,
            "contributing_factors": pred["contributing_factors"],
            "explanation": pred["explanation"],
            "model_version": pred["model_version"],
            "recommended_action": rec["summary_recommendation"],
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
    return {
        "disclaimer": settings.DATA_DISCLAIMER,
        "model_architecture": "Ensemble (Isolation Forest 120 estimators + Balanced Random Forest Classifier 120 estimators)",
        "predictions": results
    }

@router.post("/analyze")
def analyze_custom_telemetry(req: PredictionAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Interactive 'What-If' ML inference endpoint.
    Allows maintenance engineers to test sensor thresholds and observe immediate AI classifications.
    """
    is_anom, anom_score = anomaly_service.detect(
        req.temperature,
        req.vibration,
        req.rpm,
        req.pressure,
        req.power,
        req.operating_hours
    )
    
    pred = prediction_service.predict(
        req.temperature,
        req.vibration,
        req.rpm,
        req.pressure,
        req.power,
        req.operating_hours
    )
    
    rec = maintenance_engine.evaluate(
        req.temperature,
        req.vibration,
        req.rpm,
        req.pressure,
        req.power,
        req.operating_hours,
        pred["failure_risk"]
    )
    
    return {
        "disclaimer": settings.DATA_DISCLAIMER,
        "input_telemetry": {
            "temperature": req.temperature,
            "vibration": req.vibration,
            "rpm": req.rpm,
            "pressure": req.pressure,
            "power": req.power,
            "operating_hours": req.operating_hours
        },
        "is_anomaly": is_anom,
        "anomaly_score": anom_score,
        "failure_risk": pred["failure_risk"],
        "risk_score": pred["risk_score"],
        "failure_probability": pred["failure_probability"],
        "contributing_factors": pred["contributing_factors"],
        "explanation": pred["explanation"],
        "model_version": pred["model_version"],
        "recommended_priority": rec["priority"],
        "recommended_action": rec["summary_recommendation"],
        "tasks_suggested": rec["tasks_suggested"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

