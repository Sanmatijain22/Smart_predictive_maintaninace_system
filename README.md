# SMARTMFG AI – Predictive Maintenance Intelligence Suite

**Plant:** `ESCORTS-KUBOTA-HQ`  
**Department:** `Manufacturing Operations`  
**System:** `Industrial Machine Health Monitoring & Predictive Intelligence`  
**Data Classification:** `DEMO / SIMULATED DATA` *(Demonstration pilot model outputs on synthetic training distributions)*

---

## 1. Executive Summary

**SMARTMFG AI** is an industrial-grade, full-stack predictive maintenance platform engineered specifically for tractor and automotive heavy manufacturing facilities such as **Escorts Kubota**.

The application continuously analyzes multi-sensor operational telemetry across heavy machinery, detects anomalous vibration and thermal behaviors using **Isolation Forest**, classifies failure risk likelihood using **Random Forest**, provides physics-informed engineering explanations, and dispatches automated maintenance work orders and downloadable **ReportLab PDF audit reports**.

---

## 2. Monitored Machinery (Escorts Kubota Fleet)

| Machine ID | Equipment Name | Department | Primary Operating Parameters |
|:---|:---|:---|:---|
| **`CNC-001`** | **CNC Machining Center** | Engine Block Machining Line | 62°C, 1.8 mm/s, 2800 RPM, 115 bar, 28.5 kW |
| **`HYD-002`** | **Hydraulic Press** | Heavy Sheet Metal Stamping | 58°C, 2.2 mm/s, 1450 RPM, 210 bar, 46.0 kW |
| **`ENG-003`** | **Tractor Engine Assembly Unit** | Powertrain Assembly Bay 3 | 52°C, 1.2 mm/s, 1200 RPM, 85 bar, 18.0 kW |
| **`GEAR-004`** | **Gear Cutting Machine** | Transmission & Gearbox Shop | 66°C, 2.5 mm/s, 1800 RPM, 95 bar, 32.0 kW |
| **`WELD-005`** | **Welding Robot** | Chassis Robotic Welding Cell | 48°C, 1.0 mm/s, 600 RPM, 45 bar, 14.5 kW |
| **`DRL-006`** | **Drilling Machine** | Cylinder Head Precision Drilling | 55°C, 2.0 mm/s, 2200 RPM, 75 bar, 22.0 kW |
| **`CNV-007`** | **Conveyor Motor** | Assembly Line Final Conveyor | 50°C, 1.5 mm/s, 950 RPM, 30 bar, 12.0 kW |
| **`PUMP-008`** | **Hydraulic Pump Station** | Main Hydraulic Power Pack Station | 64°C, 2.4 mm/s, 1500 RPM, 175 bar, 38.5 kW |

---

## 3. Technology Stack

### Backend
- **Framework:** Python 3.13, FastAPI (Asynchronous REST API + WebSockets)
- **Database:** SQLite with SQLAlchemy ORM (auto-seeded on launch)
- **Machine Learning Engine:** Scikit-Learn
  - **Isolation Forest:** Unsupervised anomaly scoring (120 estimators, contamination=0.15)
  - **Random Forest Classifier:** Multi-class failure risk classification (120 estimators, balanced weights, 99.8% validation accuracy)
  - **Feature Space:** Temperature (°C), Vibration (mm/s), RPM, Hydraulic Pressure (bar), Power (kW), Operating Hours
- **PDF Generation:** ReportLab 5.1 (industrial styled audit reports with color matrices, telemetry tables, AI diagnostics, and recommendations)

### Frontend
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Navy `#0F172A`, Slate, and Blue palette)
- **Visualizations:** Recharts (Donut, Multi-series Area, Bar, and Real-Time Line charts)
- **Icons:** Lucide React

---

## 4. System Architecture

```
Sensor Telemetry (Simulated IoT Stream)
             │
             ▼
 Data Validation & Preprocessing (StandardScaler)
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
Isolation Forest               Random Forest Classifier
(Unsupervised Anomaly Score)   (Low / Medium / High Failure Risk)
      │                                 │
      └──────┬──────────────────────────┘
             ▼
 Physics-Informed Diagnostic Explanations
 (Bearing Wear, Thermal Runaway, Hydraulic Leaks, Overload)
             │
             ▼
 Rule-Based Maintenance Recommendation Engine
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
Automated Alerts & Work Orders   ReportLab PDF Reports
```

---

## 5. Getting Started & Execution Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm

### 1. Run the Backend & Complete Application (Single Command)

The built React application is pre-compiled into `frontend/dist` and directly served by FastAPI at root `http://127.0.0.1:8000`:

```bash
cd backend
python run.py
```

Now open your web browser to:
**`http://127.0.0.1:8000`**

- **REST API Docs (Swagger):** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`

### 2. Optional: Run Frontend in Vite Development Mode

If you wish to edit the frontend code live with hot module replacement:

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173` (Vite automatically proxies API calls to `http://127.0.0.1:8000`).

---

## 6. Demonstration Walkthrough (Prompt Scenarios 1–6)

The application includes an **Interactive Demonstration Walkthrough Bar** at the top of the interface:

1. **Scenario 1 (Nominal Baseline):**
   - Click **"Step 1: Set Baseline"**.
   - `CNC-001` operates normally: Temperature ~62°C, Vibration 1.8 mm/s, Health Score >94%, **Low Risk**.

2. **Scenario 2 (Fault Injection):**
   - Click **"Step 2: Inject Fault"** (or use the *Demo Scenarios* dropdown in the top navbar).
   - Injects thermal degradation and severe bearing wear on `CNC-001`.
   - Watch live temperature ramp to >90°C and vibration surge to >8.0 mm/s.

3. **Scenario 3 (AI Evaluation & Explainability):**
   - Click **"Step 3: View AI Intelligence"** (or navigate to *AI Failure Intelligence* tab).
   - Random Forest reclassifies `CNC-001` to **High Risk** (Risk Score >90%).
   - Contributing factors highlight:
     - *"Critical vibration: 8.4 mm/s (exceeds ISO 10816 class limit 4.5 mm/s)"*
     - *"Thermal runaway warning: 92.1 °C"*

4. **Scenario 4 (Predictive Alert Generation):**
   - Click **"Step 4: Go to Alerts"** (or navigate to *Predictive Alerts* tab).
   - A **CRITICAL** alert is automatically generated for `CNC-001`.
   - Click **"Acknowledge"** or **"Resolve Alert"**; changes persist in SQLite.

5. **Scenario 5 (Prescribed Recommendations):**
   - Click **"Step 5: View Work Orders"** (or navigate to *Maintenance Management* tab).
   - Recommendations engine prescribes:
     - *"Emergency Spindle Bearing Replacement & Laser Alignment"*
     - *"Cooling System Deep Flush & Fan Motor Inspection"*
   - Click **"Mark Completed"** to close out work orders.

6. **Scenario 6 (Downloadable PDF Report):**
   - Click **"Step 6: Download CNC-001 PDF"** (or navigate to *Audit & PDF Reports* tab).
   - Downloads a formal industrial PDF health report generated live via **ReportLab**.

---

## 7. Verification & Automated Test Suite

Run the automated 15-point verification suite:

```bash
python backend/test_app.py
```

**Verification Results:**
- `[PASS]` Test 1: System Health & Escorts-Kubota plant metadata validated
- `[PASS]` Test 2: Dashboard stats verified (Total Machines: 8, Fleet Health Score)
- `[PASS]` Test 3: 8 industrial machines loaded successfully
- `[PASS]` Test 4: Machine Detail for CNC-001 verified
- `[PASS]` Test 5: Sensor telemetry history verified
- `[PASS]` Test 6: Rule-based maintenance recommendation engine evaluated
- `[PASS]` Test 7: Live sensor polling snapshot verified
- `[PASS]` Test 8: Fleet ML predictions verified
- `[PASS]` Test 9a: Ad-hoc nominal AI inference evaluated (Low Risk)
- `[PASS]` Test 9b: Ad-hoc fault AI inference correctly detected anomaly (High Risk)
- `[PASS]` Test 10: Predictive Alerts center retrieved
- `[PASS]` Test 11: Created and persisted maintenance task in SQLite
- `[PASS]` Test 12: Updated task status to COMPLETED
- `[PASS]` Test 13: PDF Health Report generated for CNC-001 via ReportLab
- `[PASS]` Test 14: Simulation scenario triggering and reset verified
- `[PASS]` Test 15: Built frontend dist served directly at root `/`
- **Result:** `ALL 15 TESTS PASSED SUCCESSFULLY! APPLICATION FULLY VALIDATED.`

---

## 8. Data Disclaimer

All sensor readings, vibration spectrums, thermal profiles, and failure risk probabilities within this platform are generated using **synthetic demo simulation models**. They are designed exclusively for demonstration purposes and are **not** actual IoT sensor telemetry from Escorts Kubota production facilities.

