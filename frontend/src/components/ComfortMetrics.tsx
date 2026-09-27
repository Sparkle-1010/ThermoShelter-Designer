import React from 'react';
import { Clock, ShieldCheck, ThermometerSnowflake, ThermometerSun, Flame, Sun } from 'lucide-react';
import type { SimulationMetrics } from '../types/shelter';

interface ComfortMetricsProps {
  metrics: SimulationMetrics | null;
}

export const ComfortMetrics: React.FC<ComfortMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;

  const isComfortGood = metrics.comfort_percentage >= 50;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* 1. Comfort Hours */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Comfort Hours</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.comfort_hours} <span className="text-xs text-slate-400 font-normal">/ 24 h</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target: 18°C – 26°C</p>
        </div>
      </div>

      {/* 2. Comfort Percentage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Comfort %</span>
          <ShieldCheck className={`w-4 h-4 ${isComfortGood ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold font-mono ${isComfortGood ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.comfort_percentage}%
          </div>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isComfortGood ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {isComfortGood ? 'PASSIVE SUFFICIENT' : 'AUX HEATING REQ'}
          </span>
        </div>
      </div>

      {/* 3. Min Indoor Temp */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Min Indoor T</span>
          <ThermometerSnowflake className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-blue-300 font-mono">
            {metrics.min_indoor_temp}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Night Minimum</p>
        </div>
      </div>

      {/* 4. Max Indoor Temp */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Max Indoor T</span>
          <ThermometerSun className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-rose-300 font-mono">
            {metrics.max_indoor_temp}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Day Peak</p>
        </div>
      </div>

      {/* 5. Total Heat Loss */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Total Heat Loss</span>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-orange-300 font-mono">
            {metrics.total_heat_loss_kwh} <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">UA = {metrics.ua_total_w_k} W/K</p>
        </div>
      </div>

      {/* 6. Total Solar Gain */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start text-slate-400 text-xs font-semibold">
          <span>Total Solar Gain</span>
          <Sun className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {metrics.total_solar_gain_kwh} <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">C_in = {metrics.thermal_capacity_mj_k} MJ/K</p>
        </div>
      </div>

    </div>
  );
};
