import os

class Settings:
    PROJECT_NAME: str = "SMARTMFG AI – Predictive Maintenance Intelligence Suite"
    PLANT: str = "ESCORTS-KUBOTA-HQ"
    DEPARTMENT: str = "Manufacturing Operations"
    SYSTEM_NAME: str = "Industrial Machine Health Monitoring"
    DATA_DISCLAIMER: str = "DEMO / SIMULATED DATA - Escorts Kubota Manufacturing Facilities Demo"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'smartmfg.db')}"
    MODELS_DIR: str = os.path.join(BASE_DIR, "app", "ml", "saved_models")
    REPORTS_DIR: str = os.path.join(BASE_DIR, "reports_output")
    
    SIMULATION_INTERVAL: float = 3.0 # seconds between simulated sensor ticks

settings = Settings()
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
