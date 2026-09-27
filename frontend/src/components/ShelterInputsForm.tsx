import React from 'react';
import { Sliders, RotateCcw, Compass, Box, Flame, Users, ShieldAlert } from 'lucide-react';
import type { ShelterInputs } from '../types/shelter';

interface ShelterInputsFormProps {
  inputs: ShelterInputs;
  onChange: (inputs: ShelterInputs) => void;
  onResetLehDefaults: () => void;
  onSimulate: () => void;
  onOptimize: () => void;
  onCompare: () => void;
  isSimulating: boolean;
}

export const ShelterInputsForm: React.FC<ShelterInputsFormProps> = ({
  inputs,
  onChange,
  onResetLehDefaults,
  onSimulate,
  onOptimize,
  onCompare,
  isSimulating,
}) => {
  const updateField = (field: keyof ShelterInputs, value: any) => {
    onChange({
      ...inputs,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        {/* Header with Title & Reset Button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">Shelter Design Parameters</h2>
          </div>
          <button
            type="button"
            onClick={onResetLehDefaults}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer font-medium"
            title="Reset inputs to high-altitude Leh passive shelter baseline defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Leh Defaults</span>
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="space-y-4 text-xs">
          
          {/* Dimensions: Length, Width, Height */}
          <div>
            <label className="text-slate-300 font-semibold mb-1.5 flex items-center space-x-1.5">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              <span>Geometry Dimensions (L × W × H in meters)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-slate-400">Length (m)</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="30"
                  value={inputs.length_m}
                  onChange={(e) => updateField('length_m', parseFloat(e.target.value) || 6.0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 text-sm font-mono mt-0.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Width (m)</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="20"
                  value={inputs.width_m}
                  onChange={(e) => updateField('width_m', parseFloat(e.target.value) || 4.0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 text-sm font-mono mt-0.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Height (m)</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="6"
                  value={inputs.height_m}
                  onChange={(e) => updateField('height_m', parseFloat(e.target.value) || 2.8)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 text-sm font-mono mt-0.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Orientation Picker */}
          <div>
            <label className="text-slate-300 font-semibold mb-1.5 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Primary Orientation (Solar Facing Axis)</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['South', 'East', 'West', 'North'] as const).map((ori) => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => updateField('orientation', ori)}
                  className={`py-1.5 rounded text-xs font-semibold font-mono border transition ${
                    inputs.orientation === ori
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {ori}
                </button>
              ))}
            </div>
          </div>

          {/* Insulation Thickness Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Insulation Thickness</span>
              </label>
              <span className="font-mono text-cyan-400 font-bold">{inputs.insulation_thickness_mm} mm</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={inputs.insulation_thickness_mm}
              onChange={(e) => updateField('insulation_thickness_mm', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Window-to-Wall Ratio (%) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Window-to-Wall Ratio (WWR)</span>
              </label>
              <span className="font-mono text-amber-400 font-bold">{inputs.window_wall_ratio_pct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={inputs.window_wall_ratio_pct}
              onChange={(e) => updateField('window_wall_ratio_pct', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Envelope Material Selection */}
          <div>
            <label className="text-slate-300 font-semibold mb-1.5 block">Primary Envelope Material</label>
            <select
              value={inputs.material}
              onChange={(e) => updateField('material', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-medium focus:border-cyan-500 focus:outline-none"
            >
              <option value="Insulated Sandwich Panel">Insulated Sandwich Panel (PUF/PIR Core)</option>
              <option value="Concrete">Reinforced Concrete Envelope</option>
              <option value="Local Stone">Local Mountain Stone Masonry</option>
            </select>
          </div>

          {/* Thermal Mass & Occupants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Thermal Mass Level</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Low', 'Medium', 'High'] as const).map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => updateField('thermal_mass', tm)}
                    className={`py-1 rounded text-[11px] font-semibold border transition ${
                      inputs.thermal_mass === tm
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {tm}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>Occupants</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={inputs.occupants}
                onChange={(e) => updateField('occupants', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onSimulate}
          disabled={isSimulating}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-3 rounded-lg shadow-md shadow-cyan-500/20 text-xs font-mono tracking-wider transition cursor-pointer disabled:opacity-50"
        >
          {isSimulating ? 'SIMULATING...' : 'SIMULATE'}
        </button>

        <button
          type="button"
          onClick={onOptimize}
          disabled={isSimulating}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-lg shadow-md shadow-emerald-500/20 text-xs font-mono tracking-wider transition cursor-pointer disabled:opacity-50"
        >
          OPTIMIZE
        </button>

        <button
          type="button"
          onClick={onCompare}
          disabled={isSimulating}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 px-3 rounded-lg shadow-md shadow-amber-500/20 text-xs font-mono tracking-wider transition cursor-pointer disabled:opacity-50"
        >
          COMPARE
        </button>
      </div>

    </div>
  );
};
