import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert, Machine
from app.schemas import AlertResponse, AlertActionRequest

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None, description="CRITICAL, HIGH, MEDIUM, LOW"),
    resolved: Optional[bool] = Query(None, description="Filter resolved status"),
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    if machine_id:
        query = query.filter(Alert.machine_id == machine_id)
        
    alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()
    
    # Populate machine_name
    results = []
    for a in alerts:
        m = db.query(Machine).filter(Machine.id == a.machine_id).first()
        results.append(AlertResponse(
            id=a.id,
            machine_id=a.machine_id,
            machine_name=m.name if m else a.machine_id,
            timestamp=a.timestamp,
            severity=a.severity,
            anomaly_type=a.anomaly_type,
            message=a.message,
            detected_value=a.detected_value,
            threshold_value=a.threshold_value,
            recommended_action=a.recommended_action,
            acknowledged=a.acknowledged,
            acknowledged_at=a.acknowledged_at,
            acknowledged_by=a.acknowledged_by,
            resolved=a.resolved,
            resolved_at=a.resolved_at,
            resolved_by=a.resolved_by
        ))
    return results

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: str, action: AlertActionRequest = AlertActionRequest(), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
    alert.acknowledged = True
    alert.acknowledged_at = datetime.datetime.utcnow()
    alert.acknowledged_by = action.operator_name or "Station Engineer"
    db.commit()
    db.refresh(alert)
    
    m = db.query(Machine).filter(Machine.id == alert.machine_id).first()
    return AlertResponse(
        id=alert.id,
        machine_id=alert.machine_id,
        machine_name=m.name if m else alert.machine_id,
        timestamp=alert.timestamp,
        severity=alert.severity,
        anomaly_type=alert.anomaly_type,
        message=alert.message,
        detected_value=alert.detected_value,
        threshold_value=alert.threshold_value,
        recommended_action=alert.recommended_action,
        acknowledged=alert.acknowledged,
        acknowledged_at=alert.acknowledged_at,
        acknowledged_by=alert.acknowledged_by,
        resolved=alert.resolved,
        resolved_at=alert.resolved_at,
        resolved_by=alert.resolved_by
    )

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: str, action: AlertActionRequest = AlertActionRequest(), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
    alert.resolved = True
    alert.resolved_at = datetime.datetime.utcnow()
    alert.resolved_by = action.operator_name or "Maintenance Supervisor"
    db.commit()
    db.refresh(alert)
    
    m = db.query(Machine).filter(Machine.id == alert.machine_id).first()
    return AlertResponse(
        id=alert.id,
        machine_id=alert.machine_id,
        machine_name=m.name if m else alert.machine_id,
        timestamp=alert.timestamp,
        severity=alert.severity,
        anomaly_type=alert.anomaly_type,
        message=alert.message,
        detected_value=alert.detected_value,
        threshold_value=alert.threshold_value,
        recommended_action=alert.recommended_action,
        acknowledged=alert.acknowledged,
        acknowledged_at=alert.acknowledged_at,
        acknowledged_by=alert.acknowledged_by,
        resolved=alert.resolved,
        resolved_at=alert.resolved_at,
        resolved_by=alert.resolved_by
    )

