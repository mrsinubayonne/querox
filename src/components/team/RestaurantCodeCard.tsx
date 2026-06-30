import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Copy, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Code restaurant unique pour la connexion PIN de l'équipe.
 * - Lecture depuis profiles.restaurant_code
 * - Si vide ET propriétaire connecté → bouton "Générer" (upsert sécurisé)
 */
export const RestaurantCodeCard: React.FC = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const ownerId = isTeamMember ? teamMemberSession?.ownerId : user?.id;
  const isOwner = !isTeamMember && !!user?.id && user.id === ownerId;
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    if (!ownerId) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('restaurant_code')
      .eq('id', ownerId)
      .maybeSingle();
    setCode(data?.restaurant_code || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [ownerId]);

  const generate = async () => {
    if (!isOwner || !ownerId) return;
    setGenerating(true);
    try {
      // Code court lisible (ex: QX-A3F9K)
      const newCode = 'QX-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      // Upsert: crée la ligne profil si elle n'existe pas
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { id: ownerId, restaurant_code: newCode },
          { onConflict: 'id' }
        );
      if (error) throw error;
      setCode(newCode);
      toast.success('Code restaurant généré', { description: newCode });
    } catch (e: any) {
      toast.error('Échec de génération', { description: e?.message });
    } finally {
      setGenerating(false);
    }
  };

  const copy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success('Code copié', { description: code });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Code restaurant
        </CardTitle>
        <CardDescription>
          Partagez-le avec votre équipe. Ils se connectent avec : ce code + leur pseudo + leur PIN.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        ) : code ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-mono text-2xl tracking-widest bg-muted px-4 py-2 rounded-md select-all">
              {code}
            </div>
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy className="w-4 h-4 mr-1" /> Copier
            </Button>
            <Button variant="ghost" size="sm" onClick={load} title="Recharger">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aucun code n'est encore défini pour ce restaurant.
            </p>
            {isOwner ? (
              <Button onClick={generate} disabled={generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Générer mon code restaurant
              </Button>
            ) : (
              <p className="text-sm text-amber-600">
                Demandez au propriétaire du compte de générer le code restaurant depuis sa session.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
