export interface ShelterInputs {
  length_m: number;
  width_m: number;
  height_m: number;
  orientation: 'North' | 'South' | 'East' | 'West';
  insulation_thickness_mm: number;
  window_wall_ratio_pct: number;
  material: 'Insulated Sandwich Panel' | 'Concrete' | 'Local Stone';
  thermal_mass: 'Low' | 'Medium' | 'High';
  occupants: number;
}

export interface ClimateLocation {
  id: string;
  name: string;
  region: string;
  altitude_m: number;
  temp_min: number;
  temp_max: number;
  peak_solar_wm2: number;
  data_source_label: string;
}

export interface HourlyResult {
  hour: number;
  hour_label: string;
  outdoor_temp: number;
  indoor_temp: number;
  q_solar: number;
  q_conduction: number;
  q_infiltration: number;
  q_internal: number;
}

export interface SimulationMetrics {
  comfort_hours: number;
  comfort_percentage: number;
  comfort_min_target: number;
  comfort_max_target: number;
  min_indoor_temp: number;
  max_indoor_temp: number;
  total_heat_loss_kwh: number;
  total_solar_gain_kwh: number;
  ua_total_w_k: number;
  thermal_capacity_mj_k: number;
  simulation_type: string;
}

export interface SimulationResponse {
  location: {
    id: string;
    name: string;
    region: string;
    altitude_m: number;
    is_demo_data: boolean;
  };
  inputs: ShelterInputs;
  metrics: SimulationMetrics;
  hourly_results: HourlyResult[];
}

export interface ComparisonConfig {
  inputs: ShelterInputs;
  metrics: SimulationMetrics;
  hourly_results: HourlyResult[];
}

export interface BaselineComparisonResponse {
  baseline: ComparisonConfig;
  improved: ComparisonConfig;
  label: string;
  location: {
    id: string;
    name: string;
    region: string;
  };
}

export interface OptimizationCandidate {
  inputs: ShelterInputs;
  metrics: SimulationMetrics;
  weight_kg: number;
  cost_inr: number;
  composite_score: number;
}

export interface OptimizationResponse {
  label: string;
  top_candidates: OptimizationCandidate[];
  recommended_design: OptimizationCandidate;
  explanation: string;
  location: {
    id: string;
    name: string;
    region: string;
  };
}
