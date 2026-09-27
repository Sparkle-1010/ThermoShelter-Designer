import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import type { HourlyResult } from '../types/shelter';
import { Activity, Zap } from 'lucide-react';

interface ThermalGraphsProps {
  hourlyData: HourlyResult[];
}

export const ThermalGraphs: React.FC<ThermalGraphsProps> = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      {/* GRAPH 1: Outdoor Temp vs Indoor Temp */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              24-Hour Diurnal Temperature Profile
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded font-mono">
            Comfort Band: 18°C – 26°C
          </span>
        </div>

        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                unit="°C"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                domain={['dataMin - 3', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any, name: any) => [`${value} °C`, name === 'indoor_temp' ? 'Indoor Temp' : 'Outdoor Temp']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Comfort Zone Reference Area (18°C to 26°C) */}
              <ReferenceArea y1={18} y2={26} fill="#059669" fillOpacity={0.15} stroke="#059669" strokeDasharray="3 3" />
              <ReferenceLine y={18} stroke="#10b981" strokeDasharray="3 3" label={{ value: '18°C Min Comfort', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={26} stroke="#10b981" strokeDasharray="3 3" label={{ value: '26°C Max Comfort', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="outdoor_temp"
                name="Outdoor Ambient (°C)"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="indoor_temp"
                name="Indoor Temp (°C)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center font-mono">
          Outdoor ambient vs simulated indoor temperature integration over 24 hours
        </p>
      </div>

      {/* GRAPH 2: Heat Gains vs Losses Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Hourly Energy Balance Breakdown (Watts)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            (+) Gain / (-) Loss
          </span>
        </div>

        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis unit=" W" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val} W`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <ReferenceLine y={0} stroke="#475569" />

              <Area type="monotone" dataKey="q_solar" name="Solar Heat Gain (W)" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="q_internal" name="Occupant Heat (W)" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="q_conduction" name="Envelope Conduction (W)" fill="#ef4444" stroke="#ef4444" fillOpacity={0.2} />
              <Area type="monotone" dataKey="q_infiltration" name="Air Infiltration Loss (W)" fill="#a855f7" stroke="#a855f7" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center font-mono">
          Instantaneous thermal heat fluxes: Solar radiation, occupants, conduction & air leakage
        </p>
      </div>

    </div>
  );
};
