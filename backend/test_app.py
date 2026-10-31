import sys
import os
import io

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=================================================================")
    print("STARTING SMARTMFG AI FULL-STACK ENDPOINT & ENGINE TEST SUITE")
    print("=================================================================")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    data = res.json()
    assert data["plant"] == "ESCORTS-KUBOTA-HQ"
    assert data["ml_engine"]["isolation_forest"] == "trained_and_loaded"
    print("[PASS] Test 1: System Health & Escorts-Kubota plant metadata validated.")

    # 2. Dashboard Stats
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200, f"Dashboard stats failed: {res.status_code}"
    stats = res.json()
    assert stats["total_machines"] == 8
    assert "health_distribution" in stats
    assert "downtime_trends" in stats
    print(f"[PASS] Test 2: Dashboard stats verified (Total Machines: {stats['total_machines']}, Overall Health: {stats['overall_health']}%).")

    # 3. Machines List & Filter
    res = client.get("/api/machines?status=all")
    assert res.status_code == 200
    machines = res.json()
    assert len(machines) == 8
    print(f"[PASS] Test 3: 8 industrial machines loaded successfully.")

    # 4. Machine Detail
    res = client.get("/api/machines/CNC-001")
    assert res.status_code == 200
    m_detail = res.json()
    assert m_detail["id"] == "CNC-001"
    assert m_detail["name"] == "CNC Machining Center"
    print(f"[PASS] Test 4: Machine Detail for CNC-001 verified.")

    # 5. Machine History
    res = client.get("/api/machines/CNC-001/history?limit=10")
    assert res.status_code == 200
    history = res.json()
    assert len(history) > 0
    print(f"[PASS] Test 5: Sensor telemetry history for CNC-001 verified ({len(history)} readings).")

    # 6. Machine Recommendations
    res = client.get("/api/machines/CNC-001/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert "recommendations" in recs
    assert "prediction_breakdown" in recs
    print("[PASS] Test 6: Rule-based maintenance recommendation engine evaluated.")

    # 7. Live Sensors
    res = client.get("/api/sensors/live")
    assert res.status_code == 200
    sensors = res.json()
    assert sensors["count"] == 8
    print("[PASS] Test 7: Live sensor polling snapshot verified.")

    # 8. Predictions list
    res = client.get("/api/predictions")
    assert res.status_code == 200
    preds = res.json()
    assert len(preds["predictions"]) == 8
    print("[PASS] Test 8: Model prediction list across fleet verified.")

    # 9. Ad-hoc AI Inference (What-If analysis)
    # Test nominal input
    res_nominal = client.post("/api/predictions/analyze", json={
        "temperature": 60.0,
        "vibration": 1.8,
        "rpm": 2400.0,
        "pressure": 120.0,
        "power": 25.0,
        "operating_hours": 1500.0
    })
    assert res_nominal.status_code == 200
    assert res_nominal.json()["failure_risk"] == "Low Risk"
    print("[PASS] Test 9a: Ad-hoc nominal AI inference evaluated (Low Risk).")

    # Test severe fault input (Scenario 2: Thermal + Vibration exceedance)
    res_fault = client.post("/api/predictions/analyze", json={
        "temperature": 96.0,
        "vibration": 8.9,
        "rpm": 1900.0,
        "pressure": 110.0,
        "power": 45.0,
        "operating_hours": 5000.0
    })
    assert res_fault.status_code == 200
    fault_data = res_fault.json()
    assert fault_data["failure_risk"] == "High Risk"
    assert fault_data["is_anomaly"] is True
    assert len(fault_data["contributing_factors"]) > 0
    print(f"[PASS] Test 9b: Ad-hoc fault AI inference correctly detected anomaly (Risk: {fault_data['failure_risk']}, Anomaly Score: {fault_data['anomaly_score']}%).")

    # 10. Alerts & Actions
    res_alerts = client.get("/api/alerts")
    assert res_alerts.status_code == 200
    alerts = res_alerts.json()
    print(f"[PASS] Test 10: Alerts center retrieved ({len(alerts)} alerts).")

    # 11. Maintenance Tasks & Creation
    new_task_payload = {
        "machine_id": "CNC-001",
        "title": "Automated Spindle Inspection Work Order",
        "description": "Examine radial runout and lubricate front bearings.",
        "priority": "HIGH",
        "category": "Predictive",
        "assigned_technician": "R. Verma (Lead Tech)",
        "estimated_hours": 3.0
    }
    res_task = client.post("/api/maintenance", json=new_task_payload)
    assert res_task.status_code == 200
    created_task = res_task.json()
    assert created_task["machine_id"] == "CNC-001"
    print(f"[PASS] Test 11: Created and persisted maintenance task ({created_task['id']}).")

    # 12. Update Maintenance Task to COMPLETED
    res_update = client.put(f"/api/maintenance/{created_task['id']}", json={"status": "COMPLETED"})
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "COMPLETED"
    print("[PASS] Test 12: Updated task status to COMPLETED in database.")

    # 13. Downloadable PDF Report Generation with ReportLab
    res_pdf = client.get("/api/reports/CNC-001")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000
    print(f"[PASS] Test 13: PDF Health Report generated for CNC-001 ({len(res_pdf.content)} bytes).")

    # 14. Simulation Scenario Control
    res_scen = client.post("/api/simulation/scenario", json={
        "scenario": "FAULT_INJECTION",
        "machine_id": "CNC-001",
        "fault_type": "bearing_and_thermal"
    })
    assert res_scen.status_code == 200
    assert res_scen.json()["status"] == "scenario_applied"

    # Reset
    res_reset = client.post("/api/simulation/reset")
    assert res_reset.status_code == 200
    print("[PASS] Test 14: Simulation scenario triggering and reset verified.")

    # 15. Static Frontend check
    res_fe = client.get("/")
    assert res_fe.status_code == 200
    assert "SMARTMFG" in res_fe.text or "<!doctype html>" in res_fe.text
    print("[PASS] Test 15: Built frontend dist served directly at root /.")

    print("=================================================================")
    print("ALL 15 TESTS PASSED SUCCESSFULLY! APPLICATION FULLY VALIDATED.")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
