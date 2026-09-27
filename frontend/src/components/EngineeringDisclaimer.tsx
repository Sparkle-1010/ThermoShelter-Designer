import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EngineeringDisclaimer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            <strong className="text-slate-300 font-mono">ENGINEERING DISCLAIMER:</strong> Prototype decision-support model. Results are illustrative lumped-capacitance ODE simulations intended for preliminary architectural trade-off analysis and require full CFD/field engineering validation before real-world defence deployment.
          </p>
        </div>
        <div className="shrink-0 text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          SIH 2026 • Problem Statement SIH26051
        </div>
      </div>
    </footer>
  );
};
