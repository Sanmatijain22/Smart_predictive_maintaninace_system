from typing import Dict, Any, List

class MaintenanceRecommendationEngine:
    @staticmethod
    def evaluate(temperature: float, vibration: float, rpm: float, pressure: float, power: float, operating_hours: float, failure_risk: str) -> Dict[str, Any]:
        recommendations = []
        priority = "LOW"
        tasks_suggested = []
        
        # Vibration Analysis
        if vibration >= 7.0:
            recommendations.append("Critical vibration detected. Perform immediate dynamic spindle balance check, inspect primary drive bearings, and verify structural foundation anchor bolts.")
            tasks_suggested.append("Emergency Bearing Replacement & Shaft Laser Alignment")
            priority = "CRITICAL"
        elif vibration >= 4.0:
            recommendations.append("Elevated vibration observed. Lubricate bearings, inspect drive belts/couplings for wear, and schedule vibration spectrum FFT analysis.")
            tasks_suggested.append("Spindle Bearing Lubrication & Alignment Check")
            if priority != "CRITICAL":
                priority = "HIGH"

        # Thermal Analysis
        if temperature >= 90.0:
            recommendations.append("Thermal runaway hazard. Flush and refill closed-loop cooling jacket, check coolant flow rate, inspect radiator core for fin blockage, and verify fan operation.")
            tasks_suggested.append("Cooling System Deep Flush & Fan Motor Inspection")
            if priority not in ["CRITICAL"]:
                priority = "HIGH"
        elif temperature >= 78.0:
            recommendations.append("Operating temperature trending above normal envelope. Inspect coolant level, clean heat exchanger filters, and verify cabinet ventilation louvers.")
            tasks_suggested.append("Coolant Level Top-up & Filter Element Cleaning")
            if priority == "LOW":
                priority = "MEDIUM"

        # Pressure Analysis
        if pressure < 60.0:
            recommendations.append("Severe hydraulic pressure drop. Inspect suction strainers, check for manifold bypass leakage, inspect pump impellers, and check hydraulic oil reservoir level.")
            tasks_suggested.append("Hydraulic System Leak Inspection & Suction Filter Replacement")
            if priority == "LOW":
                priority = "HIGH"
        elif pressure > 200.0:
            recommendations.append("Hydraulic over-pressure condition. Check proportional pressure relief valve spool calibration and clear line restrictions.")
            tasks_suggested.append("Pressure Relief Valve Recalibration & Orifice Check")
            if priority == "LOW":
                priority = "MEDIUM"

        # Power Analysis
        if power > 50.0:
            recommendations.append("Abnormal power consumption. Inspect 3-phase motor current balance, check winding insulation resistance (Megger test), and inspect guideways for mechanical binding.")
            tasks_suggested.append("Motor Electrical Megger Test & Axis Guideway Lubrication")
            if priority == "LOW":
                priority = "MEDIUM"

        # Operating Hours Analysis
        if operating_hours > 7500.0:
            recommendations.append("Machine has exceeded 7,500 operating hours. Schedule comprehensive factory overhaul, replacement of critical rubber seals, and calibration of positioning encoders.")
            tasks_suggested.append("7,500-Hour Major Overhaul & Seal Kit Refresh")
            if priority == "LOW":
                priority = "MEDIUM"

        if not recommendations:
            recommendations.append("Machine parameters are well within standard operating limits. Continue routine daily autonomous maintenance (cleaning, lubrication, inspection).")
            tasks_suggested.append("Routine Autonomous Daily Inspection")
            priority = "LOW"

        # Combine priority with failure risk
        if failure_risk == "High Risk" and priority in ["LOW", "MEDIUM"]:
            priority = "HIGH"

        return {
            "priority": priority,
            "recommendations": recommendations,
            "tasks_suggested": tasks_suggested,
            "summary_recommendation": recommendations[0] if recommendations else "Nominal operating condition."
        }

maintenance_engine = MaintenanceRecommendationEngine()

