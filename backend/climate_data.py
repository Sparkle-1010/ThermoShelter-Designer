"""
Climate Data Module for ThermoShelter Designer.
Provides realistic 24-hour demo climate data for extreme Indian climates:
1. Leh, Ladakh (Cold High-Altitude Desert)
2. Thar Desert, Rajasthan (Hot Arid Desert)
3. Delhi (Warm Composite / Subtropical)

Structured cleanly so real NASA POWER or Open-Meteo API integrations can replace/augment
these functions seamlessly in production.
"""

from typing import Dict, Any, List

CLIMATE_DATABASE: Dict[str, Dict[str, Any]] = {
    "leh": {
        "id": "leh",
        "name": "Leh, Ladakh",
        "region": "Trans-Himalayas (Extreme Cold High-Altitude)",
        "altitude_m": 3500,
        "avg_wind_speed_ms": 4.5,
        "temp_min": -15.0,
        "temp_max": 2.0,
        "peak_solar_wm2": 950.0,
        "is_demo_data": True,
        "data_source_label": "Demo Climate Data (Representative Design Day)",
        # 24-hour hourly ambient outdoor temperature (°C), index 0 = 00:00 midnight
        "hourly_temp": [
            -14.0, -14.8, -15.0, -14.5, -13.8, -12.5,
            -10.0, -6.5, -2.0, 0.5, 1.8, 2.0,
            1.5, 0.8, -0.5, -2.0, -4.5, -7.0,
            -9.2, -11.0, -12.2, -13.0, -13.5, -13.8
        ],
        # 24-hour solar irradiance on horizontal surface (W/m²)
        "hourly_solar": [
            0.0, 0.0, 0.0, 0.0, 0.0, 30.0,
            210.0, 480.0, 720.0, 880.0, 950.0, 930.0,
            840.0, 680.0, 450.0, 190.0, 20.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        ]
    },
    "thar": {
        "id": "thar",
        "name": "Thar Desert, Rajasthan",
        "region": "Western Arid Zone (Extreme Hot Dry)",
        "altitude_m": 220,
        "avg_wind_speed_ms": 3.2,
        "temp_min": 27.5,
        "temp_max": 44.5,
        "peak_solar_wm2": 910.0,
        "is_demo_data": True,
        "data_source_label": "Demo Climate Data (Representative Summer Day)",
        "hourly_temp": [
            29.5, 28.5, 27.8, 27.5, 28.0, 30.0,
            33.0, 36.5, 39.5, 42.0, 43.8, 44.5,
            44.2, 43.5, 42.0, 40.0, 37.5, 35.0,
            33.0, 31.8, 31.0, 30.5, 30.0, 29.8
        ],
        "hourly_solar": [
            0.0, 0.0, 0.0, 0.0, 0.0, 40.0,
            240.0, 510.0, 740.0, 870.0, 910.0, 890.0,
            800.0, 640.0, 420.0, 170.0, 15.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        ]
    },
    "delhi": {
        "id": "delhi",
        "name": "Delhi (NCR)",
        "region": "Northern Plains (Composite / Subtropical)",
        "altitude_m": 216,
        "avg_wind_speed_ms": 2.5,
        "temp_min": 22.0,
        "temp_max": 38.0,
        "peak_solar_wm2": 820.0,
        "is_demo_data": True,
        "data_source_label": "Demo Climate Data (Representative Design Day)",
        "hourly_temp": [
            24.5, 23.5, 22.8, 22.0, 22.5, 24.5,
            27.0, 30.0, 33.0, 35.5, 37.2, 38.0,
            37.8, 37.0, 35.5, 33.5, 31.5, 29.5,
            28.0, 27.0, 26.2, 25.5, 25.0, 24.8
        ],
        "hourly_solar": [
            0.0, 0.0, 0.0, 0.0, 0.0, 25.0,
            180.0, 410.0, 620.0, 760.0, 820.0, 800.0,
            710.0, 560.0, 360.0, 140.0, 10.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        ]
    }
}


def get_all_locations() -> List[Dict[str, Any]]:
    """Return summary metadata of all available locations."""
    return [
        {
            "id": data["id"],
            "name": data["name"],
            "region": data["region"],
            "altitude_m": data["altitude_m"],
            "temp_min": data["temp_min"],
            "temp_max": data["temp_max"],
            "peak_solar_wm2": data["peak_solar_wm2"],
            "data_source_label": data["data_source_label"]
        }
        for data in CLIMATE_DATABASE.values()
    ]


def get_climate_data(location_id: str) -> Dict[str, Any]:
    """
    Fetch 24-hour climate profile for a given location ID.
    Defaults to Leh if location_id is invalid.
    """
    location_key = location_id.lower() if location_id else "leh"
    if location_key not in CLIMATE_DATABASE:
        location_key = "leh"
    return CLIMATE_DATABASE[location_key]
