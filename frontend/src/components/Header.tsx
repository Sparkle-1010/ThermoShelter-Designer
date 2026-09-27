import React from 'react';
import { Shield, Thermometer, Layers, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title & Branding */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 rounded-xl shadow-inner shadow-cyan-500/10">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                ThermoShelter Designer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                SIH26051
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Location-aware passive shelter design for extreme climates • Internal Demo MVP
            </p>
          </div>
        </div>

        {/* Feature Pill Badges */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Lumped-Capacitance Model</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>24h Diurnal Sim</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Parametric Optimizer</span>
          </div>
        </div>

      </div>
    </header>
  );
};
