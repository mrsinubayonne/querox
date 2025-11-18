import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Database, Activity, HardDrive, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminSystemTab: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState({
    uptime: '99.9%',
    dbSize: 'N/A',
    apiCalls: 0,
    activeConnections: 0
  });

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    // Simulation de métriques système
    setSystemInfo({
      uptime: '99.9%',
      dbSize: '2.5 GB',
      apiCalls: 15420,
      activeConnections: 42
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Disponibilité</CardDescription>
            <CardTitle className="text-3xl">{systemInfo.uptime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Server className="w-4 h-4 mr-2" />
              Uptime système
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Base de Données</CardDescription>
            <CardTitle className="text-3xl">{systemInfo.dbSize}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Database className="w-4 h-4 mr-2" />
              Taille totale
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Appels API</CardDescription>
            <CardTitle className="text-3xl">{systemInfo.apiCalls.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Zap className="w-4 h-4 mr-2" />
              Aujourd'hui
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Connexions</CardDescription>
            <CardTitle className="text-3xl">{systemInfo.activeConnections}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="w-4 h-4 mr-2" />
              En temps réel
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>État du Système</CardTitle>
          <CardDescription>Performances et santé de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Serveurs API</span>
              </div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Base de Données</span>
              </div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Stockage</span>
              </div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Authentification</span>
              </div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisation des Ressources</CardTitle>
          <CardDescription>État des ressources système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Mémoire</span>
                <span className="text-sm text-muted-foreground">62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Stockage</span>
                <span className="text-sm text-muted-foreground">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
