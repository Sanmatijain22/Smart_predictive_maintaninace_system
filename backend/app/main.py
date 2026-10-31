import os
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.services.simulation_engine import simulation_engine
from app.routes import (
    dashboard,
    machines,
    sensors,
    predictions,
    alerts,
    maintenance,
    reports,
    simulation
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables, seed data, and start simulation
    print("Initializing Smart Manufacturing Database & Tables...")
    Base.metadata.create_all(bind=engine)
    simulation_engine.seed_database_if_needed()
    await simulation_engine.start()
    print("Simulation engine activated.")
    yield
    # Shutdown
    await simulation_engine.pause()
    print("Application shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Industrial AI-powered Predictive Maintenance & Machine Failure Intelligence platform for Escorts Kubota Manufacturing Facilities",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Register Routers
app.include_router(dashboard.router)
app.include_router(machines.router)
app.include_router(sensors.router)
app.include_router(predictions.router)
app.include_router(alerts.router)
app.include_router(maintenance.router)
app.include_router(reports.router)
app.include_router(simulation.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "plant": settings.PLANT,
        "department": settings.DEPARTMENT,
        "system": settings.SYSTEM_NAME,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "disclaimer": settings.DATA_DISCLAIMER,
        "ml_engine": {
            "isolation_forest": "trained_and_loaded",
            "random_forest": "trained_and_loaded",
            "feature_set": ["temperature", "vibration", "rpm", "pressure", "power", "operating_hours"]
        }
    }

# Mount built React frontend if dist directory exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to SMARTMFG AI – Predictive Maintenance Intelligence Suite API",
            "docs_url": "/docs",
            "plant": settings.PLANT,
            "status": "operational"
        }
