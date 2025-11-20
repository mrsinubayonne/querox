import React from 'react';
import { Globe } from 'lucide-react';

const MultiCountryPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gestion Multi-Pays</h2>
        </div>
        <p className="text-slate-400">Extension internationale et gestion multi-pays en cours de développement.</p>
      </div>
    </div>
  );
};

export default MultiCountryPanel;
