from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine, SensorReading, Alert
from app.services.failure_prediction import prediction_service
from app.services.maintenance_engine import maintenance_engine
from app.services.pdf_report_generator import generate_machine_pdf_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{machine_id}")
def download_machine_pdf_report(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")

    # Fetch last 20 sensor readings
    latest_readings = db.query(SensorReading)\
        .filter(SensorReading.machine_id == machine_id)\
        .order_by(SensorReading.timestamp.desc())\
        .limit(20)\
        .all()

    # Fetch alerts for this machine
    alerts = db.query(Alert)\
        .filter(Alert.machine_id == machine_id)\
        .order_by(Alert.timestamp.desc())\
        .limit(10)\
        .all()

    # Get ML prediction diagnostics & explanations
    pred_info = prediction_service.predict(
        machine.current_temperature,
        machine.current_vibration,
        machine.current_rpm,
        machine.current_pressure,
        machine.current_power,
        machine.operating_hours
    )

    # Get actionable recommendations
    recs = maintenance_engine.evaluate(
        machine.current_temperature,
        machine.current_vibration,
        machine.current_rpm,
        machine.current_pressure,
        machine.current_power,
        machine.operating_hours,
        machine.failure_risk
    )

    pdf_bytes = generate_machine_pdf_report(
        machine=machine,
        latest_readings=latest_readings,
        predictions_info=pred_info,
        alerts=alerts,
        recommendations=recs
    )

    filename = f"SMARTMFG_{machine.id}_HealthReport.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
