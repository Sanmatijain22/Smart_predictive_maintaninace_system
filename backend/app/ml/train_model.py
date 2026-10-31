import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_synthetic_industrial_data(n_samples: int = 7500, random_seed: int = 42):
    """
    Generate synthetic sensor data representing realistic industrial tractor & automotive
    manufacturing equipment (CNC machining, hydraulic presses, assembly lines, pumps).
    Features:
      1. Temperature (°C): 40 - 110
      2. Vibration (mm/s): 0.5 - 15.0
      3. Rotational Speed (RPM): 400 - 3500
      4. Hydraulic Pressure (bar): 20 - 250
      5. Power Consumption (kW): 5 - 85
      6. Operating Hours: 100 - 9000
    """
    np.random.seed(random_seed)
    
    # Machine profiles baseline samples
    # We create ~75% Normal (Low Risk), ~17% Degraded (Medium Risk), ~8% Impending Failure (High Risk)
    n_normal = int(n_samples * 0.75)
    n_medium = int(n_samples * 0.17)
    n_high = n_samples - n_normal - n_medium
    
    # 1. Normal (Low Risk)
    temp_norm = np.random.normal(loc=62.0, scale=4.5, size=n_normal)
    vib_norm = np.random.normal(loc=1.8, scale=0.4, size=n_normal)
    rpm_norm = np.random.normal(loc=2200.0, scale=120.0, size=n_normal)
    press_norm = np.random.normal(loc=125.0, scale=8.0, size=n_normal)
    power_norm = np.random.normal(loc=26.0, scale=3.0, size=n_normal)
    hours_norm = np.random.uniform(100.0, 4500.0, size=n_normal)
    labels_norm = np.zeros(n_normal, dtype=int) # 0 = Low Risk
    
    # 2. Degraded / Warning (Medium Risk)
    # Signs: moderate heat buildup (75-88°C), or vibration rise (3.5-6.5 mm/s), or pressure instability
    temp_med = np.random.normal(loc=78.0, scale=5.0, size=n_medium)
    vib_med = np.random.normal(loc=4.5, scale=0.9, size=n_medium)
    rpm_med = np.random.normal(loc=2050.0, scale=200.0, size=n_medium)
    press_med = np.random.normal(loc=102.0, scale=15.0, size=n_medium)
    power_med = np.random.normal(loc=36.0, scale=5.0, size=n_medium)
    hours_med = np.random.uniform(3500.0, 7500.0, size=n_medium)
    labels_med = np.ones(n_medium, dtype=int) # 1 = Medium Risk
    
    # 3. Impending Failure (High Risk)
    # Severe anomalies: thermal runaway (>90°C), severe bearing vibration (>7.5 mm/s), severe pressure drop (<70 bar) or surge (>200 bar), motor overcurrent (>50kW)
    temp_high = np.random.normal(loc=96.0, scale=7.0, size=n_high)
    vib_high = np.random.normal(loc=9.2, scale=1.8, size=n_high)
    rpm_high = np.random.normal(loc=1750.0, scale=350.0, size=n_high)
    is_surge = np.random.rand(n_high) > 0.5
    press_high = np.where(
        is_surge,
        np.random.normal(loc=210.0, scale=15.0, size=n_high), # Pressure blockage / surge
        np.random.normal(loc=55.0, scale=10.0, size=n_high)  # Pressure loss / leak
    )
    power_high = np.random.normal(loc=58.0, scale=8.0, size=n_high)
    hours_high = np.random.uniform(5000.0, 9500.0, size=n_high)
    labels_high = np.full(n_high, 2, dtype=int) # 2 = High Risk

    # Combine
    temp = np.clip(np.concatenate([temp_norm, temp_med, temp_high]), 35.0, 130.0)
    vib = np.clip(np.concatenate([vib_norm, vib_med, vib_high]), 0.2, 20.0)
    rpm = np.clip(np.concatenate([rpm_norm, rpm_med, rpm_high]), 200.0, 4500.0)
    press = np.clip(np.concatenate([press_norm, press_med, press_high]), 15.0, 260.0)
    power = np.clip(np.concatenate([power_norm, power_med, power_high]), 3.0, 95.0)
    hours = np.clip(np.concatenate([hours_norm, hours_med, hours_high]), 50.0, 10000.0)
    labels = np.concatenate([labels_norm, labels_med, labels_high])

    df = pd.DataFrame({
        "temperature": temp,
        "vibration": vib,
        "rpm": rpm,
        "pressure": press,
        "power": power,
        "operating_hours": hours,
        "failure_risk_label": labels
    })
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df

def train_and_save_models():
    print("Generating industrial synthetic dataset...")
    df = generate_synthetic_industrial_data(n_samples=7500)
    
    features = ["temperature", "vibration", "rpm", "pressure", "power", "operating_hours"]
    X = df[features]
    y = df["failure_risk_label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 1. Feature Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 2. Isolation Forest (Trained on nominal/all data for unsupervised anomaly scoring)
    print("Training Isolation Forest Anomaly Detector...")
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.15,
        random_state=42,
        max_samples="auto"
    )
    iso_forest.fit(X_train_scaled)
    
    # 3. Random Forest Classifier
    print("Training Random Forest Classifier for Failure Risk Assessment...")
    rf_clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    rf_clf.fit(X_train_scaled, y_train)
    
    # Evaluation
    y_pred = rf_clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"Random Forest Validation Accuracy: {acc * 100:.2f}%")
    report = classification_report(y_test, y_pred, target_names=["Low Risk", "Medium Risk", "High Risk"], output_dict=True)
    
    # Feature Importances
    importances = dict(zip(features, rf_clf.feature_importances_.tolist()))
    print("Feature Importances:", importances)
    
    # Save artifacts
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
    joblib.dump(iso_forest, os.path.join(MODELS_DIR, "isolation_forest.joblib"))
    joblib.dump(rf_clf, os.path.join(MODELS_DIR, "random_forest.joblib"))
    
    metadata = {
        "model_version": "v1.4-RF+IF-Industrial",
        "trained_date": "2026-10-30",
        "sample_size": len(df),
        "features": features,
        "classes": ["Low Risk", "Medium Risk", "High Risk"],
        "validation_accuracy": float(acc),
        "feature_importances": importances,
        "classification_report": report,
        "disclaimer": "DEMO / SIMULATED DATA - Escorts Kubota Manufacturing Facilities Demo. Predictions are demonstration model outputs on synthetic training distributions."
    }
    
    with open(os.path.join(MODELS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"All models and metadata successfully saved to: {MODELS_DIR}")
    return metadata

if __name__ == "__main__":
    train_and_save_models()
