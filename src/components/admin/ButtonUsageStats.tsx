import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MousePointer, TrendingUp, TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ButtonStat {
  button_name: string;
  button_category: string;
  click_count: number;
  last_clicked_at: string;
}

const ButtonUsageStats: React.FC = () => {
  const [stats, setStats] = useState<ButtonStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_button_usage_stats');
      
      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching button stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      navigation: 'bg-blue-500/20 text-blue-700 border-blue-300',
      tables: 'bg-green-500/20 text-green-700 border-green-300',
      orders: 'bg-orange-500/20 text-orange-700 border-orange-300',
      invoices: 'bg-purple-500/20 text-purple-700 border-purple-300',
      inventory: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
      accounting: 'bg-emerald-500/20 text-emerald-700 border-emerald-300',
      team: 'bg-pink-500/20 text-pink-700 border-pink-300',
      settings: 'bg-gray-500/20 text-gray-700 border-gray-300',
      menu: 'bg-red-500/20 text-red-700 border-red-300',
      reports: 'bg-indigo-500/20 text-indigo-700 border-indigo-300',
      general: 'bg-slate-500/20 text-slate-700 border-slate-300',
    };
    return colors[category] || colors.general;
  };

  const totalClicks = stats.reduce((sum, s) => sum + s.click_count, 0);
  const topButtons = stats.slice(0, 10);
  const leastUsedButtons = stats.length > 10 ? [...stats].reverse().slice(0, 5) : [];

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Total des clics</span>
              <MousePointer className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-3xl font-bold">{totalClicks.toLocaleString('fr-FR')}</div>
            <p className="text-xs opacity-80 mt-1">Tous boutons confondus</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Boutons trackés</span>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">fonctionnalités utilisées</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Moyenne par bouton</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">
              {stats.length > 0 ? Math.round(totalClicks / stats.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">clics en moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Used Buttons */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Boutons les plus utilisés
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {topButtons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MousePointer className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée de tracking disponible</p>
              <p className="text-sm mt-1">Les clics seront enregistrés au fur et à mesure de l'utilisation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topButtons.map((stat, index) => (
                <div 
                  key={stat.button_name} 
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{stat.button_name}</p>
                    <Badge variant="outline" className={getCategoryColor(stat.button_category)}>
                      {stat.button_category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{stat.click_count.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stat.last_clicked_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Least Used Buttons */}
      {leastUsedButtons.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Boutons les moins utilisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leastUsedButtons.map((stat) => (
                <div 
                  key={stat.button_name} 
                  className="flex items-center gap-4 p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{stat.button_name}</p>
                    <Badge variant="outline" className={getCategoryColor(stat.button_category)}>
                      {stat.button_category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{stat.click_count}</p>
                    <p className="text-xs text-muted-foreground">clics</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ButtonUsageStats;
