import React from 'react';
import { MapPin, Sun, Wind, Mountain, Thermometer, Database } from 'lucide-react';
import type { ClimateLocation } from '../types/shelter';

interface LocationCardProps {
  locations: ClimateLocation[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  currentClimate: ClimateLocation | null;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  currentClimate,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white font-mono">Location & Environment</h2>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center space-x-3">
          <label htmlFor="location-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Zone:
          </label>
          <select
            id="location-select"
            value={selectedLocationId}
            onChange={(e) => onSelectLocation(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-300 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 px-3 py-1.5 font-semibold cursor-pointer outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Climate Data Indicator Badge */}
      <div className="mt-3.5 mb-4 flex items-center justify-between">
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-md">
          <Database className="w-3.5 h-3.5" />
          <span>Demo Climate Data (API-Ready Architecture)</span>
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {currentClimate?.region || 'Trans-Himalayas'}
        </span>
      </div>

      {/* Climate Parameters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Altitude */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs font-medium space-x-1.5 mb-1">
            <Mountain className="w-3.5 h-3.5 text-slate-400" />
            <span>Altitude</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currentClimate?.altitude_m.toLocaleString() || '3,500'} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
        </div>

        {/* Outdoor Temp Range */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs font-medium space-x-1.5 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <span>Design Temp Range</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currentClimate ? `${currentClimate.temp_min}°C to ${currentClimate.temp_max}°C` : '-15°C to 2°C'}
          </div>
        </div>

        {/* Solar Irradiance */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs font-medium space-x-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak Solar Radiation</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currentClimate?.peak_solar_wm2 || 950} <span className="text-xs font-normal text-slate-400">W/m²</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs font-medium space-x-1.5 mb-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Avg Wind Speed</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            4.5 <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
