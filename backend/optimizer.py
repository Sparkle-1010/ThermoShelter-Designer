from typing import Dict, Any, List, Tuple

from thermal_engine import ShelterInputs, run_thermal_simulation


def estimate_weight_and_cost(
    inputs: ShelterInputs,
) -> Tuple[float, float]:
    """
    Prototype engineering estimate.

    Returns:
        weight_kg, cost_inr
    """

    floor_area = inputs.length_m * inputs.width_m
    wall_area = 2 * (inputs.length_m + inputs.width_m) * inputs.height_m
    roof_area = floor_area

    # Approximate material density and cost assumptions
    material_data = {
        "Insulated Sandwich Panel": {
            "density": 40.0,
            "cost_per_m2": 1800.0,
        },
        "Concrete": {
            "density": 2300.0,
            "cost_per_m2": 2500.0,
        },
        "Local Stone": {
            "density": 2500.0,
            "cost_per_m2": 2100.0,
        },
    }

    material = material_data.get(
        inputs.material,
        material_data["Insulated Sandwich Panel"],
    )

    # Approximate structural material thickness
    material_thickness_m = 0.10

    opaque_area = wall_area * (
        1 - inputs.window_wall_ratio_pct / 100.0
    )

    wall_volume = opaque_area * material_thickness_m
    roof_volume = roof_area * material_thickness_m

    material_weight_kg = (
        wall_volume + roof_volume
    ) * material["density"]

    # Approximate auxiliary weight for framing/floor/services
    auxiliary_weight_kg = floor_area * 15.0

    total_weight_kg = (
        material_weight_kg + auxiliary_weight_kg
    )

    # Approximate construction/material cost
    total_cost_inr = (
        (opaque_area + roof_area)
        * material["cost_per_m2"]
    )

    # Basic floor/structure/windows allowance
    total_cost_inr += floor_area * 2500.0

    return (
        round(total_weight_kg, 1),
        round(total_cost_inr, 0),
    )


def run_baseline_vs_improved_comparison(
    current_inputs: ShelterInputs,
    climate_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compare a conventional baseline shelter against
    the currently selected passive shelter configuration.
    """

    # ---------------------------------------------------------
    # BASELINE CONFIGURATION
    # ---------------------------------------------------------
    baseline_inputs = ShelterInputs(
        length_m=current_inputs.length_m,
        width_m=current_inputs.width_m,
        height_m=current_inputs.height_m,
        orientation="North",
        insulation_thickness_mm=30.0,
        window_wall_ratio_pct=35.0,
        material="Concrete",
        thermal_mass="Low",
        occupants=current_inputs.occupants,
    )

    # ---------------------------------------------------------
    # IMPROVED CONFIGURATION
    #
    # Uses the CURRENTLY SELECTED shelter parameters.
    # Nothing is hard-coded here such as 180 mm or High mass.
    # ---------------------------------------------------------
    improved_inputs = ShelterInputs(
        length_m=current_inputs.length_m,
        width_m=current_inputs.width_m,
        height_m=current_inputs.height_m,
        orientation=current_inputs.orientation,
        insulation_thickness_mm=current_inputs.insulation_thickness_mm,
        window_wall_ratio_pct=current_inputs.window_wall_ratio_pct,
        material=current_inputs.material,
        thermal_mass=current_inputs.thermal_mass,
        occupants=current_inputs.occupants,
    )

    # ---------------------------------------------------------
    # RUN THERMAL SIMULATIONS
    # ---------------------------------------------------------
    baseline_result = run_thermal_simulation(
        baseline_inputs,
        climate_data,
    )

    improved_result = run_thermal_simulation(
        improved_inputs,
        climate_data,
    )

    # ---------------------------------------------------------
    # ENGINEERING ESTIMATES
    # ---------------------------------------------------------
    baseline_weight, baseline_cost = estimate_weight_and_cost(
        baseline_inputs
    )

    improved_weight, improved_cost = estimate_weight_and_cost(
        improved_inputs
    )

    # ---------------------------------------------------------
    # RETURN COMPARISON
    # ---------------------------------------------------------
    return {
        "baseline": {
            "inputs": {
                "length_m": baseline_inputs.length_m,
                "width_m": baseline_inputs.width_m,
                "height_m": baseline_inputs.height_m,
                "orientation": baseline_inputs.orientation,
                "insulation_thickness_mm": (
                    baseline_inputs.insulation_thickness_mm
                ),
                "window_wall_ratio_pct": (
                    baseline_inputs.window_wall_ratio_pct
                ),
                "material": baseline_inputs.material,
                "thermal_mass": baseline_inputs.thermal_mass,
                "occupants": baseline_inputs.occupants,
            },
            "result": baseline_result,
            "weight_kg": baseline_weight,
            "cost_inr": baseline_cost,
        },

        "improved": {
            "inputs": {
                "length_m": improved_inputs.length_m,
                "width_m": improved_inputs.width_m,
                "height_m": improved_inputs.height_m,
                "orientation": improved_inputs.orientation,
                "insulation_thickness_mm": (
                    improved_inputs.insulation_thickness_mm
                ),
                "window_wall_ratio_pct": (
                    improved_inputs.window_wall_ratio_pct
                ),
                "material": improved_inputs.material,
                "thermal_mass": improved_inputs.thermal_mass,
                "occupants": improved_inputs.occupants,
            },
            "result": improved_result,
            "weight_kg": improved_weight,
            "cost_inr": improved_cost,
        },
    }


def run_prototype_optimizer(
    current_inputs: ShelterInputs,
    climate_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Prototype grid-search optimizer.

    Searches:
        - Orientation
        - Insulation thickness
        - Window-to-wall ratio
        - Thermal mass

    This is intentionally a fast MVP optimizer.
    """

    # ---------------------------------------------------------
    # DESIGN SEARCH SPACE
    # ---------------------------------------------------------

    orientations = [
        "North",
        "South",
        "East",
        "West",
    ]

    insulation_values = [
        50.0,
        100.0,
        150.0,
        200.0,
    ]

    wwr_values = [
        10.0,
        15.0,
        25.0,
    ]

    thermal_mass_values = [
        "Low",
        "Medium",
        "High",
    ]

    candidates: List[Dict[str, Any]] = []

    # ---------------------------------------------------------
    # GRID SEARCH
    # ---------------------------------------------------------

    for orientation in orientations:

        for insulation in insulation_values:

            for wwr in wwr_values:

                for thermal_mass in thermal_mass_values:

                    candidate_inputs = ShelterInputs(
                        length_m=current_inputs.length_m,
                        width_m=current_inputs.width_m,
                        height_m=current_inputs.height_m,
                        orientation=orientation,
                        insulation_thickness_mm=insulation,
                        window_wall_ratio_pct=wwr,
                        material=current_inputs.material,
                        thermal_mass=thermal_mass,
                        occupants=current_inputs.occupants,
                    )

                    # -------------------------------------------------
                    # RUN THERMAL SIMULATION
                    # -------------------------------------------------

                    result = run_thermal_simulation(
                        candidate_inputs,
                        climate_data,
                    )

                    metrics = result["metrics"]

                    # -------------------------------------------------
                    # IMPORTANT:
                    # These names match the actual thermal_engine.py
                    # -------------------------------------------------

                    comfort_percentage = metrics[
                        "comfort_percentage"
                    ]

                    min_temperature = metrics[
                        "min_indoor_temp"
                    ]

                    max_temperature = metrics[
                        "max_indoor_temp"
                    ]

                    total_heat_loss = metrics[
                        "total_heat_loss_kwh"
                    ]

                    total_solar_gain = metrics[
                        "total_solar_gain_kwh"
                    ]

                    # -------------------------------------------------
                    # AVERAGE TEMPERATURE
                    # -------------------------------------------------

                    average_temperature = (
                        min_temperature + max_temperature
                    ) / 2.0

                    # -------------------------------------------------
                    # PROTOTYPE SCORING
                    # -------------------------------------------------

                    ideal_temperature = 20.0

                    temperature_penalty = (
                        abs(
                            average_temperature
                            - ideal_temperature
                        )
                        * 3.0
                    )

                    comfort_score = (
                        comfort_percentage
                        - temperature_penalty
                    )

                    # Penalize high heat loss
                    heat_loss_penalty = (
                        total_heat_loss * 1.5
                    )

                    # Weight and cost estimates
                    weight_kg, cost_inr = (
                        estimate_weight_and_cost(
                            candidate_inputs
                        )
                    )

                    # Cost penalty
                    cost_penalty = (
                        cost_inr / 500000.0
                    ) * 10.0

                    # Weight penalty
                    weight_penalty = (
                        weight_kg / 10000.0
                    ) * 5.0

                    # -------------------------------------------------
                    # FINAL PROTOTYPE SCORE
                    # -------------------------------------------------

                    total_score = (
                        comfort_score
                        - heat_loss_penalty
                        - cost_penalty
                        - weight_penalty
                    )

                    # -------------------------------------------------
                    # STORE CANDIDATE
                    # -------------------------------------------------

                    candidates.append(
                        {
                            "score": round(
                                total_score,
                                2,
                            ),

                            "inputs": {
                                "length_m": (
                                    candidate_inputs.length_m
                                ),
                                "width_m": (
                                    candidate_inputs.width_m
                                ),
                                "height_m": (
                                    candidate_inputs.height_m
                                ),
                                "orientation": (
                                    candidate_inputs.orientation
                                ),
                                "insulation_thickness_mm": (
                                    candidate_inputs.insulation_thickness_mm
                                ),
                                "window_wall_ratio_pct": (
                                    candidate_inputs.window_wall_ratio_pct
                                ),
                                "material": (
                                    candidate_inputs.material
                                ),
                                "thermal_mass": (
                                    candidate_inputs.thermal_mass
                                ),
                                "occupants": (
                                    candidate_inputs.occupants
                                ),
                            },

                            "comfort_percentage": round(
                                comfort_percentage,
                                1,
                            ),

                            "min_temperature": round(
                                min_temperature,
                                1,
                            ),

                            "max_temperature": round(
                                max_temperature,
                                1,
                            ),

                            "heat_loss_kwh": round(
                                total_heat_loss,
                                2,
                            ),

                            "solar_gain_kwh": round(
                                total_solar_gain,
                                2,
                            ),

                            "weight_kg": weight_kg,

                            "cost_inr": cost_inr,

                            "explanation": (
                                f"{orientation} orientation "
                                f"with {insulation:.0f} mm "
                                f"insulation, "
                                f"{wwr:.0f}% window-wall ratio, "
                                f"and "
                                f"{thermal_mass.lower()} "
                                f"thermal mass."
                            ),
                        }
                    )

    # ---------------------------------------------------------
    # SORT BY BEST SCORE
    # ---------------------------------------------------------

    candidates.sort(
        key=lambda x: x["score"],
        reverse=True,
    )

    # Best candidate
    best = candidates[0]

    # ---------------------------------------------------------
    # RETURN OPTIMIZATION RESULTS
    # ---------------------------------------------------------

    return {
        "recommendation": best,

        "top_candidates": candidates[:3],

        "search_space_size": len(candidates),

        "optimizer_type": "Prototype Grid Search",
    }