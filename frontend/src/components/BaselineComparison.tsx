import React from 'react';
import { GitCompare, CheckCircle2, ArrowRight } from 'lucide-react';
import type { BaselineComparisonResponse } from '../types/shelter';

interface BaselineComparisonProps {
  data: BaselineComparisonResponse | null;
}

export const BaselineComparison: React.FC<BaselineComparisonProps> = ({
  data,
}) => {
  if (!data) return null;

  /*
   * Backend structure:
   *
   * baseline:
   *   inputs
   *   result.metrics
   *   weight_kg
   *   cost_inr
   *
   * improved:
   *   inputs
   *   result.metrics
   *   weight_kg
   *   cost_inr
   */

  const { baseline, improved } = data;

  const baselineMetrics = baseline.result.metrics;
  const improvedMetrics = improved.result.metrics;

  // ---------------------------------------------------------
  // Compare performance
  // ---------------------------------------------------------

  const comfortImproved =
    improvedMetrics.comfort_hours >=
    baselineMetrics.comfort_hours;

  const comfortPercentageImproved =
    improvedMetrics.comfort_percentage >=
    baselineMetrics.comfort_percentage;

  const minTemperatureImproved =
    improvedMetrics.min_indoor_temp >
    baselineMetrics.min_indoor_temp;

  const maxTemperatureImproved =
    improvedMetrics.max_indoor_temp >=
    baselineMetrics.max_indoor_temp;

  const heatLossImproved =
    improvedMetrics.total_heat_loss_kwh <
    baselineMetrics.total_heat_loss_kwh;

  const solarGainImproved =
    improvedMetrics.total_solar_gain_kwh >
    baselineMetrics.total_solar_gain_kwh;

  // ---------------------------------------------------------
  // Comparison rows
  // ---------------------------------------------------------

  const rows = [
    {
      label: 'Insulation Thickness',
      baseVal: `${baseline.inputs.insulation_thickness_mm} mm`,
      impVal: `${improved.inputs.insulation_thickness_mm} mm`,
      isBetter:
        improved.inputs.insulation_thickness_mm >=
        baseline.inputs.insulation_thickness_mm,
    },

    {
      label: 'Window-to-Wall Ratio (WWR)',
      baseVal: `${baseline.inputs.window_wall_ratio_pct}%`,
      impVal: `${improved.inputs.window_wall_ratio_pct}%`,
      isBetter:
        improved.inputs.window_wall_ratio_pct <=
        baseline.inputs.window_wall_ratio_pct,
    },

    {
      label: 'Solar Orientation',
      baseVal: baseline.inputs.orientation,
      impVal: improved.inputs.orientation,
      isBetter: improved.inputs.orientation === 'South',
    },

    {
      label: 'Primary Envelope Material',
      baseVal: baseline.inputs.material,
      impVal: improved.inputs.material,
      isBetter:
        improved.inputs.material !== baseline.inputs.material,
    },

    {
      label: 'Thermal Mass Level',
      baseVal: baseline.inputs.thermal_mass,
      impVal: improved.inputs.thermal_mass,
      isBetter: true,
    },

    {
      label: 'Comfort Hours (18°C - 26°C)',
      baseVal: `${baselineMetrics.comfort_hours} / 24 h`,
      impVal: `${improvedMetrics.comfort_hours} / 24 h`,
      isBetter: comfortImproved,
      highlight: true,
    },

    {
      label: 'Comfort Percentage',
      baseVal: `${baselineMetrics.comfort_percentage}%`,
      impVal: `${improvedMetrics.comfort_percentage}%`,
      isBetter: comfortPercentageImproved,
      highlight: true,
    },

    {
      label: 'Min Indoor Temperature',
      baseVal: `${baselineMetrics.min_indoor_temp} °C`,
      impVal: `${improvedMetrics.min_indoor_temp} °C`,
      isBetter: minTemperatureImproved,
    },

    {
      label: 'Max Indoor Temperature',
      baseVal: `${baselineMetrics.max_indoor_temp} °C`,
      impVal: `${improvedMetrics.max_indoor_temp} °C`,
      isBetter: maxTemperatureImproved,
    },

    {
      label: 'Total Heat Loss (Conduction + Infil)',
      baseVal: `${baselineMetrics.total_heat_loss_kwh} kWh`,
      impVal: `${improvedMetrics.total_heat_loss_kwh} kWh`,
      isBetter: heatLossImproved,
      highlight: true,
    },

    {
      label: 'Total Solar Heat Gain',
      baseVal: `${baselineMetrics.total_solar_gain_kwh} kWh`,
      impVal: `${improvedMetrics.total_solar_gain_kwh} kWh`,
      isBetter: solarGainImproved,
    },

    {
      label: 'Estimated Dry Weight',
      baseVal: `${Number(baseline.weight_kg).toLocaleString()} kg`,
      impVal: `${Number(improved.weight_kg).toLocaleString()} kg`,
      isBetter: improved.weight_kg <= baseline.weight_kg,
    },

    {
      label: 'Estimated Material Cost',
      baseVal: `₹${Number(baseline.cost_inr).toLocaleString()}`,
      impVal: `₹${Number(improved.cost_inr).toLocaleString()}`,
      isBetter: improved.cost_inr <= baseline.cost_inr,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">

        <div className="flex items-center space-x-2.5">

          <GitCompare className="w-5 h-5 text-amber-400" />

          <h2 className="text-base font-bold text-white font-mono">
            Baseline vs. Passive Improved Comparison
          </h2>

        </div>

        <span className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded font-mono">
          Prototype Simulation Engine
        </span>

      </div>


      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      <p className="text-xs text-slate-400">
        Comparison of a conventional baseline shelter against the
        currently selected passive shelter configuration using the
        same numerical lumped-capacitance thermal model.
      </p>


      {/* =====================================================
          CONFIGURATION SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Baseline */}
        <div className="bg-amber-950/10 border border-amber-900/50 rounded-lg p-4">

          <span className="text-[11px] text-amber-400 uppercase tracking-wider font-bold">
            Standard Baseline
          </span>

          <div className="mt-2 text-xs text-slate-300 space-y-1 font-mono">

            <div>
              Orientation:
              <span className="text-white ml-2">
                {baseline.inputs.orientation}
              </span>
            </div>

            <div>
              Insulation:
              <span className="text-white ml-2">
                {baseline.inputs.insulation_thickness_mm} mm
              </span>
            </div>

            <div>
              WWR:
              <span className="text-white ml-2">
                {baseline.inputs.window_wall_ratio_pct}%
              </span>
            </div>

            <div>
              Material:
              <span className="text-white ml-2">
                {baseline.inputs.material}
              </span>
            </div>

            <div>
              Thermal Mass:
              <span className="text-white ml-2">
                {baseline.inputs.thermal_mass}
              </span>
            </div>

          </div>

        </div>


        {/* Improved */}
        <div className="bg-emerald-950/10 border border-emerald-900/50 rounded-lg p-4">

          <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-bold">
            Passive Improved
          </span>

          <div className="mt-2 text-xs text-slate-300 space-y-1 font-mono">

            <div>
              Orientation:
              <span className="text-white ml-2">
                {improved.inputs.orientation}
              </span>
            </div>

            <div>
              Insulation:
              <span className="text-white ml-2">
                {improved.inputs.insulation_thickness_mm} mm
              </span>
            </div>

            <div>
              WWR:
              <span className="text-white ml-2">
                {improved.inputs.window_wall_ratio_pct}%
              </span>
            </div>

            <div>
              Material:
              <span className="text-white ml-2">
                {improved.inputs.material}
              </span>
            </div>

            <div>
              Thermal Mass:
              <span className="text-white ml-2">
                {improved.inputs.thermal_mass}
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          COMPARISON TABLE
      ====================================================== */}

      <div className="overflow-x-auto rounded-lg border border-slate-800">

        <table className="w-full text-left text-xs font-mono">

          <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">

            <tr>

              <th className="py-3 px-4">
                Design Parameter / Metric
              </th>

              <th className="py-3 px-4 text-amber-400 bg-amber-950/20">
                Standard Baseline
              </th>

              <th className="py-3 px-4 text-emerald-400 bg-emerald-950/20">
                Passive Improved
              </th>

              <th className="py-3 px-4 text-center">
                Net Impact
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-800 text-slate-200">

            {rows.map((row, index) => (

              <tr
                key={index}
                className={
                  row.highlight
                    ? 'bg-slate-800/40 font-semibold'
                    : 'hover:bg-slate-800/20'
                }
              >

                {/* Parameter */}

                <td className="py-2.5 px-4 font-sans font-medium text-slate-300">
                  {row.label}
                </td>


                {/* Baseline */}

                <td className="py-2.5 px-4 text-slate-400 bg-slate-950/40">
                  {row.baseVal}
                </td>


                {/* Improved */}

                <td className="py-2.5 px-4 text-emerald-300 font-bold bg-emerald-950/10">
                  {row.impVal}
                </td>


                {/* Impact */}

                <td className="py-2.5 px-4 text-center">

                  {row.isBetter ? (

                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      <span>
                        Optimized
                      </span>

                    </span>

                  ) : (

                    <span className="inline-flex items-center space-x-1 text-slate-400 text-[11px]">

                      <ArrowRight className="w-3.5 h-3.5" />

                      <span>
                        Trade-off
                      </span>

                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          PROTOTYPE NOTE
      ====================================================== */}

      <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">

        Note: Results are from the prototype lumped-capacitance
        model and should be treated as design-space exploration
        outputs, not engineering-certified predictions.

      </div>

    </div>
  );
};