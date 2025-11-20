import React from 'react';
import { Zap } from 'lucide-react';

const TechnicalPerformancePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Performances Techniques</h2>
        </div>
        <p className="text-slate-400">Monitoring des performances et uptime API en cours de développement.</p>
      </div>
    </div>
  );
};

export default TechnicalPerformancePanel;
