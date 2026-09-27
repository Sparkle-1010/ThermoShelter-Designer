import React from 'react';
import {
  Cpu,
  Award,
  Check,
  Lightbulb,
  Scale,
  IndianRupee,
  Flame,
  Clock,
} from 'lucide-react';

import type { OptimizationResponse, ShelterInputs } from '../types/shelter';

interface OptimizerCardProps {
  data: OptimizationResponse | null;
  onApplyCandidate?: (inputs: ShelterInputs) => void;
}

export const OptimizerCard: React.FC<OptimizerCardProps> = ({
  data,
  onApplyCandidate,
}) => {
  if (!data) return null;

  /*
   * The backend returns:
   *
   * {
   *   recommendation: {...},
   *   top_candidates: [...],
   *   search_space_size: 144,
   *   optimizer_type: "Prototype Grid Search"
   * }
   *
   * The previous frontend expected:
   * recommended_design
   *
   * So we map the backend response here.
   */

  const response = data as any;

  const recommended_design = response.recommendation;
  const top_candidates = response.top_candidates ?? [];

  if (!recommended_design) {
    return (
      <div className="bg-slate-900 border border-red-800 rounded-xl p-5 text-red-300">
        <p className="text-sm font-mono">
          Optimization completed, but no recommendation was returned.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">

      {/* =====================================================
          TITLE BAR
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">

        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-emerald-400" />

          <div>
            <h2 className="text-base font-bold text-white font-mono">
              Prototype Multi-Attribute Optimizer
            </h2>

            <p className="text-xs text-slate-400">
              Grid search balancing thermal comfort, heat loss,
              structural mass, and material cost
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded font-mono">
          {response.optimizer_type ?? 'Prototype Grid Search'}
        </span>
      </div>


      {/* =====================================================
          SEARCH SPACE INFORMATION
      ====================================================== */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

        <div>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Optimization Method
          </span>

          <span className="text-sm text-slate-200 font-mono font-semibold">
            Prototype Grid Search
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Designs Evaluated
          </span>

          <span className="text-sm text-cyan-400 font-mono font-bold">
            {response.search_space_size ?? top_candidates.length}
          </span>
        </div>
      </div>


      {/* =====================================================
          RECOMMENDED DESIGN
      ====================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-xl p-5 shadow-xl relative overflow-hidden">

        {/* Badge */}
        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-lg font-mono flex items-center space-x-1">
          <Award className="w-3.5 h-3.5" />
          <span>Recommended Design</span>
        </div>


        {/* Heading */}
        <div className="mb-4 pr-36">

          <h3 className="text-lg font-bold text-white font-mono flex flex-wrap items-center gap-2">

            <span>
              Optimal Passive Configuration
            </span>

            <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Score: {recommended_design.score}
            </span>

          </h3>

        </div>


        {/* =================================================
            DESIGN SPECIFICATIONS
        ================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">

          {/* Orientation */}
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">

            <span className="text-slate-400 block text-[11px]">
              Orientation
            </span>

            <span className="text-white font-bold font-mono text-sm">
              {recommended_design.inputs.orientation}
            </span>

          </div>


          {/* Insulation */}
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">

            <span className="text-slate-400 block text-[11px]">
              Insulation Thickness
            </span>

            <span className="text-cyan-400 font-bold font-mono text-sm">
              {recommended_design.inputs.insulation_thickness_mm} mm
            </span>

          </div>


          {/* WWR */}
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">

            <span className="text-slate-400 block text-[11px]">
              Window-to-Wall Ratio
            </span>

            <span className="text-amber-400 font-bold font-mono text-sm">
              {recommended_design.inputs.window_wall_ratio_pct}% WWR
            </span>

          </div>


          {/* Thermal Mass */}
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">

            <span className="text-slate-400 block text-[11px]">
              Thermal Mass Level
            </span>

            <span className="text-emerald-400 font-bold font-mono text-sm">
              {recommended_design.inputs.thermal_mass}
            </span>

          </div>

        </div>


        {/* =================================================
            PERFORMANCE METRICS
        ================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4 pt-3 border-t border-slate-800">

          {/* Comfort */}
          <div className="flex items-center space-x-2">

            <Clock className="w-4 h-4 text-cyan-400" />

            <div>

              <span className="text-[11px] text-slate-400 block">
                Comfort
              </span>

              <span className="text-white font-bold font-mono">
                {recommended_design.comfort_percentage}%
              </span>

            </div>

          </div>


          {/* Heat Loss */}
          <div className="flex items-center space-x-2">

            <Flame className="w-4 h-4 text-orange-400" />

            <div>

              <span className="text-[11px] text-slate-400 block">
                Heat Loss
              </span>

              <span className="text-white font-bold font-mono">
                {recommended_design.heat_loss_kwh} kWh
              </span>

            </div>

          </div>


          {/* Weight */}
          <div className="flex items-center space-x-2">

            <Scale className="w-4 h-4 text-slate-400" />

            <div>

              <span className="text-[11px] text-slate-400 block">
                Est. Dry Weight
              </span>

              <span className="text-white font-bold font-mono">
                {Number(recommended_design.weight_kg).toLocaleString()} kg
              </span>

            </div>

          </div>


          {/* Cost */}
          <div className="flex items-center space-x-2">

            <IndianRupee className="w-4 h-4 text-emerald-400" />

            <div>

              <span className="text-[11px] text-slate-400 block">
                Est. Material Cost
              </span>

              <span className="text-white font-bold font-mono">
                ₹{Number(recommended_design.cost_inr).toLocaleString()}
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            ADDITIONAL THERMAL INFORMATION
        ================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

            <span className="text-slate-500 block text-[10px] uppercase">
              Comfort Hours
            </span>

            <span className="text-cyan-300 font-mono font-bold">
              {Math.round((recommended_design.comfort_percentage / 100) * 24)} / 24 h
            </span>

          </div>


          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

            <span className="text-slate-500 block text-[10px] uppercase">
              Min Indoor Temp
            </span>

            <span className="text-white font-mono font-bold">
              {recommended_design.min_temperature} °C
            </span>

          </div>


          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

            <span className="text-slate-500 block text-[10px] uppercase">
              Max Indoor Temp
            </span>

            <span className="text-white font-mono font-bold">
              {recommended_design.max_temperature} °C
            </span>

          </div>


          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

            <span className="text-slate-500 block text-[10px] uppercase">
              Solar Gain
            </span>

            <span className="text-amber-300 font-mono font-bold">
              {recommended_design.solar_gain_kwh} kWh
            </span>

          </div>

        </div>


        {/* =================================================
            ENGINEERING EXPLANATION
        ================================================== */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-start space-x-3">

          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

          <div>

            <span className="text-xs font-bold text-amber-300 block mb-1">
              Engineering Trade-off Explanation & Rationale
            </span>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {recommended_design.explanation ??
                'This configuration was selected as the highest-scoring design in the prototype grid search based on thermal comfort, heat loss, estimated weight, and estimated material cost.'}
            </p>

          </div>

        </div>


        {/* =================================================
            APPLY RECOMMENDED CONFIGURATION
        ================================================== */}
        {onApplyCandidate && (

          <div className="mt-4 flex justify-end">

            <button
              type="button"
              onClick={() =>
                onApplyCandidate(recommended_design.inputs)
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >

              <Check className="w-4 h-4" />

              <span>
                Apply Recommended Parameters to Simulator
              </span>

            </button>

          </div>

        )}

      </div>


      {/* =====================================================
          TOP 3 CANDIDATES
      ====================================================== */}
      <div>

        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Top 3 Evaluated Candidates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {top_candidates.map((cand: any, idx: number) => (

            <div
              key={idx}
              className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between text-xs ${idx === 0
                ? 'border-emerald-500/60 bg-emerald-950/10'
                : 'border-slate-800'
                }`}
            >

              <div>

                {/* Candidate heading */}
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">

                  <span className="font-bold text-white font-mono">
                    Candidate #{idx + 1}
                  </span>

                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                    Score: {cand.score}
                  </span>

                </div>


                {/* Candidate details */}
                <div className="space-y-1.5 font-mono text-[11px] text-slate-300">

                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Orientation:
                    </span>

                    <span className="text-white font-bold">
                      {cand.inputs.orientation}
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Insulation:
                    </span>

                    <span>
                      {cand.inputs.insulation_thickness_mm} mm
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      WWR:
                    </span>

                    <span>
                      {cand.inputs.window_wall_ratio_pct}%
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Thermal Mass:
                    </span>

                    <span>
                      {cand.inputs.thermal_mass}
                    </span>
                  </div>


                  <div className="flex justify-between pt-1.5 border-t border-slate-800 text-emerald-400 font-bold">

                    <span>
                      Comfort %:
                    </span>

                    <span>
                      {cand.comfort_percentage}%
                    </span>

                  </div>


                  <div className="flex justify-between text-orange-300">

                    <span>
                      Heat Loss:
                    </span>

                    <span>
                      {cand.heat_loss_kwh} kWh
                    </span>

                  </div>


                  <div className="flex justify-between text-slate-400">

                    <span>
                      Weight:
                    </span>

                    <span>
                      {Number(cand.weight_kg).toLocaleString()} kg
                    </span>

                  </div>


                  <div className="flex justify-between text-slate-400">

                    <span>
                      Cost:
                    </span>

                    <span>
                      ₹{Number(cand.cost_inr).toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>


              {/* Load candidate */}
              {onApplyCandidate && (

                <button
                  type="button"
                  onClick={() =>
                    onApplyCandidate(cand.inputs)
                  }
                  className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded text-[11px] font-semibold transition"
                >
                  Load Config #{idx + 1}
                </button>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};