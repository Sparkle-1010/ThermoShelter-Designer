"""
Thermal Physics Engine for ThermoShelter Designer.
Implements a 24-hour lumped-capacitance ODE numerical simulation:
  C_in * dT_in/dt = Q_solar + Q_internal - Q_conduction - Q_infiltration + Q_vent

Units:
  C_in: Thermal capacitance (J/K)
  T_in, T_out: Temperature (°C)
  Q: Heat flow rates (Watts)
"""

import math
from typing import Dict, Any, List
from pydantic import BaseModel, Field


class ShelterInputs(BaseModel):
    length_m: float = Field(default=6.0, ge=2.0, le=30.0, description="Shelter length in meters")
    width_m: float = Field(default=4.0, ge=2.0, le=20.0, description="Shelter width in meters")
    height_m: float = Field(default=2.8, ge=2.0, le=6.0, description="Shelter height in meters")
    orientation: str = Field(default="South", description="Primary orientation: North, South, East, West")
    insulation_thickness_mm: float = Field(default=100.0, ge=10.0, le=300.0, description="Insulation thickness in mm")
    window_wall_ratio_pct: float = Field(default=15.0, ge=5.0, le=60.0, description="Window-to-wall ratio percentage")
    material: str = Field(default="Insulated Sandwich Panel", description="Material: Insulated Sandwich Panel, Concrete, Local Stone")
    thermal_mass: str = Field(default="High", description="Thermal mass level: Low, Medium, High")
    occupants: int = Field(default=4, ge=0, le=50, description="Number of occupants")


# Material Thermal Properties
MATERIAL_PROPERTIES = {
    "Insulated Sandwich Panel": {"k_val": 0.025, "density": 40.0, "cost_per_m2": 1800.0},
    "Concrete": {"k_val": 1.3, "density": 2300.0, "cost_per_m2": 2500.0},
    "Local Stone": {"k_val": 1.8, "density": 2500.0, "cost_per_m2": 2100.0}
}

# Thermal Mass Addition (J/K per m2 of floor area)
THERMAL_MASS_LEVELS = {
    "Low": 50000.0,     # Light timber/steel frame
    "Medium": 250000.0,  # Medium mass interior partition & slab
    "High": 650000.0     # Heavy insulated stone/masonry mass envelope
}

# Orientation solar exposure multiplier
ORIENTATION_SOLAR_FACTORS = {
    "South": 0.85,  # High winter solar gain
    "East": 0.55,   # Morning sun
    "West": 0.55,   # Afternoon sun
    "North": 0.25   # Diffuse sun only
}


def run_thermal_simulation(inputs: ShelterInputs, climate_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates hourly indoor temperature and heat balance over 24 hours using lumped-capacitance integration.
    Uses a 24-hour warm-up cycle to achieve periodic steady state.
    """
    hourly_tout = climate_data["hourly_temp"]
    hourly_solar = climate_data["hourly_solar"]
    
    # 1. Geometry Calculations
    length = inputs.length_m
    width = inputs.width_m
    height = inputs.height_m
    volume = length * width * height
    floor_area = length * width
    roof_area = floor_area
    gross_wall_area = 2 * (length + width) * height
    
    wwr = max(5.0, min(60.0, inputs.window_wall_ratio_pct)) / 100.0
    window_area = gross_wall_area * wwr
    opaque_wall_area = gross_wall_area - window_area
    
    # 2. Envelope Thermal Resistance (U-values in W/m²K)
    mat_info = MATERIAL_PROPERTIES.get(inputs.material, MATERIAL_PROPERTIES["Insulated Sandwich Panel"])
    d_ins_m = inputs.insulation_thickness_mm / 1000.0
    k_ins = 0.035  # EPS/PUF insulation conductivity (W/mK)
    
    # Wall thermal resistance R = R_surface + d_ins/k_ins + d_mat/k_mat
    r_wall = 0.17 + (d_ins_m / k_ins) + (0.15 / mat_info["k_val"])
    u_wall = 1.0 / max(0.1, r_wall)
    
    # Window U-value (Double Glazing with Low-E coating assumption)
    u_window = 2.4
    shgc = 0.60
    
    # Roof U-value
    r_roof = 0.17 + (d_ins_m / k_ins) + 0.05
    u_roof = 1.0 / max(0.1, r_roof)
    
    # Total Conductance UA (W/K)
    ua_total = (opaque_wall_area * u_wall) + (window_area * u_window) + (roof_area * u_roof)
    
    # 3. Thermal Mass & Capacitance C_in (J/K)
    # Air capacitance = rho * cp * V (rho ~ 1.2 kg/m3, cp ~ 1005 J/kgK)
    c_air = 1.2 * 1005.0 * volume
    c_mass_factor = THERMAL_MASS_LEVELS.get(inputs.thermal_mass, THERMAL_MASS_LEVELS["Medium"])
    c_total = c_air + (c_mass_factor * floor_area)
    
    # 4. Infiltration / Ventilation
    ach = 0.6  # air changes per hour
    v_dot = (ach * volume) / 3600.0  # m3/s
    h_infil = 1.2 * 1005.0 * v_dot  # Infiltration loss coefficient (W/K)
    
    # 5. Occupant Internal Heat Gain (W)
    q_internal = inputs.occupants * 100.0
    
    # Solar orientation factor
    ori_factor = ORIENTATION_SOLAR_FACTORS.get(inputs.orientation, 0.55)
    
    # 6. Numerical Integration over 24h (2 passes to settle initial condition)
    t_in = hourly_tout[0] + 8.0  # initial estimate
    
    substeps_per_hour = 60
    dt_sec = 3600.0 / substeps_per_hour
    
    # Warm-up pass
    for hour in range(24):
        t_out = hourly_tout[hour]
        i_solar = hourly_solar[hour]
        q_solar = (i_solar * window_area * shgc * ori_factor) + (i_solar * roof_area * 0.04)
        
        for _ in range(substeps_per_hour):
            q_cond = ua_total * (t_out - t_in)
            q_infil = h_infil * (t_out - t_in)
            dq_dt = q_solar + q_internal + q_cond + q_infil
            t_in += (dq_dt / c_total) * dt_sec

    # Actual recorded 24-hour pass
    recorded_tin: List[float] = []
    recorded_q_solar: List[float] = []
    recorded_q_cond: List[float] = []
    recorded_q_infil: List[float] = []
    recorded_q_internal: List[float] = []
    
    for hour in range(24):
        t_out = hourly_tout[hour]
        i_solar = hourly_solar[hour]
        
        # Calculate solar heat gain
        q_solar_h = (i_solar * window_area * shgc * ori_factor) + (i_solar * roof_area * 0.04)
        
        hour_tin_sum = 0.0
        hour_qcond_sum = 0.0
        hour_qinfil_sum = 0.0
        
        for _ in range(substeps_per_hour):
            q_cond = ua_total * (t_out - t_in)
            q_infil = h_infil * (t_out - t_in)
            dq_dt = q_solar_h + q_internal + q_cond + q_infil
            t_in += (dq_dt / c_total) * dt_sec
            
            hour_tin_sum += t_in
            hour_qcond_sum += q_cond
            hour_qinfil_sum += q_infil
            
        recorded_tin.append(round(hour_tin_sum / substeps_per_hour, 2))
        recorded_q_solar.append(round(q_solar_h, 1))
        # Note: standard convention -> Positive = Heat Gain into space, Negative = Heat Loss from space
        recorded_q_cond.append(round(hour_qcond_sum / substeps_per_hour, 1))
        recorded_q_infil.append(round(hour_qinfil_sum / substeps_per_hour, 1))
        recorded_q_internal.append(round(q_internal, 1))
        
    # 7. Aggregate Performance & Comfort Metrics (Target Comfort Range: 18°C to 26°C)
    COMFORT_MIN = 18.0
    COMFORT_MAX = 26.0
    
    comfort_hours = sum(1 for temp in recorded_tin if COMFORT_MIN <= temp <= COMFORT_MAX)
    comfort_pct = round((comfort_hours / 24.0) * 100.0, 1)
    
    temp_min = round(min(recorded_tin), 1)
    temp_max = round(max(recorded_tin), 1)
    
    # Calculate energy sums in kWh
    # Conduction & infiltration heat loss (when Q < 0)
    total_loss_w = sum(
        max(0.0, -(qc + qi))
        for qc, qi in zip(recorded_q_cond, recorded_q_infil)
    )
    total_heat_loss_kwh = round(total_loss_w / 1000.0, 2)
    total_solar_gain_kwh = round(sum(recorded_q_solar) / 1000.0, 2)
    
    return {
        "hourly_results": [
            {
                "hour": hour,
                "hour_label": f"{hour:02d}:00",
                "outdoor_temp": hourly_tout[hour],
                "indoor_temp": recorded_tin[hour],
                "q_solar": recorded_q_solar[hour],
                "q_conduction": recorded_q_cond[hour],
                "q_infiltration": recorded_q_infil[hour],
                "q_internal": recorded_q_internal[hour]
            }
            for hour in range(24)
        ],
        "metrics": {
            "comfort_hours": comfort_hours,
            "comfort_percentage": comfort_pct,
            "comfort_min_target": COMFORT_MIN,
            "comfort_max_target": COMFORT_MAX,
            "min_indoor_temp": temp_min,
            "max_indoor_temp": temp_max,
            "total_heat_loss_kwh": total_heat_loss_kwh,
            "total_solar_gain_kwh": total_solar_gain_kwh,
            "ua_total_w_k": round(ua_total, 2),
            "thermal_capacity_mj_k": round(c_total / 1e6, 3),
            "simulation_type": "Prototype Lumped-Capacitance Simulation"
        }
    }
