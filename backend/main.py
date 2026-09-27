"""
ThermoShelter Designer - FastAPI Main Web Server
SIH 2026 Problem Statement SIH26051
"Software based model development for design of area specific shelter for thermal comfort maintenance"
"""

from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from climate_data import get_all_locations, get_climate_data
from thermal_engine import ShelterInputs, run_thermal_simulation
from optimizer import run_baseline_vs_improved_comparison, run_prototype_optimizer


app = FastAPI(
    title="ThermoShelter Designer API",
    description="Location-aware passive shelter design & thermal comfort engine for extreme climates (SIH 2026 - SIH26051)",
    version="1.0.0",
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    location_id: str = Field(default="leh", description="Location ID: leh, thar, or delhi")
    shelter_inputs: ShelterInputs = Field(default_factory=ShelterInputs)


@app.get("/api/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "system": "ThermoShelter Designer Backend Active"}


@app.get("/api/locations")
def list_locations() -> Dict[str, Any]:
    """Returns list of available climate demo locations."""
    return {"locations": get_all_locations()}


@app.get("/api/climate/{location_id}")
def fetch_climate(location_id: str) -> Dict[str, Any]:
    """Fetch 24-hour climate data for a given location."""
    return get_climate_data(location_id)


@app.post("/api/simulate")
def simulate_shelter(req: SimulationRequest) -> Dict[str, Any]:
    """Runs a 24-hour numerical thermal simulation for the given shelter parameters."""
    climate_info = get_climate_data(req.location_id)
    results = run_thermal_simulation(req.shelter_inputs, climate_info)
    return {
        "location": {
            "id": climate_info["id"],
            "name": climate_info["name"],
            "region": climate_info["region"],
            "altitude_m": climate_info["altitude_m"],
            "is_demo_data": climate_info["is_demo_data"]
        },
        "inputs": req.shelter_inputs.dict(),
        "metrics": results["metrics"],
        "hourly_results": results["hourly_results"]
    }


@app.post("/api/compare")
def compare_baseline(req: SimulationRequest) -> Dict[str, Any]:
    """
    Runs both an unoptimized Baseline configuration and an Improved high-performance configuration
    through the thermal simulation engine for side-by-side comparison.
    """
    climate_info = get_climate_data(req.location_id)
    comparison_results = run_baseline_vs_improved_comparison(req.shelter_inputs, climate_info)
    comparison_results["location"] = {
        "id": climate_info["id"],
        "name": climate_info["name"],
        "region": climate_info["region"]
    }
    return comparison_results


@app.post("/api/optimize")
def optimize_shelter(req: SimulationRequest) -> Dict[str, Any]:
    """
    Runs multi-parameter optimization search over orientation, insulation, WWR, and thermal mass.
    Returns Top 3 candidate designs and trade-off rationale.
    """
    climate_info = get_climate_data(req.location_id)
    optimization_results = run_prototype_optimizer(req.shelter_inputs, climate_info)
    optimization_results["location"] = {
        "id": climate_info["id"],
        "name": climate_info["name"],
        "region": climate_info["region"]
    }
    return optimization_results
