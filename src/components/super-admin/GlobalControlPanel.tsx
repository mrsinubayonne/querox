import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  HeadphonesIcon, 
  DollarSign, 
  FileText, 
  Code2,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface GlobalControlPanelProps {
  activeMode: 'super-admin' | 'support' | 'finance' | 'audit' | 'developer';
  setActiveMode: (mode: 'super-admin' | 'support' | 'finance' | 'audit' | 'developer') => void;
  userEmail: string;
}

const GlobalControlPanel: React.FC<GlobalControlPanelProps> = ({ 
  activeMode, 
  setActiveMode, 
  userEmail 
}) => {
  const modes = [
    { id: 'super-admin' as const, label: 'Super Admin', icon: Shield, color: 'text-red-500' },
    { id: 'support' as const, label: 'Support', icon: HeadphonesIcon, color: 'text-blue-500' },
    { id: 'finance' as const, label: 'Finance', icon: DollarSign, color: 'text-green-500' },
    { id: 'audit' as const, label: 'Audit', icon: FileText, color: 'text-purple-500' },
    { id: 'developer' as const, label: 'Développeur', icon: Code2, color: 'text-orange-500' },
  ];

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/95 to-primary/80 backdrop-blur-lg border-b border-primary/20 shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Title and Status */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                QUEROX Super Admin
                <Badge variant="secondary" className="bg-white/20 text-white">
                  360°
                </Badge>
              </h1>
              <p className="text-sm text-white/80">{userEmail}</p>
            </div>
          </div>

          {/* Center: Mode Switcher */}
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <Button
                  key={mode.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMode(mode.id)}
                  className={`${
                    isActive 
                      ? 'bg-white text-primary shadow-lg' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-all duration-200`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? mode.color : ''}`} />
                  {mode.label}
                </Button>
              );
            })}
          </div>

          {/* Right: Real-time indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Système en ligne</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">API: 99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalControlPanel;
