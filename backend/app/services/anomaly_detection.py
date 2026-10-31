import os
import joblib
import numpy as np
import pandas as pd
from app.config import settings

class AnomalyDetector:
    def __init__(self):
        self.scaler = None
        self.model = None
        self.feature_names = ["temperature", "vibration", "rpm", "pressure", "power", "operating_hours"]
        self.load_model()

    def load_model(self):
        scaler_path = os.path.join(settings.MODELS_DIR, "scaler.joblib")
        model_path = os.path.join(settings.MODELS_DIR, "isolation_forest.joblib")
        
        if os.path.exists(scaler_path) and os.path.exists(model_path):
            self.scaler = joblib.load(scaler_path)
            self.model = joblib.load(model_path)
            print("AnomalyDetector: Isolation Forest loaded successfully.")
        else:
            print("AnomalyDetector: Model files not found yet.")

    def detect(self, temperature: float, vibration: float, rpm: float, pressure: float, power: float, operating_hours: float):
        if self.model is None or self.scaler is None:
            self.load_model()
            
        features_df = pd.DataFrame(
            [[temperature, vibration, rpm, pressure, power, operating_hours]],
            columns=self.feature_names
        )
        
        if self.scaler is not None and self.model is not None:
            features_scaled = self.scaler.transform(features_df)
            score_raw = self.model.decision_function(features_scaled)[0]
            norm_anomaly_score = float(np.clip((0.15 - score_raw) * 160.0, 0.0, 100.0))
            is_anomaly = bool(norm_anomaly_score >= 50.0 or score_raw < 0.0)
            return is_anomaly, round(norm_anomaly_score, 1)
        else:
            score = 10.0
            if temperature > 80.0 or vibration > 4.5:
                score = 65.0
            if temperature > 90.0 or vibration > 7.0:
                score = 92.0
            return score >= 50.0, round(score, 1)

anomaly_service = AnomalyDetector()

